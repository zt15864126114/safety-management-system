<template>
  <div class="report-generator">
    <!-- 顶部工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="left-tools">
          <el-button-group>
            <el-button
                type="primary"
                icon="el-icon-plus"
                @click="createNewReport">
              新建报表
            </el-button>
            <el-button
                type="success"
                icon="el-icon-download"
                @click="exportReport"
                :disabled="!reportConfig.name">
              导出报表
            </el-button>
            <el-button
                type="warning"
                icon="el-icon-refresh"
                @click="refreshReport"
                :disabled="!reportConfig.name">
              刷新数据
            </el-button>
            <el-button
                type="info"
                icon="el-icon-document-copy"
                @click="saveAsTemplate"
                :disabled="!reportConfig.name">
              存为模板
            </el-button>
          </el-button-group>
        </div>
        <div class="right-tools">
          <el-select
              v-model="currentTemplate"
              placeholder="选择模板"
              @change="handleTemplateChange"
              style="width: 200px">
            <el-option
                v-for="item in templates"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ item.description }}
              </span>
            </el-option>
          </el-select>
        </div>
      </div>
    </el-card>

    <!-- 主要内容区 -->
    <el-container class="main-container">
      <!-- 左侧配置面板 -->
      <el-aside width="300px" class="config-panel">
        <el-card class="full-height">
          <div slot="header" class="panel-header">
            <span>报表配置</span>
            <el-button
                type="text"
                icon="el-icon-refresh"
                @click="resetConfig">
              重置
            </el-button>
          </div>

          <el-form
              ref="configForm"
              :model="reportConfig"
              label-position="top">
            <!-- 基础信息 -->
            <el-form-item label="报表名称" required>
              <el-input
                  v-model="reportConfig.name"
                  placeholder="请输入报表名称">
              </el-input>
            </el-form-item>

            <el-form-item label="时间范围" required>
              <el-date-picker
                  v-model="reportConfig.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :picker-options="pickerOptions"
                  style="width: 100%">
              </el-date-picker>
            </el-form-item>

            <!-- 数据源配置 -->
            <el-divider content-position="left">数据源</el-divider>
            <el-form-item
                v-for="(source, index) in reportConfig.dataSources"
                :key="index"
                :label="`数据源 ${index + 1}`">
              <div class="data-source-item">
                <el-select
                    v-model="source.type"
                    placeholder="选择类型"
                    style="width: 100%">
                  <el-option label="巡检任务" value="inspection"></el-option>
                  <el-option label="预警记录" value="alert"></el-option>
                  <el-option label="设备状态" value="device"></el-option>
                </el-select>
                <el-button
                    type="text"
                    icon="el-icon-delete"
                    @click="removeDataSource(index)"
                    class="delete-btn">
                </el-button>
              </div>
              <!-- 数据源特定配置 -->
              <div class="source-config" v-if="source.type">
                <el-checkbox-group v-model="source.fields">
                  <el-checkbox
                      v-for="field in getAvailableFields(source.type)"
                      :key="field.value"
                      :label="field.value">
                    {{ field.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </el-form-item>

            <el-button
                type="text"
                icon="el-icon-plus"
                @click="addDataSource">
              添加数据源
            </el-button>

            <!-- 图表配置 -->
            <el-divider content-position="left">图表配置</el-divider>
            <draggable
                v-model="reportConfig.charts"
                group="charts"
                handle=".chart-drag-handle"
                ghost-class="ghost"
                @start="drag=true"
                @end="drag=false">
              <div
                  v-for="(chart, index) in reportConfig.charts"
                  :key="index"
                  class="chart-config-item">
                <div class="chart-header">
                  <i class="el-icon-rank chart-drag-handle"></i>
                  <el-select
                      v-model="chart.type"
                      placeholder="选择图表类型"
                      style="width: 120px">
                    <el-option label="折线图" value="line"></el-option>
                    <el-option label="柱状图" value="bar"></el-option>
                    <el-option label="饼图" value="pie"></el-option>
                    <el-option label="表格" value="table"></el-option>
                  </el-select>
                  <el-button
                      type="text"
                      icon="el-icon-delete"
                      @click="removeChart(index)">
                  </el-button>
                </div>
                <!-- 图表特定配置 -->
                <div class="chart-detail-config" v-if="chart.type">
                  <el-form-item label="标题">
                    <el-input v-model="chart.title"></el-input>
                  </el-form-item>
                  <el-form-item label="数据源">
                    <el-select
                        v-model="chart.dataSource"
                        placeholder="选择数据源">
                      <el-option
                          v-for="(source, idx) in reportConfig.dataSources"
                          :key="idx"
                          :label="`数据源 ${idx + 1}`"
                          :value="idx">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </div>
            </draggable>

            <el-button
                type="text"
                icon="el-icon-plus"
                @click="addChart">
              添加图表
            </el-button>
          </el-form>
        </el-card>
      </el-aside>

      <!-- 右侧预览区 -->
      <el-main class="preview-panel">
        <el-card class="full-height">
          <div slot="header" class="panel-header">
            <span>报表预览</span>
            <div class="preview-tools">
              <el-radio-group
                  v-model="previewMode"
                  size="small">
                <el-radio-button label="edit">编辑</el-radio-button>
                <el-radio-button label="preview">预览</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div class="report-content" :class="{ 'preview-mode': previewMode === 'preview' }">
            <!-- 报表标题 -->
            <div class="report-header">
              <h2>{{ reportConfig.name || '未命名报表' }}</h2>
              <p class="report-time">
                生成时间：{{ getCurrentTime() }}
              </p>
            </div>

            <!-- 图表展示区 -->
            <div
                v-for="(chart, index) in reportConfig.charts"
                :key="index"
                class="chart-container">
              <div class="chart-title">{{ chart.title || '未命名图表' }}</div>
              <div
                  :ref="`chart_${index}`"
                  class="chart-content"
                  :style="{ height: getChartHeight(chart.type) }">
              </div>
            </div>
          </div>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import draggable from 'vuedraggable'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default {
  name: 'ReportGenerator',
  components: {
    draggable
  },
  data() {
    return {
      // 当前选中的模板
      currentTemplate: '',
      // 预览模式
      previewMode: 'edit',
      // 图表实例
      chartInstances: {},
      // 是否正在拖拽
      drag: false,
      // 日期选择器配置
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 1)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setMonth(start.getMonth() - 3)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      // 报表配置
      reportConfig: {
        name: '',
        dateRange: [],
        dataSources: [],
        charts: []
      },
      // 默认模板列表
      templates: [
        {
          id: 1,
          name: '设备巡检月报',
          description: '月度设备巡检情况统计报表',
          config: {
            name: '设备巡检月报',
            dateRange: [new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date()],
            dataSources: [
              {
                type: 'inspection',
                fields: ['taskCount', 'completionRate', 'issueCount']
              }
            ],
            charts: [
              {
                type: 'line',
                title: '巡检任务趋势',
                dataSource: 0
              },
              {
                type: 'pie',
                title: '任务完成情况',
                dataSource: 0
              }
            ]
          }
        },
        {
          id: 2,
          name: '预警分析报告',
          description: '设备预警情况分析报表',
          config: {
            name: '预警分析报告',
            dateRange: [new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date()],
            dataSources: [
              {
                type: 'alert',
                fields: ['alertCount', 'responseTime', 'alertType']
              }
            ],
            charts: [
              {
                type: 'bar',
                title: '预警类型分布',
                dataSource: 0
              }
            ]
          }
        }
      ]
    }
  },
  methods: {
    // 创建新报表
    createNewReport() {
      this.reportConfig = {
        name: '',
        dateRange: [],
        dataSources: [],
        charts: []
      }
      this.currentTemplate = ''
      this.previewMode = 'edit'
      this.refreshCharts()
    },

    // 导出报表
    async exportReport() {
      try {
        this.previewMode = 'preview'
        await this.$nextTick()

        const element = document.querySelector('.report-content')
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true
        })

        const pdf = new jsPDF('p', 'mm', 'a4')
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = 210
        const pageHeight = 297
        const imgHeight = canvas.height * imgWidth / canvas.width
        let heightLeft = imgHeight
        let position = 0

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }

        pdf.save(`${this.reportConfig.name || '未命名报表'}.pdf`)
        this.$message.success('报表导出成功')
      } catch (error) {
        console.error('导出报表失败:', error)
        this.$message.error('导出报表失败')
      } finally {
        this.previewMode = 'edit'
      }
    },

    // 刷新报表数据
    refreshReport() {
      this.loadReportData()
      this.refreshCharts()
      this.$message.success('数据已刷新')
    },

    // 加载报表数据
    async loadReportData() {
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 根据数据源类型生成模拟数据
      const data = {}
      this.reportConfig.dataSources.forEach((source, index) => {
        data[`source_${index}`] = this.generateMockData(source.type)
      })
      return data
    },

    // 生成模拟数据
    generateMockData(type) {
      if (!this.reportConfig.dateRange || this.reportConfig.dateRange.length !== 2) {
        return []
      }

      const dateRange = this.reportConfig.dateRange
      const days = Math.floor((dateRange[1] - dateRange[0]) / (24 * 3600 * 1000))
      const data = []

      for (let i = 0; i <= days; i++) {
        const date = new Date(dateRange[0].getTime() + i * 24 * 3600 * 1000)

        switch (type) {
          case 'inspection':
            data.push({
              date: this.formatDate(date),
              taskCount: Math.floor(Math.random() * 100),
              completionRate: Math.floor(Math.random() * 40 + 60),
              issueCount: Math.floor(Math.random() * 20)
            })
            break

          case 'alert':
            data.push({
              date: this.formatDate(date),
              alertCount: Math.floor(Math.random() * 50),
              responseTime: Math.floor(Math.random() * 120),
              alertType: ['设备故障', '温度异常', '压力异常', '振动异常'][Math.floor(Math.random() * 4)]
            })
            break

          case 'device':
            data.push({
              date: this.formatDate(date),
              status: ['正常', '故障', '维护'][Math.floor(Math.random() * 3)],
              runtime: Math.floor(Math.random() * 24),
              faultCount: Math.floor(Math.random() * 5)
            })
            break
        }
      }

      return data
    },

    // 刷新所有图表
    async refreshCharts() {
      const data = await this.loadReportData()

      this.reportConfig.charts.forEach((chart, index) => {
        const chartDom = this.$refs[`chart_${index}`]
        if (!chartDom) return

        const chartDomEl = chartDom[0]
        let chartInstance = this.chartInstances[`chart_${index}`]

        if (!chartInstance) {
          chartInstance = echarts.init(chartDomEl)
          this.chartInstances[`chart_${index}`] = chartInstance
        }

        const option = this.generateChartOption(chart, data)
        chartInstance.setOption(option)
      })
    },

    // 生成图表配置
    generateChartOption(chart) {
      const sourceData = this.getMockChartData(chart)

      switch (chart.type) {
        case 'line':
          return {
            title: {
              text: chart.title,
              left: 'center'
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              type: 'category',
              data: sourceData.xAxis
            },
            yAxis: {
              type: 'value'
            },
            series: [{
              data: sourceData.series,
              type: 'line',
              smooth: true
            }]
          }

        case 'bar':
          return {
            title: {
              text: chart.title,
              left: 'center'
            },
            tooltip: {
              trigger: 'axis'
            },
            xAxis: {
              type: 'category',
              data: sourceData.xAxis
            },
            yAxis: {
              type: 'value'
            },
            series: [{
              data: sourceData.series,
              type: 'bar'
            }]
          }

        case 'pie':
          return {
            title: {
              text: chart.title,
              left: 'center'
            },
            tooltip: {
              trigger: 'item'
            },
            legend: {
              orient: 'vertical',
              left: 'left'
            },
            series: [{
              type: 'pie',
              radius: '50%',
              data: sourceData.pieData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          }

        default:
          return {}
      }
    },

    // 获取图表模拟数据
    getMockChartData(chart) {
      const sourceIndex = chart.dataSource
      const sourceType = this.reportConfig.dataSources[sourceIndex]?.type
      const mockData = this.generateMockData(sourceType)

      switch (sourceType) {
        case 'inspection':
          return {
            xAxis: mockData.map(item => item.date),
            series: mockData.map(item => item.taskCount),
            pieData: [
              { value: 60, name: '已完成' },
              { value: 40, name: '未完成' }
            ]
          }

        case 'alert':
          return {
            xAxis: mockData.map(item => item.date),
            series: mockData.map(item => item.alertCount),
            pieData: [
              { value: 30, name: '设备故障' },
              { value: 25, name: '温度异常' },
              { value: 20, name: '压力异常' },
              { value: 15, name: '振动异常' }
            ]
          }

        case 'device':
          return {
            xAxis: mockData.map(item => item.date),
            series: mockData.map(item => item.runtime),
            pieData: [
              { value: 70, name: '正常' },
              { value: 20, name: '故障' },
              { value: 10, name: '维护' }
            ]
          }

        default:
          return {
            xAxis: [],
            series: [],
            pieData: []
          }
      }
    },

    // 添加数据源
    addDataSource() {
      this.reportConfig.dataSources.push({
        type: '',
        fields: []
      })
    },

    // 删除数据源
    removeDataSource(index) {
      this.reportConfig.dataSources.splice(index, 1)
      // 更新相关图表的数据源
      this.reportConfig.charts.forEach(chart => {
        if (chart.dataSource === index) {
          chart.dataSource = null
        } else if (chart.dataSource > index) {
          chart.dataSource--
        }
      })
    },

    // 添加图表
    addChart() {
      this.reportConfig.charts.push({
        type: '',
        title: '',
        dataSource: null
      })
    },

    // 删除图表
    removeChart(index) {
      this.reportConfig.charts.splice(index, 1)
      delete this.chartInstances[`chart_${index}`]
      this.$nextTick(() => {
        this.refreshCharts()
      })
    },

    // 获取可用字段
    getAvailableFields(type) {
      const fieldsMap = {
        inspection: [
          { label: '任务数量', value: 'taskCount' },
          { label: '完成率', value: 'completionRate' },
          { label: '问题数量', value: 'issueCount' }
        ],
        alert: [
          { label: '预警数量', value: 'alertCount' },
          { label: '响应时间', value: 'responseTime' },
          { label: '预警类型', value: 'alertType' }
        ],
        device: [
          { label: '设备状态', value: 'status' },
          { label: '运行时间', value: 'runtime' },
          { label: '故障次数', value: 'faultCount' }
        ]
      }
      return fieldsMap[type] || []
    },

    // 获取图表高度
    getChartHeight(type) {
      const heights = {
        line: '300px',
        bar: '300px',
        pie: '400px',
        table: 'auto'
      }
      return heights[type] || '300px'
    },

    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    // 获取当前时间
    getCurrentTime() {
      return new Date().toLocaleString()
    },

    // 处理模板变更
    handleTemplateChange(templateId) {
      const template = this.templates.find(t => t.id === templateId)
      if (template) {
        this.reportConfig = JSON.parse(JSON.stringify(template.config))
        this.$nextTick(() => {
          this.refreshCharts()
        })
      }
    },

    // 保存为模板
    saveAsTemplate() {
      const template = {
        id: Date.now(),
        name: this.reportConfig.name,
        description: '用户自定义模板',
        config: JSON.parse(JSON.stringify(this.reportConfig))
      }
      this.templates.push(template)
      this.$message.success('模板保存成功')
    },

    // 重置配置
    resetConfig() {
      this.$confirm('确认重置当前配置?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.createNewReport()
        this.$message.success('配置已重置')
      }).catch(() => {})
    }
  },
  mounted() {
    window.addEventListener('resize', this.refreshCharts)
    // 加载默认模板
    const savedTemplates = localStorage.getItem('reportTemplates')
    if (savedTemplates) {
      this.templates = JSON.parse(savedTemplates)
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.refreshCharts)
    // 销毁所有图表实例
    Object.values(this.chartInstances).forEach(instance => {
      instance && instance.dispose()
    })
  },
  watch: {
    'reportConfig.charts': {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.refreshCharts()
        })
      }
    },
    previewMode() {
      this.$nextTick(() => {
        this.refreshCharts()
      })
    },
    templates: {
      deep: true,
      handler(val) {
        localStorage.setItem('reportTemplates', JSON.stringify(val))
      }
    }
  }
}
</script>