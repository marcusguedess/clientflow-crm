export default function Toast({ toast, onUndo, onClose }) {
  if (!toast) return null
  return (
    <div className={`toast toast--${toast.tone || 'success'}`} role="status">
      <span>{toast.message}</span>
      {toast.undo && <button type="button" onClick={onUndo}>Desfazer</button>}
      <button className="toast__close" type="button" onClick={onClose} aria-label="Fechar aviso">×</button>
    </div>
  )
}
