const stickerModules = import.meta.glob('./stickers/*.png', {
  eager: true,
  import: 'default',
})

const stickerUrls = Object.fromEntries(
  Object.entries(stickerModules).map(([path, url]) => {
    const filename = path.split('/').pop()
    return [filename.replace(/\.png$/i, ''), url]
  }),
)

export function getStickerUrl(sticker) {
  if (!sticker) return null
  return stickerUrls[sticker] ?? null
}
