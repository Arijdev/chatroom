import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
const rootEl = document.getElementById('root');
// Small visible fallback + console signal to help debug blank page issues.
if (rootEl) rootEl.textContent = 'Mounting...';
console.log('Starting React app');

if (!rootEl) {
  // Defensive fallback if the root container is missing in the served HTML
  document.body.textContent = 'Error: #root element not found in the page';
  console.error('Root element not found');
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
