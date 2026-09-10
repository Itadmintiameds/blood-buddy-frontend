"use client";

import { SuperAdminAuthGuard } from "../components/SuperAdminAuthGuard";
import { SuperAdminDashboard } from "./components/SuperAdminDashboardScreen";

export default function SuperAdminDashboardPage() {
  return (
    <SuperAdminAuthGuard>
      <SuperAdminDashboard />
    </SuperAdminAuthGuard>
  );
}
