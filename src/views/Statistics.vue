<template>
  <div class="statistics">
    <div v-loading.fullscreen.lock="loading"
         element-loading-text="数据加载中..."
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(0, 0, 0, 0.8)">
      <!-- 数据概览卡片 -->
      <el-row :gutter="20" class="data-overview">
        <el-col :span="6">
          <el-card shadow="hover" class="data-card" :body-style="{ padding: '20px' }">
            <div class="data-header">
              <div class="data-title">总任务数</div>
              <div class="icon-wrapper">
                <i class="el-icon-s-order"></i>
                <div class="pulse-ring"></div>
              </div>
            </div>
            <div class="data-content">
              <div class="data-number">
                <count-to
                    :start-val="0"
                    :end-val="statistics.totalTasks"
                    :duration="2500"
                    :autoplay="true"
                    separator=","
                ></count-to>
              </div>
              <div class="data-trend">
                <span :class="{'up': statistics.taskGrowth > 0, 'down': statistics.taskGrowth < 0}">
                  <count-to
                      :start-val="0"
                      :end-val="Math.abs(statistics.taskGrowth)"
                      :duration="2000"
                      :decimals="1"
                      :autoplay="true"
                  ></count-to>%
                  <i :class="statistics.taskGrowth > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                </span>
                较上月
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card shadow="hover" class="data-card" :body-style="{ padding: '20px' }">
            <div class="data-header">
              <div class="data-title">完成率</div>
              <div class="icon-wrapper success">
                <i class="el-icon-s-data"></i>
                <div class="pulse-ring success"></div>
              </div>
            </div>
            <div class="data-content">
              <div class="data-number">
                <count-to
                    :start-val="0"
                    :end-val="statistics.completionRate"
                    :duration="2500"
                    :autoplay="true"
                ></count-to>%
              </div>
              <div class="data-trend">
                <span :class="{'up': statistics.completionGrowth > 0, 'down': statistics.completionGrowth < 0}">
                  <count-to
                      :start-val="0"
                      :end-val="Math.abs(statistics.completionGrowth)"
                      :duration="2000"
                      :decimals="1"
                      :autoplay="true"
                  ></count-to>%
                  <i :class="statistics.completionGrowth > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                </span>
                较上月
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card shadow="hover" class="data-card" :body-style="{ padding: '20px' }">
            <div class="data-header">
              <div class="data-title">异常发现</div>
              <div class="icon-wrapper warning">
                <i class="el-icon-warning"></i>
                <div class="pulse-ring warning"></div>
              </div>
            </div>
            <div class="data-content">
              <div class="data-number">
                <count-to
                    :start-val="0"
                    :end-val="statistics.totalIssues"
                    :duration="2500"
                    :autoplay="true"
                ></count-to>
              </div>
              <div class="data-trend">
                <span :class="{'down': statistics.issueGrowth > 0, 'up': statistics.issueGrowth < 0}">
                  <count-to
                      :start-val="0"
                      :end-val="Math.abs(statistics.issueGrowth)"
                      :duration="2000"
                      :decimals="1"
                      :autoplay="true"
                  ></count-to>%
                  <i :class="statistics.issueGrowth > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                </span>
                较上月
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card shadow="hover" class="data-card" :body-style="{ padding: '20px' }">
            <div class="data-header">
              <div class="data-title">处理及时率</div>
              <div class="icon-wrapper info">
                <i class="el-icon-time"></i>
                <div class="pulse-ring info"></div>
              </div>
            </div>
            <div class="data-content">
              <div class="data-number">
                <count-to
                    :start-val="0"
                    :end-val="statistics.responseRate"
                    :duration="2500"
                    :autoplay="true"
                ></count-to>%
              </div>
              <div class="data-trend">
                <span :class="{'up': statistics.responseGrowth > 0, 'down': statistics.responseGrowth < 0}">
                  <count-to
                      :start-val="0"
                      :end-val="Math.abs(statistics.responseGrowth)"
                      :duration="2000"
                      :decimals="1"
                      :autoplay="true"
                  ></count-to>%
                  <i :class="statistics.responseGrowth > 0 ? 'el-icon-top' : 'el-icon-bottom'"></i>
                </span>
                较上月
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :span="16">
          <el-card shadow="hover" class="chart-card">
            <div slot="header" class="chart-header">
              <span>任务趋势分析</span>
              <el-radio-group v-model="trendTimeRange" size="small">
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>
            <div ref="trendChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="chart-card">
            <div slot="header" class="chart-header">
              <span>任务类型分布</span>
            </div>
            <div ref="typeChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row">
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <div slot="header" class="chart-header">
              <span>区域任务热力图</span>
            </div>
            <div ref="areaChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <div slot="header" class="chart-header">
              <span>异常类型分析</span>
            </div>
            <div ref="issueChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import CountTo from 'vue-count-to'

