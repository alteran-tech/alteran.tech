import { ChevronDivider, ScrollReveal } from "@/components/effects";
import { GlassPanel, AncientText, GlowButton, ShimmerBorder } from "@/components/ui";
import { getSettings } from "@/lib/actions/settings";

const DEFAULTS = {
  contact_github: "https://github.com/alteran-tech",
  contact_email: "hello@alteran.tech",
};

const GitHubIcon = (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const EmailIcon = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

/**
 * Contact section with social links from DB (siteSettings).
 * Async Server Component -- fetches contact settings on each request.
 */
export async function Contact() {
  const settings = await getSettings(["contact_github", "contact_email"]);

  const githubUrl = settings.contact_github ?? DEFAULTS.contact_github;
  const email = settings.contact_email ?? DEFAULTS.contact_email;

  const contactLinks = [
    {
      label: "GitHub",
      href: githubUrl,
      description: "Проекты с открытым исходным кодом",
      icon: GitHubIcon,
    },
    {
      label: "Email",
      href: `mailto:${email}`,
      description: "Прямой канал связи",
      icon: EmailIcon,
    },
  ];

  return (
    <section id="contact" className="py-16 sm:py-24">
      <ChevronDivider glowing />

      <div className="mt-12 sm:mt-16 space-y-12">
        {/* Section heading */}
        <ScrollReveal>
          <div className="text-center space-y-3">
            <AncientText as="h2" glow>
              contact
            </AncientText>
            <p className="text-ancient-aqua/60 text-sm tracking-wider uppercase">
              Связаться
            </p>
          </div>
        </ScrollReveal>

        {/* Contact card with shimmer border */}
        <ScrollReveal delay={100}>
          <div className="max-w-xl mx-auto">
            <ShimmerBorder>
              <GlassPanel variant="default" padding="lg">
                <div className="space-y-8">
                  <p className="text-center text-ancient-aqua/70 leading-relaxed">
                    Хотите работать вместе, обсудить проект или узнать подробнее?
                    Свяжитесь с нами через любой из этих каналов.
                  </p>

                  {/* Contact links */}
                  <div className="space-y-4">
                    {contactLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-ancient-teal/5 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ancient-teal"
                      >
                        <span className="text-ancient-teal/60 group-hover:text-ancient-teal transition-colors duration-200">
                          {link.icon}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ancient-aqua/90 group-hover:text-ancient-teal transition-colors duration-200">
                            {link.label}
                          </p>
                          <p className="text-xs text-ancient-aqua/40">
                            {link.description}
                          </p>
                        </div>
                        <svg
                          className="w-4 h-4 text-ancient-teal/30 group-hover:text-ancient-teal/60 group-hover:translate-x-0.5 transition-all duration-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </a>
                    ))}
                  </div>

                  {/* Direct email CTA */}
                  <div className="text-center pt-2">
                    <a href={`mailto:${email}`}>
                      <GlowButton variant="primary" size="md">
                        Написать
                      </GlowButton>
                    </a>
                  </div>
                </div>
              </GlassPanel>
            </ShimmerBorder>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
