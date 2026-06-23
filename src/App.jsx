import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import MapSection from './components/MapSection'
import Album from './components/Album'

function useHashRoute() {
  const get = () => (window.location.hash.replace('#/', '') || 'map')
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const onHash = () => setRoute(get())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export default function App() {
  const route = useHashRoute()
  // 地图点击地点 → 跳转相册并定位
  const [focus, setFocus] = useState(null)

  const selectPlace = (place) => {
    setFocus({ place, ts: Date.now() })
    window.location.hash = '#/album'
  }

  return (
    <div className="bg-white text-gray-800">
      <Navbar route={route} />
      {route === 'album' ? <Album focus={focus} /> : <MapSection onSelectPlace={selectPlace} />}
    </div>
  )
}
