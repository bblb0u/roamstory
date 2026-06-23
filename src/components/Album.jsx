import { useState, useEffect, useRef, useCallback } from 'react'
import { gallery } from '../data/travels'

export default function Album({ focus }) {
  const [viewer, setViewer] = useState(null) // { item, index }
  const [highlight, setHighlight] = useState(null)
  const sectionRefs = useRef({})

  // 地图点击联动：滚动到对应地点 + 高亮
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

  // 键盘操作：← → 切换，ESC 关闭
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

  // 预加载相邻图片
  useEffect(() => {
    if (!viewer) return
    const { item, index } = viewer
    ;[index + 1, index - 1].forEach((i) => {
      const src = item.photos[(i + item.photos.length) % item.photos.length]
      if (src) { const img = new Image(); img.src = src }
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
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-[fadeIn_.2s_ease-out]"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-5 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white text-3xl leading-none transition-colors"
            aria-label="关闭"
          >×</button>

          <img
            key={viewer.index}
            src={viewer.item.photos[viewer.index]}
            alt={viewer.item.place}
            className="max-h-[86vh] max-w-[92vw] object-contain rounded shadow-2xl animate-[fadeIn_.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm flex items-center gap-2">
            <span>{viewer.item.place}</span>
            <span className="text-white/30">·</span>
            <span className="tabular-nums">{viewer.index + 1} / {viewer.item.photos.length}</span>
          </div>

          {viewer.item.photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); step(-1) }}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white text-2xl transition-all"
                aria-label="上一张"
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); step(1) }}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white text-2xl transition-all"
                aria-label="下一张"
              >›</button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
