import { RecipientAuthGuard } from "@/app/components/auth/RecipientAuthGuard";
import { RecipientSearchScreen } from "@/app/recipient/search/components/RecipientSearchScreen";

export default function RecipientSearchPage() {
  return (
    <RecipientAuthGuard>
      <RecipientSearchScreen />
    </RecipientAuthGuard>
  );
}
