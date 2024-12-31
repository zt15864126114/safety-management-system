<template>
  <div class="reports">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in statistics" :key="index">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-title">{{ item.title }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 巡检完成率趋势图 -->
      <el-col :span="12">
        <el-card>
          <div slot="header" class="chart-header">
            <span>巡检完成率趋势</span>
            <el-radio-group v-model="chartTimeRange" size="small">
              <el-radio-button label="week">周</el-radio-button>
              <el-radio-button label="month">月</el-radio-button>
              <el-radio-button label="year">年</el-radio-button>
            </el-radio-group>
          </div>
          <div id="completionChart" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <!-- 问题分布图 -->
      <el-col :span="12">
        <el-card>
          <div slot="header" class="chart-header">
            <span>问题类型分布</span>
            <el-select v-model="issueChartType" size="small" style="width: 120px">
              <el-option label="饼图" value="pie"></el-option>
              <el-option label="柱状图" value="bar"></el-option>
            </el-select>
          </div>
          <div id="issueChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card style="margin-top: 20px;">
      <div slot="header">
        <span>巡检数据明细</span>
      </div>
      <el-table :data="inspectionData" style="width: 100%">
        <el-table-column prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="area" label="巡检区域" width="150"></el-table-column>
        <el-table-column prop="inspector" label="巡检人员" width="120"></el-table-column>
        <el-table-column prop="total" label="检查项数" width="100"></el-table-column>
        <el-table-column prop="completed" label="完成项数" width="100"></el-table-column>
        <el-table-column prop="rate" label="完成率">
          <template slot-scope="scope">
            <el-progress :percentage="scope.row.rate" :color="getProgressColor"></el-progress>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 报表导出 -->
    <el-card style="margin-top: 20px;">
      <div slot="header">
        <span>报表导出</span>
      </div>
      <el-form :inline="true" :model="exportForm" ref="exportForm" :rules="exportRules">
        <el-form-item label="报表类型" prop="type">
          <el-select v-model="exportForm.type" placeholder="请选择报表类型">
            <el-option label="巡检统计报表" value="inspection"></el-option>
            <el-option label="问题统计报表" value="issue"></el-option>
            <el-option label="完整报表" value="full"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围" prop="dateRange">
          <el-date-picker
              v-model="exportForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleExport">导出报表</el-button>
          <el-button @click="resetExportForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import * as XLSX from 'xlsx'
import FileSaver from 'file-saver'

export default {
  name: 'Reports',
  data() {
    return {
      // 统计卡片数据
      statistics: [
        { title: '本月巡检总数', value: '286' },
        { title: '发现问题数', value: '15' },
        { title: '平均完成率', value: '98.5%' },
        { title: '待处理问题', value: '3' }
      ],
      // 图表控制
      chartTimeRange: 'week',
      issueChartType: 'pie',
      // 表格数据
      inspectionData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      // 导出表单
      exportForm: {
        type: '',
        dateRange: []
      },
      exportRules: {
        type: [
          { required: true, message: '请选择报表类型', trigger: 'change' }
        ],
        dateRange: [
          { required: true, message: '请选择时间范围', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    getProgressColor() {
      return function(percentage) {
        if (percentage < 70) return '#F56C6C'
        if (percentage < 90) return '#E6A23C'
        return '#67C23A'
      }
    }
  },
  mounted() {
    this.initCharts()
    this.fetchTableData()
  },
  methods: {
    // 初始化图表
    initCharts() {
      this.initCompletionChart()
      this.initIssueChart()
    },
    // 初始化完成率趋势图
    initCompletionChart() {
      const chart = echarts.init(document.getElementById('completionChart'))
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c}%'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        },
        yAxis: {
          type: 'value',
          min: 80,
          max: 100,
          axisLabel: {
            formatter: '{value}%'
          }
        },
        series: [{
          name: '完成率',
          type: 'line',
          smooth: true,
          data: [95, 98, 92, 96, 97, 99, 93],
          areaStyle: {
            opacity: 0.3
          },
          itemStyle: {
            color: '#409EFF'
          }
        }]
      }
      chart.setOption(option)
      window.addEventListener('resize', () => chart.resize())
    },
    // 初始化问题分布图
    initIssueChart() {
      const chart = echarts.init(document.getElementById('issueChart'))
      const data = [
        { value: 5, name: '设备故障' },
        { value: 3, name: '安全隐患' },
        { value: 4, name: '环境问题' },
        { value: 2, name: '操作违规' },
        { value: 1, name: '其他' }
      ]

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            type: this.issueChartType,
            radius: this.issueChartType === 'pie' ? '50%' : undefined,
            data: data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      chart.setOption(option)
      window.addEventListener('resize', () => chart.resize())
    },
    // 获取表格数据
    fetchTableData() {
      // 模拟数据
      this.inspectionData = Array(20).fill(null).map((_, index) => ({
        date: `2024-01-${String(index + 1).padStart(2, '0')}`,
        area: `生产区域${index % 3 + 1}`,
        inspector: ['张三', '李四', '王五'][index % 3],
        total: 20,
        completed: 18 + Math.floor(Math.random() * 3),
        rate: 90 + Math.floor(Math.random() * 10)
      }))
      this.total = this.inspectionData.length
    },
    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchTableData()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchTableData()
    },
    // 导出报表
    handleExport() {
      this.$refs.exportForm.validate(valid => {
        if (valid) {
          const { type, dateRange } = this.exportForm
          const workbook = XLSX.utils.book_new()

          // 生成巡检数据
          if (type === 'inspection' || type === 'full') {
            const inspectionWs = XLSX.utils.json_to_sheet([
              ['日期', '巡检区域', '巡检人员', '检查项数', '完成项数', '完成率'],
              ...this.inspectionData.map(item => [
                item.date,
                item.area,
                item.inspector,
                item.total,
                item.completed,
                `${item.rate}%`
              ])
            ])
            XLSX.utils.book_append_sheet(workbook, inspectionWs, '巡检统计')
          }

          // 生成问题数据
          if (type === 'issue' || type === 'full') {
            const issueData = [
              { date: '2024-01-20', type: '设备故障', location: '生产区A', status: '已处理' },
              { date: '2024-01-21', type: '安全隐患', location: '仓储区B', status: '处理中' },
              { date: '2024-01-22', type: '环境问题', location: '生产区C', status: '待处理' }
            ]
            const issueWs = XLSX.utils.json_to_sheet([
              ['日期', '问题类型', '位置', '状态'],
              ...issueData.map(item => [
                item.date,
                item.type,
                item.location,
                item.status
              ])
            ])
            XLSX.utils.book_append_sheet(workbook, issueWs, '问题统计')
          }

          // 添加统计信息
          const summaryWs = XLSX.utils.json_to_sheet([
            ['报表生成时间', new Date().toLocaleString()],
            ['统计周期', `${dateRange[0]} 至 ${dateRange[1]}`],
            ['巡检完成率', '98.5%'],
            ['问题处理率', '85%']
          ])
          XLSX.utils.book_append_sheet(workbook, summaryWs, '统计信息')

          // 设置列宽
          const wscols = [
            { wch: 15 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 }
          ]
          if (workbook.Sheets['巡检统计']) {
            workbook.Sheets['巡检统计']['!cols'] = wscols
          }
          if (workbook.Sheets['问题统计']) {
            workbook.Sheets['问题统计']['!cols'] = wscols
          }

          // 导出文件
          const wopts = {
            bookType: 'xlsx',
            bookSST: false,
            type: 'binary'
          }
          const wbout = XLSX.write(workbook, wopts)
          const fileName = `安全管理系统报表_${dateRange[0]}_${dateRange[1]}.xlsx`

          FileSaver.saveAs(
              new Blob([this.s2ab(wbout)], { type: 'application/octet-stream' }),
              fileName
          )

          this.$message.success('报表导出成功')
        } else {
          this.$message.warning('请完善导出信息')
          return false
        }
      })
    },
    // 重置导出表单
    resetExportForm() {
      this.$refs.exportForm.resetFields()
    },
    // 字符串转ArrayBuffer
    s2ab(s) {
      const buf = new ArrayBuffer(s.length)
      const view = new Uint8Array(buf)
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF
      }
      return buf
    }
  },
  watch: {
    chartTimeRange() {
      this.initCompletionChart()
    },
    issueChartType() {
      this.initIssueChart()
    }
  }
}
</script>

<style scoped>
.reports {
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

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.el-card {
  margin-bottom: 20px;
}

.el-card:last-child {
  margin-bottom: 0;
}
</style>