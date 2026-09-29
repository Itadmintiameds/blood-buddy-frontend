import type { ReactNode } from "react";

import { DualLanguageProvider } from "@/app/components/common/Bilingual";

// Recipient screens always show English and Kannada together (the language
// toggle only reorders which one is primary), so wrap the subtree in dual mode.
export default function RecipientLayout({ children }: { children: ReactNode }) {
  return <DualLanguageProvider>{children}</DualLanguageProvider>;
}
