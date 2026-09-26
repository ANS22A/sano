export default function PublicLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-accent/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin"></div>
        </div>
        <span className="text-accent/60 text-xs tracking-widest uppercase font-medium animate-pulse">
          Sano Luna
        </span>
      </div>
    </div>
  )
}
