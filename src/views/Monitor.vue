<template>
  <div class="monitor">
    <!-- 实时数据概览 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in realTimeData" :key="index">
        <el-card shadow="hover" :class="{'warning': item.isWarning}">
          <div class="monitor-item">
            <div class="item-icon">
              <i :class="item.icon"></i>
            </div>
            <div class="item-info">
              <div class="item-value">{{ item.value }}{{ item.unit }}</div>
              <div class="item-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时监控图表 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card>
          <div slot="header">
            <span>实时监控数据</span>
            <el-radio-group v-model="monitorType" size="small" style="float: right;">
              <el-radio-button label="temperature">温度</el-radio-button>
              <el-radio-button label="pressure">压力</el-radio-button>
              <el-radio-button label="humidity">湿度</el-radio-button>
            </el-radio-group>
          </div>
          <div id="realTimeChart" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>预警信息</span>
            <el-button
                type="text"
                style="float: right; padding: 3px 0"
                @click="handleAllAlerts">
              查看全部
            </el-button>
          </div>
          <div class="alert-list">
            <div v-for="(alert, index) in alerts" :key="index"
                 class="alert-item"
                 :class="alert.level">
              <div class="alert-time">{{ alert.time }}</div>
              <div class="alert-content">
                <i :class="getAlertIcon(alert.level)"></i>
                {{ alert.message }}
              </div>
              <div class="alert-actions">
                <el-button
                    type="text"
                    size="small"
                    @click="handleAlert(alert)">
                  处理
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 设备状态监控 -->
    <el-card style="margin-top: 20px;">
      <div slot="header">
        <span>设备状态监控</span>
        <el-button-group style="float: right;">
          <el-button size="small" @click="refreshDevices">刷新</el-button>
          <el-button size="small" type="primary" @click="exportDeviceStatus">导出</el-button>
        </el-button-group>
      </div>
      <el-table :data="deviceList" style="width: 100%">
        <el-table-column prop="deviceId" label="设备ID" width="120"></el-table-column>
        <el-table-column prop="name" label="设备名称" width="150"></el-table-column>
        <el-table-column prop="area" label="所在区域" width="150"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="temperature" label="温度" width="100">
          <template slot-scope="scope">
            {{ scope.row.temperature }}℃
          </template>
        </el-table-column>
        <el-table-column prop="pressure" label="压力" width="100">
          <template slot-scope="scope">
            {{ scope.row.pressure }}MPa
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdate" label="最后更新时间" width="180"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
                size="mini"
                @click="handleDeviceDetail(scope.row)">详情</el-button>
            <el-button
                size="mini"
                type="warning"
                @click="handleDeviceMaintenance(scope.row)">维护</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 处理预警弹窗 -->
    <el-dialog
        title="预警处理"
        :visible.sync="alertDialogVisible"
        width="500px">
      <el-form :model="alertForm" label-width="100px">
        <el-form-item label="预警信息">
          <div>{{ currentAlert.message }}</div>
        </el-form-item>
        <el-form-item label="处理方式">
          <el-select v-model="alertForm.method" placeholder="请选择处理方式">
            <el-option label="现场处理" value="onsite"></el-option>
            <el-option label="远程处理" value="remote"></el-option>
            <el-option label="转交专家" value="expert"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input
              type="textarea"
              v-model="alertForm.description"
              rows="3"
              placeholder="请输入处理说明">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="alertDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAlertHandle">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Monitor',
  data() {
    return {
      // 实时数据
      realTimeData: [
        {
          title: '平均温度',
          value: '25.6',
          unit: '℃',
          icon: 'el-icon-temperature',
          isWarning: false
        },
        {
          title: '系统压力',
          value: '0.8',
          unit: 'MPa',
          icon: 'el-icon-gauge',
          isWarning: true
        },
        {
          title: '环境湿度',
          value: '45',
          unit: '%',
          icon: 'el-icon-water',
          isWarning: false
        },
        {
          title: '设备在线率',
          value: '98.5',
          unit: '%',
          icon: 'el-icon-connection',
          isWarning: false
        }
      ],
      monitorType: 'temperature',
      // 预警信息
      alerts: [
        {
          time: '2024-01-20 10:30:25',
          level: 'critical',
          message: '1号反应釜压力异常',
          status: 'pending'
        },
        {
          time: '2024-01-20 10:28:15',
          level: 'warning',
          message: '2号储罐温度升高',
          status: 'pending'
        },
        {
          time: '2024-01-20 10:25:30',
          level: 'info',
          message: '3号管道需要维护',
          status: 'pending'
        }
      ],
      // 设备列表
      deviceList: [
        {
          deviceId: 'DEV001',
          name: '1号反应釜',
          area: '生产区A',
          status: '运行中',
          temperature: 25.6,
          pressure: 0.8,
          lastUpdate: '2024-01-20 10:30:25'
        },
        {
          deviceId: 'DEV002',
          name: '2号储罐',
          area: '储存区B',
          status: '警告',
          temperature: 28.9,
          pressure: 0.9,
          lastUpdate: '2024-01-20 10:30:20'
        }
      ],
      // 预警处理
      alertDialogVisible: false,
      currentAlert: {},
      alertForm: {
        method: '',
        description: ''
      },
      // 实时图表实例
      chart: null
    }
  },
  mounted() {
    this.initRealTimeChart()
    this.startRealTimeUpdate()
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
    }
    clearInterval(this.updateTimer)
  },
  methods: {
    // 初始化实时图表
    initRealTimeChart() {
      this.chart = echarts.init(document.getElementById('realTimeChart'))
      this.updateChart()
      window.addEventListener('resize', () => this.chart.resize())
    },
    // 更新图表数据
    updateChart() {
      const option = {
        title: {
          text: this.getMonitorTitle()
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: true
          }
        },
        series: [{
          name: this.getMonitorTitle(),
          type: 'line',
          smooth: true,
          data: this.generateMockData(),
          areaStyle: {
            opacity: 0.3
          }
        }]
      }
      this.chart.setOption(option)
    },
    // 生成模拟数据
    generateMockData() {
      const now = new Date()
      const data = []
      for (let i = 0; i < 100; i++) {
        const time = new Date(now - (100 - i) * 1000)
        let value
        switch (this.monitorType) {
          case 'temperature':
            value = 25 + Math.random() * 2
            break
          case 'pressure':
            value = 0.8 + Math.random() * 0.2
            break
          case 'humidity':
            value = 45 + Math.random() * 5
            break
        }
        data.push([time, value])
      }
      return data
    },
    // 开始实时更新
    startRealTimeUpdate() {
      this.updateTimer = setInterval(() => {
        const data = this.chart.getOption().series[0].data
        const now = new Date()
        data.shift()
        let value
        switch (this.monitorType) {
          case 'temperature':
            value = 25 + Math.random() * 2
            break
          case 'pressure':
            value = 0.8 + Math.random() * 0.2
            break
          case 'humidity':
            value = 45 + Math.random() * 5
            break
        }
        data.push([now, value])
        this.chart.setOption({
          series: [{
            data: data
          }]
        })
      }, 1000)
    },
    // 获取监控项标题
    getMonitorTitle() {
      const titles = {
        temperature: '温度监控',
        pressure: '压力监控',
        humidity: '湿度监控'
      }
      return titles[this.monitorType]
    },
    // 获取预警图标
    getAlertIcon(level) {
      const icons = {
        critical: 'el-icon-error',
        warning: 'el-icon-warning',
        info: 'el-icon-info'
      }
      return icons[level]
    },
    // 获取设备状态样式
    getStatusType(status) {
      const types = {
        '运行中': 'success',
        '警告': 'warning',
        '故障': 'danger',
        '维护中': 'info'
      }
      return types[status]
    },
    // 处理预警
    handleAlert(alert) {
      this.currentAlert = alert
      this.alertDialogVisible = true
    },
    // 查看所有预警
    handleAllAlerts() {
      this.$router.push('/alerts')
    },
    // 提交预警处理
    submitAlertHandle() {
      if (!this.alertForm.method || !this.alertForm.description) {
        this.$message.warning('请完善处理信息')
        return
      }
      // 这里添加处理逻辑
      this.$message.success('预警处理成功')
      this.alertDialogVisible = false
    },
    // 刷新设备列表
    refreshDevices() {
      this.$message.success('刷新成功')
    },
    // 导出设备状态
    exportDeviceStatus() {
      // 这里添加导出逻辑
      this.$message.success('导出成功')
    },
    // 查看设备详情
    handleDeviceDetail(device) {
      this.$router.push(`/device/${device.deviceId}`)
    },
    // 设备维护
    handleDeviceMaintenance(device) {
      this.$message.success(`开始维护设备：${device.name}`)
    }
  },
  watch: {
    monitorType() {
      this.updateChart()
    }
  }
}
</script>

<style scoped>
.monitor {
  padding: 20px;
}

.monitor-item {
  display: flex;
  align-items: center;
}

.item-icon {
  font-size: 24px;
  margin-right: 15px;
  color: #409EFF;
}

.item-info {
  flex: 1;
}

.item-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.item-title {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.warning .item-value {
  color: #E6A23C;
}

.alert-list {
  max-height: 350px;
  overflow-y: auto;
}

.alert-item {
  padding: 10px;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-item:hover {
  background-color: #F5F7FA;
}

.alert-time {
  font-size: 12px;
  color: #909399;
}

.alert-content {
  margin: 5px 0;
}

.alert-content i {
  margin-right: 5px;
}

.alert-actions {
  text-align: right;
}

.critical i {
  color: #F56C6C;
}

.warning i {
  color: #E6A23C;
}

.info i {
  color: #909399;
}
</style>