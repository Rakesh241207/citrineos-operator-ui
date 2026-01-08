// SPDX-FileCopyrightText: 2025 Contributors to the CitrineOS Project
//
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Card, Typography } from 'antd';
import { Route, Routes } from 'react-router-dom';
import { MCSProfileWizard } from '../../components/MCSProfileWizard';

const { Title, Paragraph } = Typography;

const McsProfilesPage: React.FC = () => {
  return (
    <Card title={<Title level={4}>Managed Charging Profiles (MCS)</Title>}>
      <Paragraph>
        Create and simulate a Managed Charging System (MCS) profile. This sends a
        preview request to the backend at <code>/api/mcs/profiles/simulate</code> and
        shows the resulting time-bucketed plan.
      </Paragraph>
      <MCSProfileWizard />
    </Card>
  );
};

export const routes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<McsProfilesPage />} />
    </Routes>
  );
};
