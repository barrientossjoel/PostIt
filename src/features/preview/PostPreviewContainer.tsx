import React, { useState, useEffect } from 'react';
import type { Post } from '../../core/entities/Post';
import type { AppSettings } from '../../core/entities/Settings';
import { usePostPreview } from './hooks/usePostPreview';
import { SocialCardSimulator } from './components/SocialCardSimulator';
import { SocialSharePanel } from './SocialSharePanel';
import { freeTranslationAdapter } from '../../infrastructure/adapters/FreeTranslationAdapter';
import { container } from '../../infrastructure/container';
import { AccountsSidebar } from './components/AccountsSidebar';
import { AddSocialAccountModal } from './components/AddSocialAccountModal';
import { EditorToolbar } from './components/EditorToolbar';
import type { SocialAccount } from './types/SocialAccount';
import {
  Copy,
  Send,
  FileText,
  Share2,
  RotateCcw,
  Save,
  UserCheck,
  PlusCircle,
  Tag,
} from 'lucide-react';

import type { UserProfile } from '../../core/entities/User';

interface Props {
  currentPost: Post | null;
  settings: AppSettings;
  user?: UserProfile | null;
  onPostUpdated: (post: Post) => void;
  onNavigateToPending?: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const STORAGE_KEY = 'postit_social_accounts';

export const PostPreviewContainer: React.FC<Props> = ({
  currentPost,
  settings,
  user,
  onPostUpdated,
  onNavigateToPending,
  showToast,
}) => {
  const preview = usePostPreview(currentPost, settings, onPostUpdated, showToast);
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showFirstComment, setShowFirstComment] = useState(false);
  const [firstCommentText, setFirstCommentText] = useState('');

  // Persisted Social Accounts
  const [accounts, setAccounts] = useState<SocialAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);



  const activeAccount = accounts.find((a) => a.selected) || accounts[0];

  const handleToggleAccount = (id: string) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, selected: !acc.selected } : acc))
    );
  };

  const handleAddAccount = (accData: Omit<SocialAccount, 'id' | 'selected'>) => {
    const newAcc: SocialAccount = {
      ...accData,
      id: `acc_${accData.platform}_${Date.now()}`,
      selected: true,
    };
    setAccounts((prev) => [...prev, newAcc]);
    showToast(`Cuenta conectada: ${newAcc.name} (${newAcc.platform.toUpperCase()})`, 'success');
  };

  const handleSmartTrim = () => {
    let trimmed = preview.content.slice(0, 275);
    const lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > 30) trimmed = trimmed.slice(0, lastSpace);
    preview.setContent(`${trimmed.trim()}...`);
    showToast('Post recortado a 280 caracteres', 'success');
  };

  const handleFreeTranslate = async () => {
    if (!preview.content) return;
    setTranslating(true);
    try {
      const res = await freeTranslationAdapter.translateToSpanish(preview.content);
      preview.setContent(res);
      showToast('Texto traducido al español', 'success');
    } catch {
      showToast('Error al traducir', 'error');
    } finally {
      setTranslating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!currentPost) return;
    const draft: Post = { ...currentPost, content: preview.content, status: 'draft', updatedAt: new Date().toISOString() };
    await container.postRepository.savePost(draft);
    onPostUpdated(draft);
    showToast('Borrador guardado localmente', 'success');
  };

  const handleReturnToPending = async () => {
    if (!currentPost) return;
    const pending: Post = { ...currentPost, content: preview.content, hashtags: [], status: 'pending' };
    await container.postRepository.savePost(pending);
    onPostUpdated(pending);
    showToast('Devuelto a Pendientes', 'success');
    onNavigateToPending?.();
  };

  return (
    <div className="publer-3col-layout animate-fade-in">
      {/* Columna 1: Cuentas */}
      <AccountsSidebar
        accounts={accounts}
        onToggleAccount={handleToggleAccount}
        onOpenAddModal={() => setIsAddAccountOpen(true)}
      />

      {/* Columna 2: Editor */}
      <div className="github-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeAccount && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '9999px', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 600, color: '#00e5ff' }}>
                <UserCheck size={14} color="#00e5ff" />
                <span>@{activeAccount.handle || activeAccount.name}</span>
              </div>
            )}
            {currentPost && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• {currentPost.commits.length} commit(s) de {currentPost.repoFullName}</span>}
          </div>
          {currentPost && (
            <button className="btn btn-secondary btn-sm" onClick={handleReturnToPending} style={{ color: 'var(--accent-orange)', padding: '3px 8px', fontSize: '0.76rem' }}>
              <RotateCcw size={13} /> Devolver a Pendientes
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FileText size={14} color="var(--accent-blue)" /> Texto de la Publicación
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <Tag size={12} style={{ display: 'inline', marginRight: 3 }} /> Editor Publer
            </span>
          </div>

          {/* Publer Textarea Container con fondo transparente */}
          <div className="publer-textarea-container">
            <textarea
              className="publer-textarea-input"
              rows={9}
              placeholder="Escribe el texto de tu publicación o usa el asistente IA para refinar tus commits..."
              value={preview.content}
              onChange={(e) => preview.setContent(e.target.value)}
            />

            {/* Toolbar con Bold, Italic, Emoji Picker, Attach Image, Signature y Traducir (con 1 solo icono) */}
            <EditorToolbar
              content={preview.content}
              onChangeContent={(newVal) => preview.setContent(newVal)}
              onTranslate={handleFreeTranslate}
              translating={translating}
              onRefine={() => preview.handleRefine('Redacta un post atractivo para devs')}
              refining={preview.refining}
              showToast={showToast}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button type="button" onClick={() => setShowFirstComment(!showFirstComment)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: 0 }}>
            <PlusCircle size={14} /> {showFirstComment ? 'Ocultar primer comentario' : '+ Añadir primer comentario'}
          </button>
          {showFirstComment && (
            <textarea className="textarea-input" rows={2} placeholder="Primer comentario automático..." style={{ fontSize: '0.82rem' }} value={firstCommentText} onChange={(e) => setFirstCommentText(e.target.value)} />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', marginTop: 'auto', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleSaveDraft}><Save size={14} /> Guardar Borrador</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={preview.handleCopyText}><Copy size={13} /> Copiar Texto</button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-x-black btn-sm" onClick={() => setIsSharePanelOpen(true)}><Share2 size={14} /> Publicar Directo</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => preview.handlePublish('publer')} disabled={preview.publishing || !settings.publerApiKey}><Send size={14} /> Enviar API Publer</button>
          </div>
        </div>
      </div>

      {/* Columna 3: Preview Live */}
      <SocialCardSimulator
        post={currentPost}
        content={preview.content}
        activeAccount={activeAccount}
        onSmartTrim={handleSmartTrim}
      />

      {/* Modal Reutilizable de Cuentas */}
      <AddSocialAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAddAccount={handleAddAccount}
        user={user}
        publerApiKey={settings.publerApiKey}
      />

      {/* Share Modal */}
      {isSharePanelOpen && (
        <SocialSharePanel
          post={currentPost || { id: 'temp', repoFullName: 'PostIt/manual', commits: [], title: 'Manual', content: preview.content, hashtags: [], status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), aiTone: settings.aiTone }}
          isOpen={isSharePanelOpen}
          onClose={() => setIsSharePanelOpen(false)}
          onConfirmPublished={() => showToast('Publicado con éxito', 'success')}
          showToast={showToast}
        />
      )}
    </div>
  );
};
