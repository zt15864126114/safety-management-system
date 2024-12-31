<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="header-content">
          <div class="logo">
            <i class="el-icon-monitor"></i>
            <span>设备巡检管理系统</span>
          </div>
          <div class="user-info">
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                管理员 <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-container class="main-container">
        <el-aside width="200px">
          <el-menu
              :default-active="activeMenu"
              class="el-menu-vertical"
              background-color="#304156"
              text-color="#bfcbd9"
              active-text-color="#409EFF"
              @select="handleMenuSelect">
            <el-menu-item index="inspection-task">
              <i class="el-icon-s-order"></i>
              <span slot="title">巡检任务</span>
            </el-menu-item>
            <el-menu-item index="alert-rules">
              <i class="el-icon-warning"></i>
              <span slot="title">预警规则</span>
            </el-menu-item>
            <el-menu-item index="statistics">
              <i class="el-icon-s-data"></i>
              <span slot="title">统计分析</span>
            </el-menu-item>
            <el-menu-item index="system-settings">
              <i class="el-icon-setting"></i>
              <span slot="title">系统设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-main>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentMenuTitle }}</el-breadcrumb-item>
          </el-breadcrumb>

          <div class="main-content">
            <keep-alive>
              <component :is="currentComponent"></component>
            </keep-alive>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import InspectionTask from './views/InspectionTask.vue'
import AlertRules from './views/AlertRules.vue'
import Statistics from './views/Statistics.vue'

export default {
  name: 'App',
  components: {
    InspectionTask,
    AlertRules,
    Statistics
  },
  data() {
    return {
      activeMenu: 'inspection-task',
      menuTitles: {
        'inspection-task': '巡检任务',
        'alert-rules': '预警规则',
        'statistics': '统计分析',
        'system-settings': '系统设置'
      }
    }
  },
  computed: {
    currentMenuTitle() {
      return this.menuTitles[this.activeMenu]
    },
    currentComponent() {
      const componentMap = {
        'inspection-task': 'InspectionTask',
        'alert-rules': 'AlertRules',
        'statistics': 'Statistics',
        'system-settings': 'SystemSettings'
      }
      return componentMap[this.activeMenu]
    }
  },
  methods: {
    handleMenuSelect(index) {
      this.activeMenu = index
    }
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  color: #2c3e50;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  position: relative;
  z-index: 1;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}

.logo i {
  margin-right: 10px;
  font-size: 24px;
  color: #409EFF;
}

.user-info {
  cursor: pointer;
}

.el-dropdown-link {
  color: #333;
}

.main-container {
  height: calc(100vh - 60px);
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.el-menu {
  border-right: none;
}

.el-menu-vertical {
  height: 100%;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.main-content {
  background-color: #fff;
  border-radius: 4px;
  margin-top: 20px;
  min-height: calc(100vh - 160px);
}

.el-breadcrumb {
  line-height: 40px;
}

.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #909399;
}

.coming-soon i {
  font-size: 48px;
  margin-bottom: 20px;
}

.coming-soon p {
  font-size: 16px;
}
</style>