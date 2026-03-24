import Link from "next/link";
import { Logo } from "./Logo";
import { AuthNav } from "./auth/AuthNav";
import { HeaderNavLinks } from "./auth/HeaderNavLinks";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#06060a]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <HeaderNavLinks />

        <AuthNav />
      </div>
    </header>
  );
}

