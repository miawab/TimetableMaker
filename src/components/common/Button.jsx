export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#06060a] disabled:opacity-30 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-2.5 text-sm' }
  const variants = {
    primary:   'bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500',
    secondary: 'bg-white/[0.06] text-slate-300 border border-white/10 hover:bg-white/[0.1] hover:border-white/20 focus:ring-white/20',
    danger:    'bg-red-600 text-white hover:bg-red-500 focus:ring-red-400',
    ghost:     'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] focus:ring-white/20',
    success:   'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-400',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}
