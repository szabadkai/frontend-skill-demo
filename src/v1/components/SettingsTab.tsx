import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { KeyRound, ShieldAlert } from 'lucide-react';
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
          <input
            id="api-key"
            type="password"
            className="input-glass"
            placeholder="sk-or-v1-..."
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
          />
          <button type="submit" className="btn-primary w-full">
            {saved ? 'Saved!' : 'Save Key'}
          </button>
        </form>

        <div className="security-notice">
          <ShieldAlert size={20} className="warning-icon" />
          <div className="notice-text">
            <span>Keys are stored locally in your browser.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
