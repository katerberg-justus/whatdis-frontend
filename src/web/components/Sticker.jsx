import { getStickerUrl } from '../assets/stickers'

export function stickerFrameTier(guessCount) {
  if (guessCount < 20) return 'gold'
  if (guessCount < 40) return 'silver'
  return 'bronze'
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
  const url = getStickerUrl(sticker ?? icon)

  if (tier) {
    return (
      <Tag
        className={['collectibles__sticker', `collectibles__sticker--${tier}`, className].filter(Boolean).join(' ')}
        {...rest}
      >
        <span className="collectibles__sticker-icon" aria-hidden="true">
          {url ? <img src={url} alt="" /> : (icon || '?')}
        </span>
        {name && <span className="collectibles__sticker-name">{name}</span>}
      </Tag>
    )
  }

  if (url) return <img className={imgClassName} src={url} alt="" aria-hidden="true" />
  if (icon) return <span className={iconClassName}>{icon}</span>
  return null
}
