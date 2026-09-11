import { DonorAuthGuard } from "@/app/components/auth/DonorAuthGuard";
import { UpdateDonorAvailabilityScreen } from "@/app/donor/availability/components/UpdateDonorAvailabilityScreen";

export default function DonorAvailabilityPage() {
  return (
    <DonorAuthGuard>
      <UpdateDonorAvailabilityScreen />
    </DonorAuthGuard>
  );
}
