import React, { useState } from "react";
import { Card, Form, Input, InputNumber, DatePicker, Select, Button, Space, Alert, Typography } from "antd";
import dayjs from "dayjs";

const { Title, Paragraph, Text } = Typography;

interface Target {
  mode: "energy" | "soc" | "time";
  value: number;
  ready_by: string;
}

interface Constraints {
  max_power_kw?: number;
  grid_limit_kw?: number;
}

interface ProfilePayload {
  id?: string;
  name?: string;
  target: Target;
  constraints?: Constraints;
}

const defaultReadyBy = dayjs().add(2, "hour");

export const MCSProfileWizard: React.FC = () => {
  const [form] = Form.useForm<ProfilePayload>();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: ProfilePayload) => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const payload = {
        profile: {
          ...values,
          target: {
            ...values.target,
            ready_by: values.target.ready_by,
          },
        },
      };
      const res = await fetch("/api/mcs/profiles/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }
      const data = await res.json();
      setPlan(data.plan);
    } catch (e: any) {
      setError(e?.message || "Failed to simulate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 720 }} title={<Title level={4}>MCS Profile Wizard (beta)</Title>}>
      <Paragraph>Enter intent and constraints, then preview the generated charging plan.</Paragraph>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          target: { mode: "soc", value: 80, ready_by: defaultReadyBy.toISOString() },
          constraints: { max_power_kw: 150, grid_limit_kw: 120 },
        }}
        onFinish={onFinish}
      >
        <Form.Item label="Name" name="name">
          <Input placeholder="Fleet A overnight" />
        </Form.Item>

        <Form.Item label="Objective" name="objective" initialValue="min_cost">
          <Select
            options={[
              { label: "Minimize cost", value: "min_cost" },
              { label: "Maximize speed", value: "max_speed" },
              { label: "Balance grid", value: "balance_grid" },
            ]}
          />
        </Form.Item>

        <Title level={5}>Target</Title>
        <Space align="start">
          <Form.Item
            label="Mode"
            name={["target", "mode"]}
            rules={[{ required: true, message: "Target mode required" }]}
          >
            <Select
              style={{ width: 160 }}
              options={[
                { label: "Energy (kWh)", value: "energy" },
                { label: "State of Charge (%)", value: "soc" },
                { label: "Time window", value: "time" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Value"
            name={["target", "value"]}
            rules={[{ required: true, message: "Value required" }]}
          >
            <InputNumber min={0} max={1000} />
          </Form.Item>

          <Form.Item
            label="Ready by"
            name={["target", "ready_by"]}
            rules={[{ required: true, message: "Ready by required" }]}
          >
            <DatePicker
              showTime
              style={{ width: 220 }}
              defaultValue={defaultReadyBy}
              onChange={(val) => {
                form.setFieldValue(["target", "ready_by"], val ? val.toISOString() : undefined);
              }}
            />
          </Form.Item>
        </Space>

        <Title level={5}>Constraints</Title>
        <Space align="start">
          <Form.Item label="Max power (kW)" name={["constraints", "max_power_kw"]}>
            <InputNumber min={0} max={500} />
          </Form.Item>
          <Form.Item label="Grid limit (kW)" name={["constraints", "grid_limit_kw"]}>
            <InputNumber min={0} max={500} />
          </Form.Item>
        </Space>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Preview Plan
          </Button>
        </Form.Item>
      </Form>

      {error && <Alert type="error" message={error} showIcon style={{ marginTop: 12 }} />}
      {plan && (
        <Card style={{ marginTop: 16 }} title="Plan Preview">
          <Paragraph>
            Showing first 3 buckets:
          </Paragraph>
          <pre style={{ background: "#f6f8fa", padding: 12 }}>
            {JSON.stringify(plan.buckets?.slice(0, 3), null, 2)}
          </pre>
          <Text type="secondary">Full plan length: {plan.buckets?.length}</Text>
        </Card>
      )}
    </Card>
  );
};

export default MCSProfileWizard;
