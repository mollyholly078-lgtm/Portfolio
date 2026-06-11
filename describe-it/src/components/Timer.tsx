interface Props {
  timeLeft: number
  total?: number
}

export default function Timer({ timeLeft, total = 60 }: Props) {
  const pct = (timeLeft / total) * 100
  const isLow = timeLeft <= 10
  const isCritical = timeLeft <= 5

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-mono font-bold ${isCritical ? 'text-red-400' : isLow ? 'text-yellow-400' : 'text-text'}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="h-2 bg-surface-light rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical ? 'bg-red-500' : isLow ? 'bg-yellow-500' : 'bg-primary'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
