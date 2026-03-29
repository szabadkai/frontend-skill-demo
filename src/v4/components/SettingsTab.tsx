import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { KeyRound, ShieldAlert, TerminalSquare } from 'lucide-react';
import './SettingsTab.css';

export default function SettingsTab() {
  const { openRouterApiKey, setApiKey } = useStore();
  const [localKey, setLocalKey] = useState(openRouterApiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(localKey.trim());
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
            <div className="input-with-icon-tech">
              <KeyRound size={16} className="input-icon-tech" />
              <input
                id="api-key"
                type="password"
                className="input-tech font-mono"
                placeholder="sk-or-v1-..."
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn-tech w-full config-submit">
              {saved ? (
                <span className="btn-content-tech text-success">
                  &gt; CONFIG_SAVED_OK
                </span>
              ) : (
                <span className="btn-content-tech">
                  &gt; UPDATE_KEY
                </span>
              )}
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
