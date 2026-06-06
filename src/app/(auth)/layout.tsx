import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 dark:from-slate-900 to-slate-200 dark:to-slate-950 p-4">
      {/* Decorative brand glow. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-0 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand/20 via-brand-secondary/10 to-transparent blur-3xl"
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand font-display text-lg font-bold text-brand-fg shadow-lg shadow-brand/20 transition hover:opacity-90"
          >
            L
          </Link>
          <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-100">
            Lumia
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Atendimento automatizado com IA
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
