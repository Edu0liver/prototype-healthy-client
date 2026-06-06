import Link from "next/link";

// Public marketing shell (no auth) for the landing/pricing pages.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-display text-sm font-bold text-brand-fg">
              L
            </span>
            <span className="font-display font-semibold text-slate-900">
              Lumia
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg transition hover:opacity-90"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto max-w-6xl px-6 text-sm text-slate-400">
          © {new Date().getFullYear()} Lumia · Atendimento automatizado com IA
        </div>
      </footer>
    </div>
  );
}
