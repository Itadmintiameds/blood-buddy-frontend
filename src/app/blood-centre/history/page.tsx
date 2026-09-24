import { BloodCentreShell } from "@/app/blood-centre/components/BloodCentreShell";
import { BloodGroupHistoryScreen } from "./components/BloodGroupHistoryScreen";

export default function BloodCentreHistoryPage() {
  return (
    <BloodCentreShell>
      <BloodGroupHistoryScreen />
    </BloodCentreShell>
  );
}
