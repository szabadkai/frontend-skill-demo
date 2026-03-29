

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
              background: 'var(--accent)', 
              color: '#fff', 
              padding: '0.1rem 0.4rem', 
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginLeft: '0.2rem',
              marginRight: '0.2rem'
            }}>
              {part}
            </span>
          );
        } else if (part.startsWith('@')) {
          return (
            <span key={i} style={{ 
              background: 'var(--success)', 
              color: '#fff', 
              padding: '0.1rem 0.4rem', 
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginLeft: '0.2rem',
              marginRight: '0.2rem'
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
