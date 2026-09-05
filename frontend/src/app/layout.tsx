import type { Metadata } from "next";
import { Space_Grotesk, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/fsd-app";
import { Toaster } from "@/shared/ui/ui/sonner";
import { ThemeProvider } from "@/shared/providers/theme-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Capsule AI",
  description:
    "Capsule AI — платформа для вашего гардероба: создавайте капсульные образы, " +
    "примеряйте вещи в виртуальной примерочной и получайте рекомендации от AI-стилиста.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Toaster />
          <div className="fixed top-0 left-0 right-0 bottom-0 flex max-md:flex-col-reverse">
            <RootProvider>{children}</RootProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
