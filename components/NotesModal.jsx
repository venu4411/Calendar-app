// components/NotesModal.jsx
import { useState, useEffect, useRef } from 'react';

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function NotesModal({ date, notes, onClose, onAdd, onDelete }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(date, input.trim());
      setInput('');
    }
  };

  const d = parseDate(date);
  const label = d
    ? d.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : date;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div>
            <div className="modal-title">📝 Notes</div>
            <div className="modal-date">{label}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-note-list">
          {notes.length === 0 ? (
            <div className="empty-state">No notes yet. Add one below!</div>
          ) : (
            notes.map((n, i) => (
              <div className="modal-note-item" key={i}>
                <span>{n}</span>
                <button className="modal-note-delete" onClick={() => onDelete(date, i)}>✕</button>
              </div>
            ))
          )}
        </div>

        <div className="modal-add-note">
          <input
            ref={inputRef}
            className="modal-input"
            placeholder="Add a note..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button className="btn-accent" onClick={handleAdd}>Add</button>
        </div>

      </div>
    </div>
  );
}
