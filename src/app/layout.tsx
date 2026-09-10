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
import { Inter, Work_Sans } from "next/font/google";

import "./globals.css";

import { LanguageProvider } from "@/contexts/LanguageContext";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-work",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto",
  display: "swap",
});

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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${workSans.variable} ${inter.variable}`}
    >
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
