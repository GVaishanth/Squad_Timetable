// Reusable error popup: useErrorPopup() hook + <ErrorPopup> dialog.
// Used for validation errors (empty required fields) across all modals.
import { useCallback, useState } from 'react';
import { RuneIcon } from './Icons';

export function useErrorPopup() {
  const [error, setError] = useState('');
  const showError = useCallback((msg) => setError(msg || 'Something went wrong.'), []);
  const hideError = useCallback(() => setError(''), []);
  return { error, showError, hideError };
}

export function ErrorPopup({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="modal-pop relative w-full max-w-sm rounded-2xl border border-red-400/30 bg-slate-900 p-5 text-center shadow-2xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-400/30">
          <RuneIcon name="warning" tone="red" className="h-6 w-6" />
        </div>
        <h3 className="font-display text-base font-bold tracking-wide text-ivory-50">Missing information</h3>
        <p className="mt-1 text-sm leading-relaxed text-ivory-300">{message}</p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="mt-4 w-full rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-ivory-100 shadow-lg shadow-red-500/30 transition hover:bg-red-400"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
