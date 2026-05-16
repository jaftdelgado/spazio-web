export default function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-sky-700">
          Dashboard
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">
          Vista inicial del administrador
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Este contenido corresponde a la ruta `/admin`. Al entrar a rutas hijas,
          solo debe reemplazarse esta zona central.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Zona variable</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            Contenido del `children`
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Comportamiento</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            Sidebar y topbar permanecen
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-500">Siguiente paso</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            Sustituir placeholders por componentes reales
          </p>
        </div>
      </div>
    </section>
  );
}
