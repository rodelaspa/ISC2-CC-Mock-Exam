/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress expected Vite dev server WebSocket proxy disconnection errors in iframe preview
window.addEventListener('unhandledrejection', (event) => {
  const msg = event?.reason?.message || String(event?.reason || '');
  if (
    msg.includes('WebSocket') ||
    msg.includes('failed to connect to websocket') ||
    msg.includes('closed without opened')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
