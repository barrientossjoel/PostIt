import React, { useState } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplySignature: (signatureText: string) => void;
}

const DEFAULT_SIGNATURES = [
  { id: 'sig_1', name: 'Standard Dev Signature', text: '\n\n---\n🚀 Built with PostIt' },
  { id: 'sig_2', name: 'GitHub & Social Links', text: '\n\n---\n💻 GitHub: https://github.com\n✨ Follow for dev updates!' },
];

export const SignatureModal: React.FC<Props> = ({ isOpen, onClose, onApplySignature }) => {
  const [selectedSigId, setSelectedSigId] = useState<string>('sig_1');

  if (!isOpen) return null;

  const handleSave = () => {
    const found = DEFAULT_SIGNATURES.find((s) => s.id === selectedSigId);
    if (found) {
      onApplySignature(found.text);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="publer-signature-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-row">
          <h3>Signature Selection <span className="text-optional">(optional)</span></h3>
          <button type="button" onClick={onClose} className="btn-close-icon">
            <X size={16} />
          </button>
        </div>

        {/* Tip Banner */}
        <div className="signature-tip-box">
          <div className="tip-content">
            <Lightbulb size={16} className="tip-icon" />
            <span>Tip: Set default signature in <strong>Post Presets ↗</strong></span>
          </div>
          <button type="button" className="btn-close-tip">
            <X size={14} />
          </button>
        </div>

        {/* Explanation Subtext */}
        <p className="signature-description">
          Just like in emails, signatures are outros, i.e. text, links, etc, that can be automatically appended to the end of your posts.
        </p>

        {/* Dropdown Selector */}
        <div className="input-group">
          <select
            className="select-input signature-select"
            value={selectedSigId}
            onChange={(e) => setSelectedSigId(e.target.value)}
          >
            {DEFAULT_SIGNATURES.map((sig) => (
              <option key={sig.id} value={sig.id}>
                {sig.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="modal-footer-actions">
          <button type="button" className="btn-publer-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-publer-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
