import { PIPELINE_STATUSES } from '../data/seedData'

export default function SearchBar({ query, onQueryChange, status, onStatusChange }) {
  return (
    <div className="toolbar">
      <label className="search-field">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar nome, empresa ou email"
        />
      </label>

      <label className="filter-field">
        <span>Status</span>
        <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
          <option value="Todos">Todos os status</option>
          {PIPELINE_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
