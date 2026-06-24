import { useState, useEffect, useRef, useCallback } from 'react'
import { gallery } from '../data/travels'

export default function Album({ focus }) {
  const [viewer, setViewer] = useState(null)
  const [highlight, setHighlight] = useState(null)
  const sectionRefs = useRef({})

  useEffect(() => {
    if (!focus?.place) return
    const el = sectionRefs.current[focus.place]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlight(focus.place)
      const t = setTimeout(() => setHighlight(null), 1600)
      return () => clearTimeout(t)
    }
  }, [focus])

  const open = (item, index) => {
    setViewer({ item, index })
    document.body.style.overflow = 'hidden'
  }
  const close = useCallback(() => {
    setViewer(null)
    document.body.style.overflow = ''
  }, [])
  const step = useCallback((dir) => {
    setViewer((v) => v && ({
      ...v,
      index: (v.index + dir + v.item.photos.length) % v.item.photos.length,
    }))
  }, [])
  const jump = useCallback((index) => {
    setViewer((v) => v && ({ ...v, index }))
  }, [])

  useEffect(() => {
    if (!viewer) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewer, close, step])

  useEffect(() => {
    if (!viewer) return
    const { item, index } = viewer
    ;[index + 1, index - 1].forEach((i) => {
      const src = item.photos[(i + item.photos.length) % item.photos.length]
      if (src) {
        const img = new Image()
        img.src = src
      }
    })
  }, [viewer])

  return (
    <section id="album" className="pt-20 pb-16 px-6 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900">相册</h2>
          <p className="text-sm text-gray-400 mt-2">{gallery.length} 个地点 · 点击地图红点可定位</p>
        </div>

        <div className="space-y-10">
          {gallery.map((item) => (
            <div
              key={item.place}
              ref={(el) => (sectionRefs.current[item.place] = el)}
              className={`scroll-mt-20 rounded-xl transition-all duration-500 ${
                highlight === item.place ? 'ring-2 ring-[#d84d4d]/50 bg-red-50/40 -mx-3 px-3 py-3' : ''
              }`}
            >
              <div className="flex items-baseline gap-2 mb-3">
                <h3 className="text-base font-medium text-gray-800">{item.place}</h3>
                <span className="text-xs text-gray-400">{item.photos.length} 张</span>
              </div>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {item.photos.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => open(item, i)}
                    className="group block overflow-hidden rounded-lg bg-gray-100 aspect-[4/3] relative"
                  >
                    <img
                      src={src}
                      alt={item.place}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {viewer && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col animate-[fadeIn_.2s_ease-out]"
          onClick={close}
        >
          {/* 顶栏 */}
          <div
            className="flex items-center justify-between px-5 md:px-8 h-14 shrink-0 text-white/90"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-base font-medium">{viewer.item.place}</span>
              <span className="text-white/40 text-sm tabular-nums">
                {viewer.index + 1} / {viewer.item.photos.length}
              </span>
            </div>
            <button
              onClick={close}
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 text-2xl leading-none transition-colors"
              aria-label="关闭 (Esc)"
            >×</button>
          </div>

          {/* 主图区 */}
          <div className="flex-1 min-h-0 relative flex items-center justify-center px-4">
            <img
              key={viewer.index}
              src={viewer.item.photos[viewer.index]}
              alt={viewer.item.place}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl animate-[fadeIn_.25s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            />

            {viewer.item.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); step(-1) }}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl backdrop-blur transition-all"
                  aria-label="上一张 (←)"
                >‹</button>
                <button
                  onClick={(e) => { e.stopPropagation(); step(1) }}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl backdrop-blur transition-all"
                  aria-label="下一张 (→)"
                >›</button>
              </>
            )}
          </div>

          {/* 底部缩略图条 */}
          {viewer.item.photos.length > 1 && (
            <div
              className="shrink-0 flex justify-center gap-2 px-4 py-4 overflow-x-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {viewer.item.photos.map((src, i) => (
                <button
                  key={i}
                  onClick={() => jump(i)}
                  className={`shrink-0 w-16 h-12 rounded-md overflow-hidden ring-2 transition-all ${
                    i === viewer.index
                      ? 'ring-white opacity-100'
                      : 'ring-transparent opacity-50 hover:opacity-90'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
