<template>
  <div class="sidebar-container">
    <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :active-text-color="variables.menuActiveText"
        :unique-opened="false"
        :collapse-transition="false"
        mode="vertical"
    >
      <el-menu-item index="/dashboard">
        <i class="el-icon-s-home" />
        <span slot="title">首页</span>
      </el-menu-item>

      <el-menu-item index="/inspection-task">
        <i class="el-icon-s-order" />
        <span slot="title">巡检任务</span>
      </el-menu-item>

      <el-menu-item index="/alert-rules">
        <i class="el-icon-warning" />
        <span slot="title">预警规则</span>
      </el-menu-item>

      <!-- 其他菜单项 -->
    </el-menu>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  computed: {
    activeMenu() {
      const { path } = this.$route
      return path
    },
    isCollapse() {
      return !this.$store.state.app.sidebar.opened
    },
    variables() {
      return {
        menuBg: '#304156',
        menuText: '#bfcbd9',
        menuActiveText: '#409EFF'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar-container {
  height: 100%;
  background-color: #304156;

  .el-menu {
    border: none;
    height: 100%;
    width: 100%;
  }
}
</style>