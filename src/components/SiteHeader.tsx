import { LogoLink } from "./LogoLink";
import { AuthNav } from "./auth/AuthNav";
import { HeaderNavLinks } from "./auth/HeaderNavLinks";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div className="relative border-b border-white/[.06] bg-[#080810]/85 backdrop-blur-2xl">
        {/* Subtle gradient sheen — glassmorphism accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-400/[.03] via-transparent to-violet-400/[.03]"
        />
        {/* Bottom edge highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent"
        />
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <LogoLink />
          <HeaderNavLinks />
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
