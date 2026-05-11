import './Dialog.scss'

export default function Dialog({ title, children, onClose }) {
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        {title && <h2 className="dialog__title">{title}</h2>}
        <div className="dialog__body">{children}</div>
      </div>
    </div>
  )
}
