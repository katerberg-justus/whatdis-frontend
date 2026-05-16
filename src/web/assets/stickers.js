const pngModules = import.meta.glob('./stickers/*.png', {
  eager: true,
  import: 'default',
})

const webpModules = import.meta.glob('./stickers/*.webp', {
  eager: true,
  import: 'default',
})

function buildMap(modules, ext) {
  return Object.fromEntries(
    Object.entries(modules).map(([path, url]) => {
      const filename = path.split('/').pop()
      return [filename.replace(new RegExp(`\\.${ext}$`, 'i'), ''), url]
    }),
  )
}

const pngUrls = buildMap(pngModules, 'png')
const webpUrls = buildMap(webpModules, 'webp')

export function getStickerUrl(sticker) {
  if (!sticker) return null
  return webpUrls[sticker] ?? pngUrls[sticker] ?? null
}

export function getStickerSources(sticker) {
  if (!sticker) return null
  const webp = webpUrls[sticker] ?? null
  const png = pngUrls[sticker] ?? null
  if (!webp && !png) return null
  return { webp, png }
}
