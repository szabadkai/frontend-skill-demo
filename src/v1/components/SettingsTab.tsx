import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { KeyRound, ShieldAlert } from 'lucide-react';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import './SettingsTab.css';

export default function SettingsTab() {
  const { openRouterApiKey, setApiKey, userProfile, setUserProfile } = useStore();
  const [localKey, setLocalKey] = useState(openRouterApiKey);
  const [localProfile, setLocalProfile] = useState(userProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setLocalKey(openRouterApiKey); }, [openRouterApiKey]);
  useEffect(() => { setLocalProfile(userProfile); }, [userProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(localKey.trim());
    setUserProfile(localProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="tab-container settings-v1">
      <div className="glass-panel settings-card">
        <div className="card-header">
          <KeyRound size={24} className="accent-icon" />
          <h2>API Configuration</h2>
        </div>
        
        <p className="description">
          Provide your OpenRouter API key to enable AI goal inference.
        </p>

        <form onSubmit={handleSave} className="api-form">
          <label className="text-muted" style={{fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem'}}>OpenRouter API Key</label>
          <input
            id="api-key"
            type="password"
            autoComplete="new-password"
            className="input-glass"
            placeholder="sk-or-v1-..."
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            style={{marginBottom: '1rem'}}
          />
          
          <label className="text-muted" style={{fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem'}}>Personal Context / AI Profile</label>
          <textarea
            className="input-glass"
            placeholder="I'm a freelancer working on web apps..."
            value={localProfile}
            onChange={(e) => setLocalProfile(e.target.value)}
            style={{marginBottom: '1.5rem', minHeight: '80px', resize: 'vertical'}}
          />

          <button type="submit" className="btn-primary w-full">
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </form>

        <div className="security-notice">
          <ShieldAlert size={20} className="warning-icon" />
          <div className="notice-text">
            <span>Keys are stored locally in your browser.</span>
          </div>
        </div>
      </div>

      <div className="glass-panel settings-card" style={{marginTop: '1.5rem'}}>
        <div className="card-header">
          <h2>Appearance</h2>
        </div>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
