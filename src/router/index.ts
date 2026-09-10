import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/levels',
      name: 'levels',
      component: () => import('@/views/LevelSelectView.vue'),
    },
    {
      path: '/play/:levelId',
      name: 'play',
      component: () => import('@/views/PlayView.vue'),
      props: true,
    },
    {
      path: '/museum',
      name: 'museum',
      component: () => import('@/views/MuseumView.vue'),
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('@/views/AchievementsView.vue'),
    },
    {
      path: '/guess',
      name: 'guess',
      component: () => import('@/views/GuessView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
