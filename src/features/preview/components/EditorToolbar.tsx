import React, { useState, useRef } from 'react';
import { Globe2, Wand2, Image as ImageIcon, Pencil, Smile } from 'lucide-react';
import { EmojiPickerPopover } from './EmojiPickerPopover';
import { SignatureModal } from './SignatureModal';

interface Props {
  content: string;
  onChangeContent: (newContent: string) => void;
  onTranslate: () => void;
  translating: boolean;
  onRefine: () => void;
  refining: boolean;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const EditorToolbar: React.FC<Props> = ({
  content,
  onChangeContent,
  onTranslate,
  translating,
  onRefine,
  refining,
  showToast,
  textareaRef,
}) => {
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to insert text preserving undo stack
  const insertTextPreservingUndo = (textToInsert: string, prefixLen?: number, defaultTextLen?: number) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      const start = textarea.selectionStart;
      const success = document.execCommand('insertText', false, textToInsert);
      if (!success) {
        // Fallback
        const end = textarea.selectionEnd;
        const newText = content.substring(0, start) + textToInsert + content.substring(end);
        onChangeContent(newText);
      }
      if (prefixLen !== undefined && defaultTextLen !== undefined) {
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(start + prefixLen, start + prefixLen + defaultTextLen);
          }
        }, 0);
      }
    } else {
      onChangeContent(`${content}${textToInsert}`);
    }
  };

  // Formatting helpers
  const handleApplyFormat = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      if (selected) {
        insertTextPreservingUndo(`${prefix}${selected}${suffix}`);
      } else {
        insertTextPreservingUndo(`${prefix}texto${suffix}`, prefix.length, 5);
      }
    } else {
      onChangeContent(`${content}${prefix}texto${suffix}`);
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    insertTextPreservingUndo(emoji);
  };

  const handleApplySignature = (sigText: string) => {
    insertTextPreservingUndo(`\n${sigText}`);
    showToast('Firma añadida al final de la publicación', 'success');
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`Imagen seleccionada: ${file.name}`, 'success');
    }
  };

  return (
    <div className="publer-toolbar-row">
      <div className="publer-toolbar-group" style={{ position: 'relative' }}>
        {/* Bold Button */}
        <button
          type="button"
          className="toolbar-btn-sq"
          onClick={() => handleApplyFormat('**', '**')}
          title="Negrita (Bold)"
        >
          B
        </button>

        {/* Italic Button */}
        <button
          type="button"
          className="toolbar-btn-sq"
          onClick={() => handleApplyFormat('*', '*')}
          title="Itálica (Italic)"
          style={{ fontStyle: 'italic', fontFamily: 'serif' }}
        >
          I
        </button>

        {/* Emoji Button */}
        <button
          type="button"
          className="toolbar-btn-sq"
          onClick={() => setIsEmojiOpen(!isEmojiOpen)}
          title="Insertar Emoji"
        >
          <Smile size={16} />
        </button>

        {/* Attach Image Button */}
        <button
          type="button"
          className="toolbar-btn-sq"
          onClick={() => fileInputRef.current?.click()}
          title="Adjuntar Imagen"
        >
          <ImageIcon size={16} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />

        {/* Signature (Pencil) Button */}
        <button
          type="button"
          className="toolbar-btn-sq"
          onClick={() => setIsSignatureOpen(true)}
          title="Añadir Firma (Signature)"
        >
          <Pencil size={15} />
        </button>

        {/* Single Icon Traducir Button (Single Globe2 Icon as requested) */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onTranslate}
          disabled={translating}
          style={{ padding: '3px 9px', fontSize: '0.78rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Globe2 size={14} /> {translating ? '...' : 'Traducir'}
        </button>

        {/* AI Assist Button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onRefine}
          disabled={refining}
          style={{
            padding: '3px 9px',
            fontSize: '0.78rem',
            color: 'var(--accent-purple)',
            borderColor: 'rgba(168, 85, 247, 0.4)',
          }}
        >
          <Wand2 size={13} /> {refining ? 'IA...' : 'AI Assist'}
        </button>

        {/* Emoji Picker Popover */}
        <EmojiPickerPopover
          isOpen={isEmojiOpen}
          onClose={() => setIsEmojiOpen(false)}
          onSelectEmoji={handleSelectEmoji}
        />
      </div>

      {/* Publer Signature Selection Modal */}
      <SignatureModal
        isOpen={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        onApplySignature={handleApplySignature}
      />
    </div>
  );
};
