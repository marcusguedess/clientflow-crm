export default function PixelAvatar({ avatar, size = 48, animated = false }) {
  const accessory = avatar?.accessory || 'none'
  const hairStyle = avatar?.hairStyle || 'short'
  const outfit = avatar?.outfit || 'shirt'
  const skin = avatar?.skin || '#d99b72'
  const hair = avatar?.hair || '#34251f'
  const shirt = avatar?.shirt || '#315ed9'

  return (
    <svg
      className={`pixel-avatar ${animated ? 'pixel-avatar--animated' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Avatar pixel art"
      shapeRendering="crispEdges"
    >
      <ellipse cx="16" cy="30" rx="10" ry="2" fill="rgba(29,35,52,.22)" />
      {hairStyle === 'short' && <rect x="8" y="3" width="16" height="6" fill={hair} />}
      {hairStyle === 'long' && <><rect x="7" y="3" width="18" height="7" fill={hair} /><rect x="5" y="8" width="5" height="14" fill={hair} /><rect x="22" y="8" width="5" height="14" fill={hair} /></>}
      {hairStyle === 'curly' && <><rect x="8" y="2" width="5" height="5" fill={hair} /><rect x="13" y="1" width="6" height="6" fill={hair} /><rect x="19" y="3" width="6" height="5" fill={hair} /><rect x="6" y="6" width="5" height="5" fill={hair} /></>}
      {hairStyle === 'bun' && <><rect x="8" y="4" width="16" height="5" fill={hair} /><rect x="13" y="0" width="7" height="5" fill={hair} /></>}
      {hairStyle === 'mohawk' && <><rect x="14" y="0" width="5" height="8" fill={hair} /><rect x="10" y="5" width="13" height="4" fill={hair} /></>}
      {hairStyle === 'afro' && <><circle cx="9" cy="6" r="5" fill={hair} /><circle cx="16" cy="4" r="6" fill={hair} /><circle cx="23" cy="6" r="5" fill={hair} /><rect x="7" y="6" width="18" height="5" fill={hair} /></>}
      {hairStyle === 'braids' && <><rect x="8" y="3" width="16" height="6" fill={hair} /><rect x="5" y="8" width="3" height="15" fill={hair} /><rect x="24" y="8" width="3" height="15" fill={hair} /><rect x="4" y="21" width="5" height="3" fill={hair} /><rect x="23" y="21" width="5" height="3" fill={hair} /></>}
      {hairStyle === 'sidecut' && <><rect x="12" y="2" width="12" height="7" fill={hair} /><rect x="9" y="5" width="5" height="4" fill={hair} /></>}
      <rect x="7" y="8" width="18" height="10" fill={skin} />
      <rect x="7" y="7" width="4" height="7" fill={hair} />
      <rect x="21" y="7" width="4" height="6" fill={hair} />
      <rect x="10" y="11" width="3" height="3" fill="#273142" />
      <rect x="19" y="11" width="3" height="3" fill="#273142" />
      <rect className="pixel-eye-shine" x="11" y="11" width="1" height="1" fill="#fff" />
      <rect className="pixel-eye-shine" x="20" y="11" width="1" height="1" fill="#fff" />
      <rect x="15" y="13" width="2" height="2" fill="rgba(142,77,58,.35)" />
      <rect x="8" y="15" width="3" height="1" fill="rgba(224,104,113,.3)" />
      <rect x="21" y="15" width="3" height="1" fill="rgba(224,104,113,.3)" />
      <rect x="14" y="16" width="4" height="1.5" fill="#9d5d55" />
      <rect x="8" y="19" width="16" height="11" fill={shirt} />
      <rect x="4" y="21" width="4" height="8" fill={skin} />
      <rect x="24" y="21" width="4" height="8" fill={skin} />
      {outfit === 'suit' && <><rect x="14" y="19" width="4" height="11" fill="#f5f7fb" /><rect x="15" y="20" width="2" height="6" fill="#28334b" /><rect x="8" y="19" width="5" height="11" fill={shirt} /><rect x="19" y="19" width="5" height="11" fill={shirt} /></>}
      {outfit === 'blazer' && <><path d="M8 19h6l2 5 2-5h6v11H8Z" fill={shirt} /><rect x="15" y="19" width="2" height="8" fill="#f6eef4" /></>}
      {outfit === 'dress' && <><path d="M10 19h12l4 11H6Z" fill={shirt} /><rect x="14" y="19" width="4" height="4" fill="#f8d8e8" /></>}
      {outfit === 'skirt' && <><rect x="8" y="19" width="16" height="6" fill={shirt} /><path d="M10 24h12l3 6H7Z" fill={shirt} /></>}
      {outfit === 'jacket' && <><rect x="8" y="19" width="16" height="11" fill={shirt} /><rect x="15" y="19" width="2" height="11" fill="#f0d095" /><rect x="9" y="22" width="4" height="2" fill="#29344b" /><rect x="19" y="22" width="4" height="2" fill="#29344b" /></>}
      {outfit === 'hoodie' && <><rect x="8" y="19" width="16" height="11" fill={shirt} /><rect x="11" y="18" width="10" height="5" rx="2" fill={shirt} /><rect x="15" y="20" width="1" height="6" fill="#f4f5f7" /><rect x="18" y="20" width="1" height="6" fill="#f4f5f7" /></>}
      {outfit === 'vest' && <><rect x="8" y="19" width="16" height="11" fill="#f4f5f7" /><rect x="8" y="19" width="6" height="11" fill={shirt} /><rect x="18" y="19" width="6" height="11" fill={shirt} /><rect x="15" y="22" width="2" height="2" fill="#27334b" /></>}
      {outfit === 'overalls' && <><rect x="8" y="19" width="16" height="11" fill="#f0d4a2" /><rect x="11" y="21" width="10" height="9" fill={shirt} /><rect x="11" y="19" width="3" height="5" fill={shirt} /><rect x="18" y="19" width="3" height="5" fill={shirt} /></>}
      <rect x="9" y="29" width="6" height="2" fill="#26334d" />
      <rect x="17" y="29" width="6" height="2" fill="#26334d" />
      {accessory === 'glasses' && (
        <>
          <rect x="8" y="10" width="6" height="5" fill="none" stroke="#17233c" strokeWidth="1.5" />
          <rect x="18" y="10" width="6" height="5" fill="none" stroke="#17233c" strokeWidth="1.5" />
          <rect x="14" y="12" width="4" height="1.5" fill="#17233c" />
        </>
      )}
      {accessory === 'headset' && (
        <>
          <rect x="5" y="8" width="2" height="8" fill="#303a50" />
          <rect x="25" y="8" width="2" height="8" fill="#303a50" />
          <rect x="7" y="5" width="18" height="2" fill="#303a50" />
          <rect x="23" y="16" width="5" height="2" fill="#303a50" />
        </>
      )}
      {accessory === 'cap' && (
        <>
          <rect x="8" y="2" width="15" height="5" fill={shirt} />
          <rect x="21" y="6" width="7" height="2" fill={shirt} />
        </>
      )}
      {accessory === 'hat' && <><rect x="9" y="0" width="14" height="6" fill="#6b4b83" /><rect x="5" y="5" width="22" height="3" fill="#8b65a3" /></>}
    </svg>
  )
}
