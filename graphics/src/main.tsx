import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Clip from './Clip.tsx'
import './tailwind.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Clip />
  </StrictMode>,
)
