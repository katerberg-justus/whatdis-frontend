import { getStickerSources } from '../assets/stickers'

export function stickerFrameTier(guessCount) {
  if (guessCount < 20) return 'gold'
  if (guessCount < 40) return 'silver'
  return 'bronze'
}

function StickerImage({ sources, className, ariaHidden = true }) {
  const { webp, png } = sources
  const fallback = png ?? webp
  return (
    <picture>
      {webp && <source srcSet={webp} type="image/webp" />}
      {png && <source srcSet={png} type="image/png" />}
      <img
        className={className}
        src={fallback}
        alt=""
        {...(ariaHidden ? { 'aria-hidden': 'true' } : {})}
      />
    </picture>
  )
}

export default function Sticker({
  sticker,
  icon,
  name,
  tier,
  as: Tag = 'div',
  className,
  imgClassName,
  iconClassName,
  ...rest
}) {
  const sources = getStickerSources(sticker ?? icon)

  if (tier) {
    return (
      <Tag
        className={['collectibles__sticker', `collectibles__sticker--${tier}`, className].filter(Boolean).join(' ')}
        {...rest}
      >
        <span className="collectibles__sticker-icon" aria-hidden="true">
          {sources ? <StickerImage sources={sources} /> : (icon || '?')}
        </span>
        {name && <span className="collectibles__sticker-name">{name}</span>}
      </Tag>
    )
  }

  if (sources) return <StickerImage sources={sources} className={imgClassName} />
  if (icon) return <span className={iconClassName}>{icon}</span>
  return null
}
