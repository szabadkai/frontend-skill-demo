import { Sun, Moon, Monitor } from 'lucide-react';
import { useStore } from '../store/useStore';
import './ThemeSwitcher.css';

const themes = [
  { id: 'v1' as const, label: 'Glass' },
  { id: 'v2' as const, label: 'Editorial' },
  { id: 'v3' as const, label: 'Bubbly' },
  { id: 'v4' as const, label: 'Technical' },
];

const colorModes = [
  { id: 'light' as const, icon: <Sun size={16} />, label: 'Light' },
  { id: 'dark' as const, icon: <Moon size={16} />, label: 'Dark' },
  { id: 'system' as const, icon: <Monitor size={16} />, label: 'System' },
];

/** Inline theme controls to be embedded inside each SettingsTab */
export default function ThemeSwitcher() {
  const { designTheme, colorMode, setDesignTheme, setColorMode } = useStore();

  return (
    <div className="theme-switcher-inline">
      <div className="ts-section">
        <span className="ts-label">Design Theme</span>
        <div className="ts-chips">
          {themes.map(t => (
            <button
              key={t.id}
              className={`ts-chip ${designTheme === t.id ? 'ts-chip--active' : ''}`}
              onClick={() => setDesignTheme(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ts-section">
        <span className="ts-label">Color Mode</span>
        <div className="ts-chips">
          {colorModes.map(m => (
            <button
              key={m.id}
              className={`ts-chip ${colorMode === m.id ? 'ts-chip--active' : ''}`}
              onClick={() => setColorMode(m.id)}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
