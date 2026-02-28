import { ChevronDivider, ScrollReveal } from "@/components/effects";
import { GlassPanel, AncientText } from "@/components/ui";

const techCategories = [
  {
    label: "Языки",
    items: ["TypeScript", "Python", "Go", "Rust"],
  },
  {
    label: "Фронтенд",
    items: ["React", "Next.js", "Tailwind CSS", "Vue"],
  },
  {
    label: "Бэкенд",
    items: ["Node.js", "FastAPI", "PostgreSQL", "Redis"],
  },
  {
    label: "DevOps",
    items: ["Docker", "Vercel", "AWS", "CI/CD"],
  },
];

/**
 * About section with company description and tech stack.
 * Server Component -- static content.
 */
export function About() {
  return (
    <section id="about" className="py-16 sm:py-24">
      <ChevronDivider glowing />

      <div className="mt-12 sm:mt-16 space-y-12">
        {/* Section heading */}
        <ScrollReveal>
          <div className="text-center space-y-3">
            <AncientText as="h2" glow>
              about
            </AncientText>
            <p className="text-ancient-aqua/60 text-sm tracking-wider uppercase">
              О компании
            </p>
          </div>
        </ScrollReveal>

        {/* Bio panel */}
        <ScrollReveal delay={100}>
          <GlassPanel variant="default" padding="lg" className="max-w-3xl mx-auto">
            <div className="space-y-4 text-ancient-aqua/80 leading-relaxed">
              <p>
                Alteran — команда разработчиков, увлечённых созданием производительного и
                элегантного программного обеспечения. Наш опыт охватывает интерактивные
                фронтенды и масштабируемые бэкенд-системы — всегда с прицелом на чистую
                архитектуру и удобство для пользователя.
              </p>
              <p>
                Мы верим в качество, а не количество — каждый проект это возможность
                раздвинуть границы и создать нечто значимое. Будь то real-time приложение,
                API-интеграция или дизайн-система, мы подходим к каждой задаче с
                любопытством и точностью.
              </p>
            </div>
          </GlassPanel>
        </ScrollReveal>

        {/* Tech stack grid */}
        <ScrollReveal delay={200}>
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-ancient-teal glow-text-subtle mb-6 text-center">
              Технологический арсенал
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {techCategories.map((category) => (
                <GlassPanel
                  key={category.label}
                  variant="dark"
                  padding="sm"
                  className="space-y-3"
                >
                  <p className="text-xs uppercase tracking-wider text-ancient-teal/70 font-medium">
                    {category.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {category.items.map((item) => (
                      <span
                        key={item}
                        className="inline-block px-2 py-0.5 text-xs rounded-md bg-ancient-teal/8 text-ancient-aqua/70 border border-ancient-teal/10"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
