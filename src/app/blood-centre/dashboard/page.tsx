import { BloodCentreShell } from "@/app/blood-centre/components/BloodCentreShell";
import { BloodCentreDashboardScreen } from "./bloodCenter/BloodCentreDashboardScreen";

export default function BloodCentreDashboardPage() {
  return (
    <BloodCentreShell>
      <BloodCentreDashboardScreen />
    </BloodCentreShell>
  );
}
