import { SuperAdminAuthGuard } from "@/app/components/auth/SuperAdminAuthGuard";
import { SuperAdminDashboard } from "./components/SuperAdminDashboardScreen";

export default function SuperAdminDashboardPage() {
  return (
    <SuperAdminAuthGuard>
      <SuperAdminDashboard />
    </SuperAdminAuthGuard>
  );
}
