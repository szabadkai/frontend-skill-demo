import React, { useEffect, useState, Suspense } from 'react';
import { Sun, Moon } from 'lucide-react';

// Dynamically import versions so CSS chunks don't aggressively collide
const AppV1 = React.lazy(() => import('./v1/App'));
const AppV2 = React.lazy(() => import('./v2/App'));
const AppV3 = React.lazy(() => import('./v3/App'));
const AppV4 = React.lazy(() => import('./v4/App'));

function MainRouter() {
  const [version, setVersion] = useState<string>('4');
  
  // V1 natively dark, V2 light, V3 light, V4 dark. 
  // Let's create a map of native themes so default is smooth:
  const nativeIsDark: Record<string, boolean> = {
    '1': true,
    '2': false,
    '3': false,
    '4': true,
  };

  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('v') || '4';
    const initDark = params.get('dark');
    
    setVersion(v);
    const darkBool = initDark !== null ? initDark === 'true' : nativeIsDark[v];
    setIsDark(darkBool);

    updateBodyTheme(v, darkBool);
  }, []);

  const updateBodyTheme = (v: string, dark: boolean) => {
    // V1 and V4 are natively dark, so if they are NOT dark, we append `.light`
    // V2 and V3 are natively light, so if they ARE dark, we append `.dark`
    let className = `theme-v${v}`;
    if (['1', '4'].includes(v) && !dark) {
      className += ' light';
    } else if (['2', '3'].includes(v) && dark) {
      className += ' dark';
    }
    
    document.body.className = className;
  };

  const setV = (v: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('v', v);
    
    // reset to the native theme of that version if they don't explicitly pass dark
    const nextDark = nativeIsDark[v];
    url.searchParams.set('dark', String(nextDark));
    
    window.history.pushState({}, '', url);
    setVersion(v);
    setIsDark(nextDark);
    updateBodyTheme(v, nextDark);
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    const url = new URL(window.location.href);
    url.searchParams.set('dark', String(nextDark));
    window.history.pushState({}, '', url);
    
    setIsDark(nextDark);
    updateBodyTheme(version, nextDark);
  };

  const renderApp = () => {
    switch (version) {
      case '1': return <AppV1 />;
      case '2': return <AppV2 />;
      case '3': return <AppV3 />;
      case '4': return <AppV4 />;
      default: return <AppV4 />;
    }
  };

  return (
    <>
      {/* Dev Switcher UI floating at top right */}
      <div style={{
        position: 'fixed', top: '10px', right: '10px', zIndex: 9999,
        background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
        padding: '5px', borderRadius: '8px', border: `1px solid ${isDark ? '#333' : '#e5e5e5'}`,
        display: 'flex', gap: '5px', backdropFilter: 'blur(5px)'
      }}>
        {['1', '2', '3', '4'].map(v => (
          <button 
            key={v} 
            onClick={() => setV(v)}
            style={{
              padding: '4px 8px', borderRadius: '4px', border: 'none',
              background: version === v ? '#4F46E5' : 'transparent',
              color: version === v ? 'white' : (isDark ? '#ccc' : '#444'), 
              cursor: 'pointer', fontFamily: 'monospace',
              fontSize: '12px'
            }}
          >
            v{v}
          </button>
        ))}
        <div style={{ width: '1px', background: isDark ? '#333' : '#e5e5e5', margin: '0 4px' }} />
        <button 
          onClick={toggleTheme}
          style={{
            padding: '4px 6px', borderRadius: '4px', border: 'none',
            background: 'transparent', color: isDark ? '#ccc' : '#444', 
            cursor: 'pointer', display: 'flex', alignItems: 'center'
          }}
          title="Toggle Dark/Light Mode"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      <Suspense fallback={<div style={{color:'var(--text-primary)', padding:'2rem'}}>Loading version...</div>}>
        {renderApp()}
      </Suspense>
    </>
  );
}

export default MainRouter;
