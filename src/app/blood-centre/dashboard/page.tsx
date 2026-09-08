import { BloodCentreAuthGuard } from "@/app/components/auth/BloodCentreAuthGuard";
import { BloodCentreDashboardScreen } from "./bloodCenter/page";

export default function BloodCentreDashboardPage() {
  return (
    <BloodCentreAuthGuard>
      <BloodCentreDashboardScreen />
    </BloodCentreAuthGuard>
  );
}
