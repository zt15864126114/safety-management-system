<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="(item, index) in statistics" :key="index">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-title">{{ item.title }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 监控数据 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">实时监控数据</div>
          <div style="height: 300px;">
            <!-- 这里可以放置图表 -->
            <div>监控数据展示区域</div>
          </div>
        </el-card>
      </el-col>

      <!-- 预警信息 -->
      <el-col :span="12">
        <el-card>
          <div slot="header">预警信息</div>
          <el-table :data="alerts" style="width: 100%">
            <el-table-column prop="date" label="日期" width="180"></el-table-column>
            <el-table-column prop="type" label="类型" width="100"></el-table-column>
            <el-table-column prop="message" label="信息"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      statistics: [
        { title: '今日巡检', value: '24' },
        { title: '待处理预警', value: '3' },
        { title: '本月完成率', value: '98%' },
        { title: '设备在线率', value: '99.9%' }
      ],
      alerts: [
        { date: '2024-01-20 10:30', type: '温度', message: '设备A温度超标' },
        { date: '2024-01-20 09:15', type: '压力', message: '管道B压力异常' }
      ]
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.stat-title {
  margin-top: 10px;
  color: #666;
}
</style>