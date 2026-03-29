import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { KeyRound, ShieldCheck, Check } from 'lucide-react';
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
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="tab-container settings-bubbly">
      <div className="tab-header-soft"><h2 className="tab-title-soft">App Settings</h2></div>
      
      <div className="settings-content-soft">
        <div className="settings-card-soft">
          <div className="settings-card-header">
            <div className="icon-wrap-bg"><KeyRound size={24} className="accent-icon-soft" strokeWidth={2.5}/></div>
            <h3>AI Configuration</h3>
          </div>
          
          <form onSubmit={handleSave} className="api-form-bubbly" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem'}}>
            <div className="input-group-soft">
              <label className="label-bubbly">OpenRouter Secret Key</label>
              <div className="input-with-icon-bubbly">
                <KeyRound size={20} className="icon-bubbly" />
                <input
                  type="password"
                  autoComplete="new-password"
                  className="input-bubbly"
                  placeholder="sk-or-v1-..."
                  value={localKey}
                  onChange={(e) => setLocalKey(e.target.value)}
                />
              </div>
            </div>
            
            <div className="input-group-soft">
              <label className="label-bubbly">Your Preferences / Setup</label>
              <textarea
                className="input-bubbly"
                placeholder="Tell the AI about yourself so it gives better advice..."
                value={localProfile}
                onChange={(e) => setLocalProfile(e.target.value)}
                style={{ minHeight: '100px', resize: 'vertical', padding: '1rem', borderRadius: 'var(--radius-main)' }}
              />
            </div>

            <button type="submit" className="btn-bubbly" style={{ marginTop: '0.5rem' }}>
              {saved ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Check size={20} strokeWidth={3} /> SAVED!
                </span>
              ) : (
                'SAVE YOUR SETTINGS'
              )}
            </button>
          </form>
        </div>

        <div className="privacy-card-soft">
          <ShieldCheck size={28} className="privacy-icon-soft" strokeWidth={2.5} />
          <div className="privacy-text-stack">
            <span className="privacy-title-soft">Completely Local</span>
            <span className="privacy-desc-soft">We never upload your API key. It lives safely in your browser storage.</span>
          </div>
        </div>

        <div className="settings-card-soft" style={{marginTop: '1rem'}}>
          <div className="settings-card-header">
            <h3>✨ Look & Feel</h3>
          </div>
          <div style={{marginTop: '1rem'}}>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
