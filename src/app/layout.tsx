// import type { Metadata } from "next";
// import "./globals.css";
//
// export const metadata: Metadata = {
//   title: "Blood Buddy",
//   description: "Blood Buddy blood centre management",
// };
//
// export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   );
// }

// import type { Metadata } from "next";
// import { LanguageProvider } from "@/contexts/LanguageContext";
//
// export const metadata: Metadata = {
//   title: "Blood Buddy",
//   description: "Blood donation and recipient platform",
// };
//
// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body>
//         <LanguageProvider>{children}</LanguageProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";

import "./globals.css";

import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Blood Buddy",
  description: "Blood Buddy blood centre management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
