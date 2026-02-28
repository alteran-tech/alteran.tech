import type { Metadata } from "next";
import { AncientText } from "@/components/ui";
import { getSettings } from "@/lib/actions/settings";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Настройки — Admin" };

export const dynamic = "force-dynamic";

const DEFAULTS = {
  contact_github: "https://github.com/alteran-tech",
  contact_email: "hello@alteran.tech",
};

export default async function SettingsPage() {
  const settings = await getSettings(["contact_github", "contact_email"]);

  const githubUrl = settings.contact_github ?? DEFAULTS.contact_github;
  const email = settings.contact_email ?? DEFAULTS.contact_email;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-1">
        <AncientText as="h1" className="!text-2xl">
          settings
        </AncientText>
        <p className="text-ancient-aqua/50 text-sm uppercase tracking-wider">
          Настройки сайта
        </p>
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ancient-teal/80 uppercase tracking-wider">
            Контакты
          </h2>
          <SettingsForm initialGithubUrl={githubUrl} initialEmail={email} />
        </section>
      </div>
    </div>
  );
}
