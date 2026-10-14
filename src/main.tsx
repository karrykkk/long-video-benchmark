import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './BenchmarkGlobal.css'
import BenchmarkApp from './BenchmarkApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BenchmarkApp />
  </StrictMode>,
)
