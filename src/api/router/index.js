import Vue from 'vue'
import VueRouter from 'vue-router'
import Dashboard from '../views/Dashboard.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/inspection/list',
        name: 'InspectionList',
        component: () => import('../views/Inspection.vue')
    },
    {
        path: '/reports',
        name: 'Reports',
        component: () => import('../views/Reports.vue')
    }
]

const router = new VueRouter({
    routes
})

export default router