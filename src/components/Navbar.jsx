export default function Navbar({ route }) {
  const links = [
    { hash: '#/map', key: 'map', label: '足迹' },
    { hash: '#/album', key: 'album', label: '相册' },
  ]
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-white/90 backdrop-blur border-b border-gray-100">
      <a href="#/map" className="text-base font-bold text-gray-900">旅行足迹</a>
      <div className="flex items-center gap-1 text-sm">
        {links.map(({ hash, key, label }) => (
          <a
            key={key}
            href={hash}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              route === key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-[#2761ad]'
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  )
}
