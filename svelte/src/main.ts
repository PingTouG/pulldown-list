import App from './App.svelte'
import vhCheck from "vh-check";

vhCheck();

const app = new App({
  target: document.getElementById('app')
})

export default app
