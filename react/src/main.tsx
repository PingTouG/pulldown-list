import React from 'react'
import ReactDOM from 'react-dom'
import vhCheck from "vh-check"
import App from './App'

vhCheck()

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
