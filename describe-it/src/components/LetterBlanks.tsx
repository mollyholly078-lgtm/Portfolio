interface Props {
  word: string
}

export default function LetterBlanks({ word }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-1 my-4">
      {word.split('').map((char, i) => {
        if (char === ' ') {
          return <span key={i} className="w-3" />
        }
        const isLetter = /[a-zA-Z0-9]/.test(char)
        return (
          <span
            key={i}
            className="letter-blank"
            style={{
              width: isLetter ? '2rem' : '0',
              height: isLetter ? '2.5rem' : '0',
              borderBottom: isLetter ? '3px solid var(--color-text)' : 'none',
            }}
          >
            {isLetter ? '' : char}
          </span>
        )
      })}
    </div>
  )
}
