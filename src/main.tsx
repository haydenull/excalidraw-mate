import React from 'react'
import ReactDOM from 'react-dom/client'
import '@total-typescript/ts-reset'
import App from './App'
import './index.css'
import rewriteAllFont from '@/lib/rewriteFont'

rewriteAllFont()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
