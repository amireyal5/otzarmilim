
'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import LoginPage from '@/components/LoginPage';
import DashboardLayout from '@/components/DashboardLayout';

export default function Home() {
  const { loggedInUser } = useContext(AppContext);

  if (!loggedInUser) {
    return <LoginPage />;
  }

  return <DashboardLayout />;
}
