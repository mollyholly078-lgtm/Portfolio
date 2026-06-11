interface Props {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg'
}

export default function PlayerAvatar({ name, color, size = 'md' }: Props) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: color + '30', color, border: `2px solid ${color}` }}
    >
      {initials}
    </div>
  )
}
