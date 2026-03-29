import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../supabaseClient';
import { ListTodo, LogOut, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkspaceManager from './WorkspaceManager';

export default function UserMenu() {
  const { lists, activeList, setActiveList, user, setUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) return null;

  return (
    <div className="relative isolate" style={{ display: 'inline-block' }} ref={menuRef}>
      {/* The Status Dot Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          padding: '0.5rem',
          margin: 0,
          cursor: 'pointer',
          outline: 'none',
        }}
        title="Account & Workspace"
      >
        <div style={{
          width: '8px',
          height: '8px',
          background: 'var(--success, #10b981)',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
          transition: 'transform 0.2s',
          transform: isOpen ? 'scale(1.2)' : 'scale(1)',
        }} />
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              minWidth: '220px',
              background: 'rgba(24, 24, 27, 0.9)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.2)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              color: '#fafafa',
              fontFamily: 'var(--font-sans, "Inter", sans-serif)'
            }}
          >
            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ background: 'rgba(167, 139, 250, 0.2)', padding: '0.4rem', borderRadius: '50%' }}>
                <User size={16} color="#a78bfa" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Logged in as</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
              </div>
            </div>

            {/* List Switcher (if lists exist) */}
            {lists.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Active List</span>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <ListTodo size={14} style={{ position: 'absolute', left: '0.5rem', color: '#a1a1aa', pointerEvents: 'none' }} />
                  <select 
                    style={{ 
                      width: '100%',
                      appearance: 'none', 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '6px',
                      padding: '0.4rem 0.5rem 0.4rem 2rem',
                      color: '#fafafa',
                      fontSize: '0.85rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    value={activeList?.id || ''}
                    onChange={(e) => {
                      const lst = lists.find(l => l.id === e.target.value);
                      if (lst) {
                        setActiveList(lst);
                        setIsOpen(false);
                      }
                    }}
                  >
                    {lists.map(l => (
                      <option key={l.id} value={l.id} style={{color: '#000'}}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Manage Workspace Button */}
            <button 
              onClick={() => {
                setShowManager(true);
                setIsOpen(false);
              }}
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fafafa',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
            >
              <Settings size={14} />
              Manage Workspace
            </button>

            {/* Sign Out Button */}
            <button 
              onClick={handleSignOut}
              style={{
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showManager && <WorkspaceManager onClose={() => setShowManager(false)} />}
    </div>
  );
}
