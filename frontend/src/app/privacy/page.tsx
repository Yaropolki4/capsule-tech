import type { Metadata } from "next";
import { PrivacyPolicy } from "@/shared/ui/privacy-policy";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных — Capsule AI",
};

export default function PrivacyPage() {
  return (
    <div className="bg-background w-full h-full overflow-auto">
      <main className="max-w-[760px] mx-auto px-4 md:px-12 pt-10 pb-20">
        <PrivacyPolicy />
      </main>
    </div>
  );
}
