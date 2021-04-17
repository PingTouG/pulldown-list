import Vue from "vue";
import App from "./App.vue";
import vhCheck from "vh-check";

Vue.config.productionTip = false;

vhCheck();

new Vue({
  render: (h) => h(App),
}).$mount("#app");
