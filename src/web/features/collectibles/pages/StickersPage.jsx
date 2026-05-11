import { useLang } from '../../../context/LangContext'
import './CollectiblesPage.scss'

export default function StickersPage() {
  const { t } = useLang()

  return (
    <div className="collectibles__empty">
      {t('collectibles.noStickers')}
    </div>
  )
}
