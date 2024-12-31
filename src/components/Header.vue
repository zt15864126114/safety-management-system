<template>
  <div class="header">
    <div class="left">
      <i class="el-icon-s-fold" @click="toggleSidebar"></i>
      <breadcrumb />
    </div>
    <div class="right">
      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          管理员 <i class="el-icon-arrow-down"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>个人信息</el-dropdown-item>
          <el-dropdown-item>修改密码</el-dropdown-item>
          <el-dropdown-item divided>退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppHeader',
  methods: {
    toggleSidebar() {
      // 实现侧边栏折叠功能
    }
  }
}
</script>

<style scoped>
.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.left {
  display: flex;
  align-items: center;
}

.el-icon-s-fold {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}
</style>