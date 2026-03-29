import React, { useEffect, useState, Suspense } from 'react';

// Dynamically import versions so CSS chunks don't aggressively collide
const AppV1 = React.lazy(() => import('./v1/App'));
const AppV2 = React.lazy(() => import('./v2/App'));
const AppV3 = React.lazy(() => import('./v3/App'));
const AppV4 = React.lazy(() => import('./v4/App'));

function MainRouter() {
  const [version, setVersion] = useState<string>('4');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('v') || '4';
    setVersion(v);

    // Update body theme class for scoped CSS variables
    document.body.className = `theme-v${v}`;
  }, []);

  const renderApp = () => {
    switch (version) {
      case '1': return <AppV1 />;
      case '2': return <AppV2 />;
      case '3': return <AppV3 />;
      case '4': return <AppV4 />;
      default: return <AppV4 />;
    }
  };

  // Switcher UI
  const setV = (v: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('v', v);
    window.history.pushState({}, '', url);
    setVersion(v);
    document.body.className = `theme-v${v}`;
  };

  return (
    <>
      {/* Dev Switcher UI floating at top right */}
      <div style={{
        position: 'fixed', top: '10px', right: '10px', zIndex: 9999,
        background: 'rgba(0,0,0,0.8)', padding: '5px', borderRadius: '8px',
        display: 'flex', gap: '5px', backdropFilter: 'blur(5px)'
      }}>
        {['1', '2', '3', '4'].map(v => (
          <button 
            key={v} 
            onClick={() => setV(v)}
            style={{
              padding: '4px 8px', borderRadius: '4px', border: 'none',
              background: version === v ? '#4F46E5' : 'transparent',
              color: 'white', cursor: 'pointer', fontFamily: 'monospace',
              fontSize: '12px'
            }}
          >
            v{v}
          </button>
        ))}
      </div>

      <Suspense fallback={<div style={{color:'white', padding:'2rem'}}>Loading version...</div>}>
        {renderApp()}
      </Suspense>
    </>
  );
}

export default MainRouter;
