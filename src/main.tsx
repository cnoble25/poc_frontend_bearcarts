import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/robot.css'

// No StrictMode: its double-mount races drei <Html>'s internal React roots and
// can leave a printed panel permanently unmounted.
createRoot(document.getElementById('root')!).render(<App />)
