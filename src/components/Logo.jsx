export default function Logo({ compact = false }) {
  return (
    <div className={`logo ${compact ? 'logo--compact' : ''}`} aria-label="ClientFlow CRM">
      <svg
        className="logo__mark"
        viewBox="0 0 42 42"
        role="img"
        aria-hidden="true"
      >
        <rect width="42" height="42" rx="12" fill="currentColor" />
        <path
          d="M11 14.5h8.2c2.4 0 4.3 1.9 4.3 4.3v4.4c0 2.4 1.9 4.3 4.3 4.3H31"
          fill="none"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="11" cy="14.5" r="2.3" fill="#87e4c1" />
        <circle cx="31" cy="27.5" r="2.3" fill="#87e4c1" />
      </svg>
      {!compact && (
        <span>
          <span className="logo__text">ClientFlow <small>CRM</small></span>
          <span className="logo__slogan">Relacionamentos que avançam.</span>
        </span>
      )}
    </div>
  )
}
