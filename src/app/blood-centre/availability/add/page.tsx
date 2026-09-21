import { BloodCentreAuthGuard } from "@/app/components/auth/BloodCentreAuthGuard";
import { AddAvailabilityScreen } from "@/app/blood-centre/availability/components/AddAvailabilityScreen";

export default function AddAvailabilityPage() {
  return (
    <BloodCentreAuthGuard>
      <AddAvailabilityScreen />
    </BloodCentreAuthGuard>
  );
}
