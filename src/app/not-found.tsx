import Link from "next/link";
import { StargateRing } from "@/components/effects";
import { AncientText, GlowButton } from "@/components/ui";

/**
 * Custom 404 page with Alteran aesthetic.
 * Minimalist design: Stargate ring, Alteran-font title, return button.
 */
export default function NotFound() {
  return (
    <main id="main-content" role="main" className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
      {/* Decorative ring */}
      <div className="mb-8 opacity-40">
        <StargateRing size="sm" spinning={false} />
      </div>

      {/* Error text */}
      <AncientText as="h1" glow className="mb-4">
        gate address not found
      </AncientText>

      <p className="text-6xl font-bold text-ancient-teal/30 mb-2">404</p>

      <p className="text-ancient-aqua/50 max-w-sm mb-8 leading-relaxed">
        Введённые координаты не совпадают ни с одним известным адресом в сети
        звёздных врат. Пункт назначения мог быть удалён или никогда не существовал.
      </p>

      {/* Return button */}
      <Link href="/">
        <GlowButton variant="secondary" size="lg">
          Вернуться на главную
        </GlowButton>
      </Link>
    </main>
  );
}
