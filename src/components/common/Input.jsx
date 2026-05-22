export default function Input({ label, hint, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>}
      <input
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-white/[0.04] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all ${
          error
            ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/70'
            : 'border-white/10 hover:border-white/20 focus:ring-indigo-500/20 focus:border-indigo-500/60'
        }`}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-[11px] text-slate-600">{hint}</p>}
      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

export function Select({ label, hint, error, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>}
      <select
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-[#0e0e18] text-slate-200 focus:outline-none focus:ring-2 transition-all ${
          error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20 focus:ring-indigo-500/20 focus:border-indigo-500/60'
        }`}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="mt-1.5 text-[11px] text-slate-600">{hint}</p>}
      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
    </div>
  )
}
