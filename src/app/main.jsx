import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { registrarSW } from './registrarSW.js'
import './estilos.css'

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

/* que la app abra sin conexión: en el gimnasio muchas veces no hay */
registrarSW()
