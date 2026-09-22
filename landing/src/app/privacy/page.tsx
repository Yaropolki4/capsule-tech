import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PrivacyPolicy } from "@/components/privacy-policy";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных — Capsule AI",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 w-full max-w-[760px] mx-auto px-6 sm:px-10 pt-10 pb-20">
        <PrivacyPolicy />
      </main>
      <SiteFooter />
    </div>
  );
}
