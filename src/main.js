import Vue from 'vue'
import App from './App.vue'
import Axios from 'axios'

import 'lib-flexible'

Vue.prototype.$http = Axios

new Vue({
    el: '#app',
    render: h => h(App)
})