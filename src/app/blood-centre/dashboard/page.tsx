import { BloodCentreAuthGuard } from "@/app/components/auth/BloodCentreAuthGuard";
import { BloodCentreDashboardScreen } from "./bloodCenter/BloodCentreDashboardScreen";

export default function BloodCentreDashboardPage() {
  return (
    <BloodCentreAuthGuard>
      <BloodCentreDashboardScreen />
    </BloodCentreAuthGuard>
  );
}
