import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import { X, Plus, Trash2, Users, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkspaceManagerProps {
  onClose: () => void;
}

export default function WorkspaceManager({ onClose }: WorkspaceManagerProps) {
  const { lists, user, createList, deleteList, shareList } = useStore();
  const [newListName, setNewListName] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharingListId, setSharingListId] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  // Track list loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setIsCreating(true);
    await createList(newListName.trim());
    setNewListName('');
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    await deleteList(id);
    setIsDeletingId(null);
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharingListId || !shareEmail.trim()) return;
    
    setShareStatus(null);
    const result = await shareList(sharingListId, shareEmail.trim());
    
    if (result.success) {
      setShareStatus({ type: 'success', msg: 'Shared with user!' });
      setShareEmail('');
      setTimeout(() => {
        setSharingListId(null);
        setShareStatus(null);
      }, 2000);
    } else {
      setShareStatus({ type: 'error', msg: result.error || 'Failed to share list.' });
    }
  };

  const modalContent = (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          background: 'rgba(24, 24, 27, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#fafafa',
          fontFamily: 'var(--font-sans, "Inter", sans-serif)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Workspace Management</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#a1a1aa', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem',
              borderRadius: '6px'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#fafafa'}
            onMouseOut={(e) => e.currentTarget.style.color = '#a1a1aa'}
          >
            <X size={20} />
          </button>
        </div>

        {/* scrollable body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Create List */}
          <section>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Create New List
            </h3>
            <form onSubmit={handleCreateList} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="List name..."
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.8rem',
                  color: '#fafafa',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
                disabled={isCreating}
              />
              <button 
                type="submit"
                style={{
                  background: 'var(--accent, #6366f1)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: isCreating || !newListName.trim() ? 'not-allowed' : 'pointer',
                  opacity: isCreating || !newListName.trim() ? 0.6 : 1
                }}
                disabled={isCreating || !newListName.trim()}
              >
                <Plus size={16} />
                Create
              </button>
            </form>
          </section>

          {/* Existing Lists */}
          <section>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your Lists
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {lists.map(list => {
                const isOwner = list.owner_id === user?.id;

                return (
                  <div key={list.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '0.8rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    {/* List Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{list.name}</span>
                        {!isOwner && (
                          <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', letterSpacing: '0.5px' }}>
                            SHARED
                          </span>
                        )}
                      </div>
                      
                      {isOwner && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            onClick={() => {
                              setSharingListId(sharingListId === list.id ? null : list.id);
                              setShareStatus(null);
                            }}
                            title="Share"
                            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '0.4rem', borderRadius: '4px' }}
                            onMouseOver={(e) => {e.currentTarget.style.color = 'var(--accent, #6366f1)'; e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';}}
                            onMouseOut={(e) => {e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.background = 'transparent';}}
                          >
                            <Users size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(list.id)}
                            disabled={isDeletingId === list.id}
                            title="Delete"
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '4px', opacity: isDeletingId === list.id ? 0.5 : 1 }}
                            onMouseOver={(e) => {if(isDeletingId !== list.id) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}}
                            onMouseOut={(e) => {e.currentTarget.style.background = 'transparent'}}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Share Dropdown Area */}
                    <AnimatePresence>
                      {sharingListId === list.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem' }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <form onSubmit={handleShare} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input 
                                type="email" 
                                required
                                value={shareEmail}
                                onChange={e => setShareEmail(e.target.value)}
                                placeholder="User's exact email address..."
                                style={{
                                  flex: 1,
                                  background: 'rgba(0,0,0,0.2)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  borderRadius: '6px',
                                  padding: '0.5rem 0.75rem',
                                  color: '#fafafa',
                                  outline: 'none',
                                  fontSize: '0.85rem'
                                }}
                              />
                              <button 
                                type="submit"
                                style={{
                                  background: 'rgba(255,255,255,0.1)',
                                  color: '#fafafa',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  borderRadius: '6px',
                                  padding: '0 0.8rem',
                                  fontSize: '0.85rem',
                                  cursor: !shareEmail.trim() ? 'not-allowed' : 'pointer',
                                  opacity: !shareEmail.trim() ? 0.5 : 1
                                }}
                                disabled={!shareEmail.trim()}
                              >
                                Share
                              </button>
                            </div>
                            {shareStatus && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.4rem', 
                                fontSize: '0.8rem',
                                color: shareStatus.type === 'success' ? 'var(--success, #10b981)' : '#ef4444' 
                              }}>
                                {shareStatus.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                                {shareStatus.msg}
                              </div>
                            )}
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
              
              {lists.length === 0 && (
                <div style={{ color: '#a1a1aa', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  No lists found.
                </div>
              )}
            </div>
          </section>

        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
