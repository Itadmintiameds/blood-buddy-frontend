import { BloodCentreAuthGuard } from "@/app/components/auth/AuthGuard";
import { AddAvailabilityScreen } from "@/app/blood-centre/availability/components/AddAvailabilityScreen";

export default function AddAvailabilityPage() {
  return (
    <BloodCentreAuthGuard>
      <AddAvailabilityScreen />
    </BloodCentreAuthGuard>
  );
}
