import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
    <div className="tab-container settings-bubbly">
      <div className="tab-header-soft"><h2 className="tab-title-soft">App Settings</h2></div>
      
      <div className="settings-content-soft">
        <div className="settings-card-soft">
          <div className="settings-card-header">
            <div className="icon-wrap-bg"><KeyRound size={24} className="accent-icon-soft" strokeWidth={2.5}/></div>
            <h3>AI Configuration</h3>
          </div>
          
          <p className="settings-desc-soft">To unlock the magic "Infer Goals" feature, simply pop your OpenRouter API key below.</p>

          <form onSubmit={handleSave} className="api-form-soft">
            <input type="password" className="input-bubbly" placeholder="Paste your key here... (sk-or-v1-...)"
              value={localKey} onChange={(e) => setLocalKey(e.target.value)} />
            
            <button type="submit" className="btn-bubbly w-full mt-2">
              {saved ? <span className="btn-content"><CheckCircle2 size={24} strokeWidth={3} /> ALL SET!</span> : 'SAVE KEY'}
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
      </div>
    </div>
  );
}
