export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-lg font-bold text-brand-fg">
            L
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Lumia</h1>
          <p className="text-sm text-slate-500">
            Atendimento automatizado com IA
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
