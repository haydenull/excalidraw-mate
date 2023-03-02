import React from 'react'
import ReactDOM from 'react-dom/client'
import '@total-typescript/ts-reset'
import App from './App'
import './index.css'
import rewriteFont from './lib/rewriteFont'

rewriteFont('Virgil', 'https://pocket.haydenhayden.com/font/chinese.woff2')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
