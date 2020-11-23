import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/home.vue';
import Sample1 from './views/sample1.vue';
import Sample2 from './views/sample2.vue';
import Login from './views/login.vue';
import RC from './views/rc.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/sample1',
      name: 'sample1',
      component: Sample1
    },
    {
      path: '/sample2',
      name: 'sample2',
      component: Sample2
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/rc',
      name: 'rc',
      component: RC,
    },
  ]
});
