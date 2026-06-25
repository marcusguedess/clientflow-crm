export default function Toast({ toast, onUndo, onClose }) {
  if (!toast) return null
  return (
    <div className={`toast toast--${toast.tone || 'success'}`} role="status">
      <span>{toast.message}</span>
      {toast.undo && <button onClick={onUndo}>Desfazer</button>}
      <button className="toast__close" onClick={onClose} aria-label="Fechar aviso">×</button>
    </div>
  )
}
