import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './web/index.scss'
import App from './web/App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
