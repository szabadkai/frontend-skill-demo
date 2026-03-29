import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ShieldAlert, ArrowRight } from 'lucide-react';
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
            <label htmlFor="api-key" className="font-serif">API AUTHORIZATION KEY</label>
            <input
              id="api-key"
              type="password"
              className="input-underline font-mono"
              placeholder="sk-or-v1-..."
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
            />
          </div>
          
          <div className="input-group" style={{marginTop: '1.5rem', marginBottom: '2rem'}}>
            <label htmlFor="user-profile" className="font-serif">PERSONAL DOSSIER</label>
            <textarea
              id="user-profile"
              className="input-underline font-serif"
              placeholder="Provide background context for the AI..."
              value={localProfile}
              onChange={(e) => setLocalProfile(e.target.value)}
              style={{minHeight: '80px', resize: 'vertical'}}
            />
          </div>

          <button type="submit" className="btn-brutal font-sans w-full">
            {saved ? (
              <span className="btn-content">CREDENTIALS SAVED</span>
            ) : (
              <span className="btn-content">SAVE CONFIGURATION <ArrowRight size={18} /></span>
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
