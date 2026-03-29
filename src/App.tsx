import React, { useEffect, Suspense } from 'react';
import { useStore } from './store/useStore';
import { supabase } from './supabaseClient';
import AuthScreen from './components/AuthScreen';

// Dynamically import versions so CSS chunks don't aggressively collide
const AppV1 = React.lazy(() => import('./v1/App'));
const AppV2 = React.lazy(() => import('./v2/App'));
const AppV3 = React.lazy(() => import('./v3/App'));
const AppV4 = React.lazy(() => import('./v4/App'));

// Map from design theme to its "native" dark/light state
// v1, v4 are natively dark; v2, v3 are natively light
const nativeDark: Record<string, boolean> = {
  v1: true, v2: false, v3: false, v4: true,
};

function resolveIsDark(colorMode: 'system' | 'light' | 'dark'): boolean {
  if (colorMode === 'dark') return true;
  if (colorMode === 'light') return false;
  // 'system' — use OS preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyBodyClasses(theme: string, isDark: boolean) {
  // The CSS expects:
  //   body.theme-v1        → dark (native)
  //   body.theme-v1.light  → light override
  //   body.theme-v2        → light (native)
  //   body.theme-v2.dark   → dark override
  //
  // We normalise so the body always gets both:
  //   `theme-vX` AND either `dark` or `light`
  const nativeThemeDark = nativeDark[theme];
  let cls = `theme-${theme}`;

  if (nativeThemeDark && !isDark) {
    cls += ' light';
  } else if (!nativeThemeDark && isDark) {
    cls += ' dark';
  }

  // Always add explicit light/dark so the ThemeSwitcher CSS can target it
  cls += isDark ? ' dark-active' : ' light-active';

  document.body.className = cls;
}

function MainRouter() {
  const designTheme = useStore(s => s.designTheme);
  const colorMode = useStore(s => s.colorMode);
  const setDesignTheme = useStore(s => s.setDesignTheme);
  const user = useStore(s => s.user);
  const setUser = useStore(s => s.setUser);

  // Setup Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // One-time migration: pick up ?v= from URL on very first load, then clean the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlVersion = params.get('v');
    if (urlVersion && ['1', '2', '3', '4'].includes(urlVersion)) {
      setDesignTheme(`v${urlVersion}` as 'v1' | 'v2' | 'v3' | 'v4');
      // clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Synchronise body classes whenever theme or color mode changes
  useEffect(() => {
    const isDark = resolveIsDark(colorMode);
    applyBodyClasses(designTheme, isDark);

    // If "system", also listen to OS preference changes
    if (colorMode === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        applyBodyClasses(designTheme, e.matches);
      };
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
  }, [designTheme, colorMode]);

  const renderApp = () => {
    switch (designTheme) {
      case 'v1': return <AppV1 />;
      case 'v2': return <AppV2 />;
      case 'v3': return <AppV3 />;
      case 'v4': return <AppV4 />;
      default:   return <AppV4 />;
    }
  };

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <Suspense fallback={<div style={{color:'var(--text-primary)', padding:'2rem'}}>Loading…</div>}>
        {renderApp()}
      </Suspense>
    </>
  );
}

export default MainRouter;
