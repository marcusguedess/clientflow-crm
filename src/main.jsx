import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/product-shell.css'
import './styles/dashboard-home.css'
import './styles/three-showcase.css'
import './styles/performance-dashboard.css'
import './styles/control-surfaces.css'
import './styles/personalization.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