export default {
  name: 'Statistics',
  components: {
    CountTo
  },
  data() {
    return {
      loading: true,
      trendTimeRange: 'month',
      timer: null,
      statistics: {
        totalTasks: 256,
        taskGrowth: 12.5,
        completionRate: 92,
        completionGrowth: 3.2,
        totalIssues: 15,
        issueGrowth: -8.5,
        responseRate: 95,
        responseGrowth: 2.1
      },
      charts: {
        trend: null,
        type: null,
        area: null,
        issue: null
      }
    }
  },
  watch: {
    trendTimeRange() {
      this.initTrendChart()
    }
  },
  methods: {
    // 初始化所有图表
    initCharts() {
      this.initTrendChart()
      this.initTypeChart()
      this.initAreaChart()
      this.initIssueChart()
    },

    // 初始化趋势图表
    initTrendChart() {
      if (!this.charts.trend) {
        this.charts.trend = echarts.init(this.$refs.trendChart)
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['总任务数', '已完成', '异常数']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.getTrendTimeData(),
          axisLine: {
            lineStyle: {
              color: '#666'
            }
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#666'
            }
          }
        },
        series: [
          {
            name: '总任务数',
            type: 'line',
            smooth: true,
            data: this.getRandomData(12, 40, 90),
            animationDuration: 2000,
            animationEasing: 'cubicInOut',
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '已完成',
            type: 'line',
            smooth: true,
            data: this.getRandomData(12, 30, 80),
            animationDuration: 2000,
            animationEasing: 'cubicInOut',
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '异常数',
            type: 'line',
            smooth: true,
            data: this.getRandomData(12, 0, 20),
            animationDuration: 2000,
            animationEasing: 'cubicInOut',
            itemStyle: {
              color: '#F56C6C'
            }
          }
        ]
      }

      this.charts.trend.setOption(option)
    },

    // 初始化类型分布图表
    initTypeChart() {
      if (!this.charts.type) {
        this.charts.type = echarts.init(this.$refs.typeChart)
      }

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: ['日常巡检', '专项巡检', '临时巡检']
        },
        series: [
          {
            name: '任务类型',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold'
              },
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 50, name: '日常巡检' },
              { value: 30, name: '专项巡检' },
              { value: 20, name: '临时巡检' }
            ],
            animationDuration: 2000,
            animationEasing: 'cubicInOut'
          }
        ]
      }

      this.charts.type.setOption(option)
    },

    // 初始化区域热力图
    initAreaChart() {
      if (!this.charts.area) {
        this.charts.area = echarts.init(this.$refs.areaChart)
      }

      const option = {
        tooltip: {
          position: 'top'
        },
        grid: {
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['车间A', '车间B', '车间C', '车间D'],
          splitArea: {
            show: true
          }
        },
        yAxis: {
          type: 'category',
          data: ['工厂1', '工厂2', '工厂3'],
          splitArea: {
            show: true
          }
        },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '0%',
          inRange: {
            color: ['#e9f7fe', '#409EFF']
          }
        },
        series: [{
          name: '任务数量',
          type: 'heatmap',
          data: this.getHeatmapData(),
          label: {
            show: true
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          animationDuration: 2000,
          animationEasing: 'cubicInOut'
        }]
      }

      this.charts.area.setOption(option)
    },

    // 初始化异常类型分析图表
    initIssueChart() {
      if (!this.charts.issue) {
        this.charts.issue = echarts.init(this.$refs.issueChart)
      }

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: ['设备故障', '参数异常', '安全隐患', '环境问题', '其他']
        },
        series: [
          {
            name: '异常数量',
            type: 'bar',
            data: [5, 4, 3, 2, 1],
            itemStyle: {
              color: function(params) {
                const colors = ['#F56C6C', '#E6A23C', '#409EFF', '#67C23A', '#909399']
                return colors[params.dataIndex]
              }
            },
            label: {
              show: true,
              position: 'right'
            },
            animationDuration: 2000,
            animationEasing: 'cubicInOut'
          }
        ]
      }

      this.charts.issue.setOption(option)
    },

    // 开始实时数据更新
    startRealTimeUpdate() {
      this.timer = setInterval(() => {
        // 更新总任务数
        this.statistics.totalTasks += Math.floor(Math.random() * 5)

        // 更新趋势图数据
        if (this.charts.trend) {
          const option = this.charts.trend.getOption()
          const data = option.series[0].data
          data.shift()
          data.push(this.getRandomData(1, 40, 90)[0])

          this.charts.trend.setOption({
            series: [{
              data: data
            }]
          })
        }
      }, 5000)
    },

    // 获取趋势图时间数据
    getTrendTimeData() {
      const now = new Date()
      const data = []

      if (this.trendTimeRange === 'week') {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        for (let i = 6; i >= 0; i--) {
          data.push(days[new Date(now - i * 24 * 3600 * 1000).getDay()])
        }
      } else if (this.trendTimeRange === 'month') {
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          data.push(`${date.getMonth() + 1}月`)
        }
      } else {
        for (let i = 11; i >= 0; i--) {
          data.push(`${now.getFullYear() - i}年`)
        }
      }

      return data
    },

    // 生成随机数据
    getRandomData(length, min, max) {
      return Array.from({ length }, () =>
          Math.floor(Math.random() * (max - min + 1)) + min
      )
    },

    // 生成热力图数据
    getHeatmapData() {
      const data = []
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
          data.push([j, i, Math.floor(Math.random() * 100)])
        }
      }
      return data
    },

    // 窗口大小改变时重绘图表
    handleResize() {
      Object.values(this.charts).forEach(chart => {
        chart && chart.resize()
      })
    }
  },
  mounted() {
    // 模拟加载过程
    setTimeout(() => {
      this.loading = false
      this.initCharts()
      this.startRealTimeUpdate()
      window.addEventListener('resize', this.handleResize)
    }, 1500)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    window.removeEventListener('resize', this.handleResize)
    Object.values(this.charts).forEach(chart => {
      chart && chart.dispose()
    })
  }
}
</script>
<style scoped>
.statistics {
  padding: 20px;
}

