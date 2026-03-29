import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { KeyRound, ShieldAlert, TerminalSquare, User } from 'lucide-react';
import './SettingsTab.css';

export default function SettingsTab() {
  const { openRouterApiKey, setApiKey, userProfile, setUserProfile } = useStore();
  const [localKey, setLocalKey] = useState(openRouterApiKey);
  const [localProfile, setLocalProfile] = useState(userProfile);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(localKey.trim());
    setUserProfile(localProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="tab-container settings-tech">
      <div className="tab-header-tech">
        <h2 className="tab-title-tech mono-text">/config</h2>
      </div>
      
      <div className="settings-content-tech">
        <div className="config-card-tech chrome-panel">
          <div className="config-card-header">
            <TerminalSquare size={16} className="text-muted" />
            <h3 className="mono-text">AI_ENGINE_CONFIG</h3>
          </div>
          
          <p className="config-desc-tech">
            Requires active <span className="mono-text">OPENROUTER_API_KEY</span> to enable <span className="mono-text">AI.infer_goals()</span> subroutine.
          </p>

          <form onSubmit={handleSave} className="api-form-tech">
            <div className="input-group-tech" style={{marginBottom: '1rem'}}>
              <label className="mono-text label-tech"><KeyRound size={12} /> API_KEY</label>
              <input
                type="password"
                className="input-tech mono-text"
                placeholder="sk-or-v1-..."
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
              />
            </div>
            
            <div className="input-group-tech" style={{marginBottom: '1.5rem'}}>
              <label className="mono-text label-tech"><User size={12} /> USER_PROFILE_PAYLOAD</label>
              <textarea
                className="input-tech mono-text"
                placeholder="System context payload..."
                value={localProfile}
                onChange={(e) => setLocalProfile(e.target.value)}
                style={{ minHeight: '80px', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="submit-btn-tech w-full mono-text" style={{ border: '1px solid var(--accent)' }}>
              {saved ? '[ OK_SAVED ]' : '[ WRITE_CFG ]'}
            </button>
          </form>
        </div>

        <div className="security-card-tech">
          <ShieldAlert size={16} className="security-icon-tech" />
          <div className="security-text-stack">
            <span className="security-title-tech mono-text">SECURE_CLIENT_ENCLAVE</span>
            <span className="security-desc-tech">
              Payload never transmitted to origin servers. Evaluated securely in local browser runtime.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
