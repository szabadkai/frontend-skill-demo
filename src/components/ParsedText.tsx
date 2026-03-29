

interface Props {
  text: string;
}

export default function ParsedText({ text }: Props) {
  // Split the string by words starting with # or @
  const parts = text.split(/(#[a-zA-Z0-9_-]+|@[a-zA-Z0-9_-]+)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('#')) {
          return (
            <span key={i} style={{ 
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)', 
              color: 'var(--accent)', 
              padding: '0.15rem 0.5rem', 
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginLeft: '0.2rem',
              marginRight: '0.2rem',
              display: 'inline-block',
              transform: 'translateY(-1px)'
            }}>
              {part}
            </span>
          );
        } else if (part.startsWith('@')) {
          return (
            <span key={i} style={{ 
              background: 'color-mix(in srgb, var(--success) 15%, transparent)', 
              color: 'var(--success)', 
              padding: '0.15rem 0.5rem', 
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginLeft: '0.2rem',
              marginRight: '0.2rem',
              display: 'inline-block',
              transform: 'translateY(-1px)'
            }}>
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
