import React, { useEffect, useRef, useState } from 'react';
import './AddConceptDialog.css';

export default function AddConceptDialog({ open, onCancel, onSubmit, submitting }) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [resources,   setResources]   = useState('');
  const [touched,     setTouched]     = useState(false);
  const titleRef = useRef(null);

  // focus title on open
  useEffect(() => {
    if (open) {
      setTimeout(() => titleRef.current?.focus(), 60);
    } else {
      setTitle('');
      setDescription('');
      setResources('');
      setTouched(false);
    }
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  const titleError = touched && !title.trim();

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!title.trim()) return;
    const parsedResources = resources
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
    onSubmit({ title: title.trim(), description: description.trim(), resources: parsedResources });
  }

  return (
    <div className="acd-overlay" onMouseDown={onCancel} role="dialog" aria-modal="true" aria-label="Add concept">
      <div className="acd-panel animate-scale-in" onMouseDown={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="acd-header">
          <div>
            <div className="t-label t-faint" style={{ marginBottom: 4 }}>New concept</div>
            <h2 className="acd-title t-display">Mark a concept</h2>
          </div>
          <button className="btn btn-ghost btn-sm acd-close" onClick={onCancel} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* title */}
          <div className="acd-field">
            <label className="acd-label t-label" htmlFor="acd-title">
              Title <span className="acd-required">*</span>
            </label>
            <input
              ref={titleRef}
              id="acd-title"
              className={`input ${titleError ? 'input--error' : ''}`}
              placeholder="e.g. Recursion, Big-O Notation…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched(true)}
              required
            />
            {titleError && (
              <div className="acd-error-msg animate-slide-down">Title is required</div>
            )}
          </div>

          {/* description */}
          <div className="acd-field">
            <label className="acd-label t-label" htmlFor="acd-desc">Description</label>
            <textarea
              id="acd-desc"
              className="input"
              placeholder="Why does this concept matter? One or two sentences."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* resources */}
          <div className="acd-field">
            <label className="acd-label t-label" htmlFor="acd-res">
              Resources
              <span className="t-faint" style={{ fontWeight: 400, marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>
                — one per line
              </span>
            </label>
            <textarea
              id="acd-res"
              className="input"
              placeholder={'Lecture slides link\nPractice problem set\nVideo walkthrough'}
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              rows={3}
            />
          </div>

          {/* actions */}
          <div className="acd-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <><span className="btn-spinner" /> Placing…</>
              ) : (
                'Place on map'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
