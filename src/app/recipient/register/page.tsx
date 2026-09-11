import { RecipientAuthGuard } from "@/app/components/auth/RecipientAuthGuard";
import { RecipientRegistrationScreen } from "@/app/recipient/register/components/RecipientRegistrationScreen";

export default function RecipientRegisterPage() {
  return (
    <RecipientAuthGuard>
      <RecipientRegistrationScreen />
    </RecipientAuthGuard>
  );
}
