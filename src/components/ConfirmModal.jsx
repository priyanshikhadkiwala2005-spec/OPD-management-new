import { useEffect } from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', confirmColor = '#ef4444' }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) { if (e.key === 'Escape') onCancel(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">⚠️</div>
        <h3 className="modal-title">{title || 'Are you sure?'}</h3>
        <p className="modal-msg">{message || 'This action cannot be undone.'}</p>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel}>Cancel</button>
          <button
            className="modal-btn-confirm"
            style={{ background: confirmColor }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
