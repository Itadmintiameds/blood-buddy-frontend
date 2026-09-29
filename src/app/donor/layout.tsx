import type { ReactNode } from "react";

import { DualLanguageProvider } from "@/app/components/common/Bilingual";

// Donor screens always show English and Kannada together (the language toggle
// only reorders which one is primary), so wrap the whole subtree in dual mode.
export default function DonorLayout({ children }: { children: ReactNode }) {
  return <DualLanguageProvider>{children}</DualLanguageProvider>;
}
