import { DonorAuthGuard } from "@/app/components/auth/DonorAuthGuard";
import { DonorDashboardScreen } from "@/app/donor/dashboard/components/DonorDashboardScreen";

export default function DonorDashboardPage() {
  return (
    <DonorAuthGuard>
      <DonorDashboardScreen />
    </DonorAuthGuard>
  );
}
