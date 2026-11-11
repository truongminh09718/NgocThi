import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const publicModule = (path: string) => new URL(`${import.meta.env.BASE_URL}${path}`, window.location.origin).href
const momentsUrl = publicModule('assets/moments/moments.js')

window.stuMarketMoments = {
  mount: async (element) => (await import(/* @vite-ignore */ momentsUrl)).mount(element),
}

void import(/* @vite-ignore */ publicModule('assets/system.js'))
void import(/* @vite-ignore */ publicModule('assets/motion/motion.js'))
void import(/* @vite-ignore */ momentsUrl)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