/* 数据卡片样式 */
.data-overview {
  margin-bottom: 20px;
}

.data-card {
  position: relative;
  overflow: hidden;
  height: 120px;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
}

.data-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.1) 100%);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.data-card:hover::before {
  transform: translateX(100%);
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.data-title {
  font-size: 16px;
  color: #606266;
}

.icon-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper.success {
  background: rgba(103, 194, 58, 0.1);
}

.icon-wrapper.warning {
  background: rgba(230, 162, 60, 0.1);
}

.icon-wrapper.info {
  background: rgba(144, 147, 153, 0.1);
}

.icon-wrapper i {
  font-size: 20px;
  color: #409EFF;
  z-index: 1;
}

.icon-wrapper.success i {
  color: #67C23A;
}

.icon-wrapper.warning i {
  color: #E6A23C;
}

.icon-wrapper.info i {
  color: #909399;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: pulse 2s infinite;
  background: rgba(64, 158, 255, 0.2);
}

.pulse-ring.success {
  background: rgba(103, 194, 58, 0.2);
}

.pulse-ring.warning {
  background: rgba(230, 162, 60, 0.2);
}

.pulse-ring.info {
  background: rgba(144, 147, 153, 0.2);
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  70% {
    transform: scale(1.1);
    opacity: 0.3;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

.data-content {
  position: relative;
}

.data-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
}

.data-trend {
  font-size: 12px;
  color: #909399;
}

.data-trend .up {
  color: #67C23A;
}

.data-trend .down {
  color: #F56C6C;
}

/* 图表样式 */
.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
  transform: translateY(50px);
  opacity: 0;
  animation: slideUp 0.8s forwards;
}

@keyframes slideUp {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.chart-card:nth-child(1) { animation-delay: 0.2s; }
.chart-card:nth-child(2) { animation-delay: 0.4s; }
.chart-card:nth-child(3) { animation-delay: 0.6s; }
.chart-card:nth-child(4) { animation-delay: 0.8s; }

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
}

/* 响应式调整 */
@media screen and (max-width: 1400px) {
  .chart-container {
    height: 250px;
  }
}

@media screen and (max-width: 1200px) {
  .el-col-6 {
    width: 50%;
    margin-bottom: 20px;
  }
}

@media screen and (max-width: 768px) {
  .el-col-6 {
    width: 100%;
  }

  .chart-container {
    height: 200px;
  }
}

/* 加载动画样式 */
.el-loading-spinner {
  .el-icon-loading {
    font-size: 30px;
  }

  .el-loading-text {
    font-size: 16px;
    margin-top: 10px;
  }
}
</style>