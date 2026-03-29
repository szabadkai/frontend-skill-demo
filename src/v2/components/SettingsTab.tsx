import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { KeyRound, ShieldAlert, Check } from 'lucide-react';
import './SettingsTab.css';

export default function SettingsTab() {
  const { openRouterApiKey, setApiKey } = useStore();
  const [localKey, setLocalKey] = useState(openRouterApiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(localKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="tab-container settings-editorial">
      <div className="tab-header">
        <h2 className="font-serif tab-title">System</h2>
      </div>
      
      <div className="settings-content">
        <blockquote className="editorial-quote font-serif">
          “Setup the AI engine to infer your horizons.”
        </blockquote>
        
        <p className="settings-prose font-sans">
          To enable the inference capabilities, an OpenRouter API key is required. 
          Your key remains securely encrypted within your local browser storage—it never touches our servers.
        </p>

        <form onSubmit={handleSave} className="api-form-editorial">
          <div className="input-group">
            <label htmlFor="api-key" className="editorial-label font-sans">OPENROUTER KEY</label>
            <div className="input-with-icon">
              <KeyRound size={18} className="input-icon" />
              <input id="api-key" type="password" className="input-underline font-serif" placeholder="sk-or-v1-..."
                value={localKey} onChange={(e) => setLocalKey(e.target.value)} />
            </div>
          </div>
          
          <button type="submit" className="btn-brutal w-full font-sans">
            {saved ? (
              <span className="btn-content"><Check size={18} /> CONFIGURED</span>
            ) : (
              'SAVE CONFIGURATION'
            )}
          </button>
        </form>

        <div className="privacy-card">
          <ShieldAlert size={20} className="privacy-icon" />
          <div className="privacy-text-wrap font-sans">
            <span className="privacy-title">Local First</span>
            <span className="privacy-desc">Keys are used exclusively to sign inference prompts locally.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
