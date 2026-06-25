import PixelAvatar from './PixelAvatar'

const statusLabels = { online: 'Online', ocupado: 'Ocupado', ausente: 'Ausente' }

export default function EmployeeBadge({ employee, onClick, compact = false }) {
  return (
    <button
      className={`employee-badge ${compact ? 'employee-badge--compact' : ''}`}
      onClick={() => onClick?.(employee)}
      type="button"
    >
      <PixelAvatar avatar={employee.avatar} size={compact ? 36 : 48} animated />
      <span className="employee-badge__copy">
        <strong>{employee.nome}</strong>
        <small>{employee.cargo}</small>
        <span className={`presence presence--${employee.status}`}>
          <i />
          {statusLabels[employee.status]}
        </span>
      </span>
    </button>
  )
}
