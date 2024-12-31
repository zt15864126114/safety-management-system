<template>
  <div class="inspection-task">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="任务名称">
          <el-input v-model="searchForm.name" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="searchForm.type" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="日常巡检" value="daily"></el-option>
            <el-option label="专项巡检" value="special"></el-option>
            <el-option label="临时巡检" value="temporary"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执行状态">
          <el-select v-model="searchForm.status" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="未开始" value="pending"></el-option>
            <el-option label="进行中" value="processing"></el-option>
            <el-option label="已暂停" value="paused"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已失败" value="failed"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleAdd">新增任务</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 任务列表 -->
    <el-card class="table-card">
      <el-table
          :data="tasksList"
          v-loading="loading"
          style="width: 100%">
        <el-table-column prop="name" label="任务名称" width="180"></el-table-column>
        <el-table-column prop="type" label="任务类型" width="120">
          <template slot-scope="scope">
            {{ getTaskTypeName(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="executor" label="执行人" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="planStartTime" label="计划开始时间" width="160"></el-table-column>
        <el-table-column prop="planEndTime" label="计划结束时间" width="160"></el-table-column>
        <el-table-column prop="progress" label="进度" width="180">
          <template slot-scope="scope">
            <el-progress
                :percentage="scope.row.progress"
                :status="getProgressStatus(scope.row)">
            </el-progress>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template slot-scope="scope">
            <el-button
                size="mini"
                :type="scope.row.status === 'processing' ? 'warning' : 'success'"
                :disabled="scope.row.status === 'completed' || scope.row.status === 'failed'"
                @click="handleTaskControl(scope.row)">
              {{ scope.row.status === 'processing' ? '暂停' : '开始' }}
            </el-button>
            <el-button
                size="mini"
                type="primary"
                :disabled="scope.row.status === 'completed'"
                @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 任务表单对话框 -->
    <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        width="50%"
        :before-close="handleDialogClose">
      <el-form
          :model="taskForm"
          :rules="rules"
          ref="taskForm"
          label-width="100px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name"></el-input>
        </el-form-item>
        <el-form-item label="任务类型" prop="type">
          <el-select v-model="taskForm.type" placeholder="请选择任务类型">
            <el-option label="日常巡检" value="daily"></el-option>
            <el-option label="专项巡检" value="special"></el-option>
            <el-option label="临时巡检" value="temporary"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="执行人" prop="executor">
          <el-input v-model="taskForm.executor"></el-input>
        </el-form-item>
        <el-form-item label="计划时间" required>
          <el-col :span="11">
            <el-form-item prop="planStartTime">
              <el-date-picker
                  v-model="taskForm.planStartTime"
                  type="datetime"
                  placeholder="开始时间"
                  style="width: 100%;">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col class="line" :span="2">-</el-col>
          <el-col :span="11">
            <el-form-item prop="planEndTime">
              <el-date-picker
                  v-model="taskForm.planEndTime"
                  type="datetime"
                  placeholder="结束时间"
                  style="width: 100%;">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="巡检区域" prop="areas">
          <el-select
              v-model="taskForm.areas"
              multiple
              placeholder="请选择巡检区域">
            <el-option label="工厂1-车间A" value="工厂1-车间A"></el-option>
            <el-option label="工厂1-车间B" value="工厂1-车间B"></el-option>
            <el-option label="工厂2-车间A" value="工厂2-车间A"></el-option>
            <el-option label="工厂2-车间B" value="工厂2-车间B"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input
              type="textarea"
              :rows="3"
              v-model="taskForm.description">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDialogClose">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'InspectionTask',
  data() {
    return {
      // 搜索表单
      searchForm: {
        name: '',
        type: '',
        status: ''
      },
      // 任务列表
      tasksList: [],
      // 加载状态
      loading: false,
      // 分页信息
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      // 对话框显示状态
      dialogVisible: false,
      // 对话框标题
      dialogTitle: '',
      // 任务表单
      taskForm: {
        id: null,
        name: '',
        type: '',
        executor: '',
        planStartTime: '',
        planEndTime: '',
        areas: [],
        description: ''
      },
      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入任务名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择任务类型', trigger: 'change' }
        ],
        executor: [
          { required: true, message: '请输入执行人', trigger: 'blur' }
        ],
        planStartTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        planEndTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ],
        areas: [
          { required: true, message: '请选择巡检区域', trigger: 'change' }
        ]
      },
      // 模拟数据库
      mockDatabase: [
        {
          id: 1,
          name: '设备日常巡检',
          type: 'daily',
          executor: '张三',
          status: 'processing',
          progress: 60,
          planStartTime: '2024-01-20 09:00:00',
          planEndTime: '2024-01-20 17:00:00',
          areas: ['工厂1-车间A'],
          description: '日常设备巡检任务'
        }
      ]
    }
  },
  methods: {
    // 加载任务列表
    loadTasks() {
      this.loading = true
      setTimeout(() => {
        let filteredTasks = [...this.mockDatabase]

        // 根据搜索条件过滤
        if (this.searchForm.name) {
          filteredTasks = filteredTasks.filter(task =>
              task.name.toLowerCase().includes(this.searchForm.name.toLowerCase())
          )
        }
        if (this.searchForm.type) {
          filteredTasks = filteredTasks.filter(task =>
              task.type === this.searchForm.type
          )
        }
        if (this.searchForm.status) {
          filteredTasks = filteredTasks.filter(task =>
              task.status === this.searchForm.status
          )
        }

        // 计算分页
        const start = (this.pagination.currentPage - 1) * this.pagination.pageSize
        const end = start + this.pagination.pageSize

        this.pagination.total = filteredTasks.length
        this.tasksList = filteredTasks.slice(start, end)
        this.loading = false
      }, 500)
    },

    // 搜索
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadTasks()
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        name: '',
        type: '',
        status: ''
      }
      this.handleSearch()
    },

    // 新增任务
    handleAdd() {
      this.dialogTitle = '新增任务'
      this.taskForm = {
        id: null,
        name: '',
        type: '',
        executor: '',
        planStartTime: '',
        planEndTime: '',
        areas: [],
        description: ''
      }
      this.dialogVisible = true
    },

    // 编辑任务
    handleEdit(row) {
      this.dialogTitle = '编辑任务'
      this.taskForm = {
        ...row,
        planStartTime: row.planStartTime ? new Date(row.planStartTime) : '',
        planEndTime: row.planEndTime ? new Date(row.planEndTime) : ''
      }
      this.dialogVisible = true
    },

    // 删除任务
    handleDelete(row) {
      this.$confirm('确认删除该任务?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.mockDatabase.findIndex(t => t.id === row.id)
        if (index !== -1) {
          this.mockDatabase.splice(index, 1)
          this.$message.success('删除成功')
          this.loadTasks()
        }
      }).catch(() => {})
    },

    // 保存任务
    handleSave() {
      this.$refs.taskForm.validate((valid) => {
        if (valid) {
          if (this.taskForm.id) {
            // 编辑现有任务
            const index = this.mockDatabase.findIndex(t => t.id === this.taskForm.id)
            if (index !== -1) {
              this.mockDatabase[index] = {
                ...this.mockDatabase[index],
                ...this.taskForm,
                planStartTime: this.formatDateTime(this.taskForm.planStartTime),
                planEndTime: this.formatDateTime(this.taskForm.planEndTime),
                updateTime: this.formatDateTime(new Date())
              }
            }
          } else {
            // 新增任务
            const newTask = {
              ...this.taskForm,
              id: Date.now(),
              status: 'pending',
              progress: 0,
              planStartTime: this.formatDateTime(this.taskForm.planStartTime),
              planEndTime: this.formatDateTime(this.taskForm.planEndTime),
              createTime: this.formatDateTime(new Date()),
              updateTime: this.formatDateTime(new Date())
            }
            this.mockDatabase.push(newTask)
          }

          this.$message.success('保存成功')
          this.dialogVisible = false
          this.loadTasks()
        }
      })
    },

    // 任务控制（开始/暂停）
    handleTaskControl(task) {
      const isStart = task.status !== 'processing'
      const actionText = isStart ? '开始' : '暂停'

      this.$confirm(`确认${actionText}该任务?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const targetTask = this.mockDatabase.find(t => t.id === task.id)
        if (targetTask) {
          targetTask.status = isStart ? 'processing' : 'paused'
          if (isStart) {
            targetTask.progress = 0
          }
          this.$message.success(`${actionText}成功`)
          this.loadTasks()
        }
      }).catch(() => {})
    },

    // 格式化日期时间
    formatDateTime(date) {
      if (!date) return ''
      if (typeof date === 'string') return date

      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    // 获取任务类型名称
    getTaskTypeName(type) {
      const types = {
        daily: '日常巡检',
        special: '专项巡检',
        temporary: '临时巡检'
      }
      return types[type] || type
    },

    // 获取状态类型
    getStatusType(status) {
      const types = {
        pending: 'info',
        processing: 'primary',
        paused: 'warning',
        completed: 'success',
        failed: 'danger'
      }
      return types[status] || ''
    },

    // 获取状态名称
    getStatusName(status) {
      const names = {
        pending: '未开始',
        processing: '进行中',
        paused: '已暂停',
        completed: '已完成',
        failed: '已失败'
      }
      return names[status] || status
    },

    // 获取进度状态
    getProgressStatus(task) {
      if (task.status === 'completed') return 'success'
      if (task.status === 'paused') return 'warning'
      if (task.status === 'failed') return 'exception'
      return ''
    },

    // 对话框关闭处理
    handleDialogClose() {
      this.$refs.taskForm.resetFields()
      this.dialogVisible = false
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadTasks()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadTasks()
    }
  },

  created() {
    this.loadTasks()
  }
}
</script>

<style scoped>
.inspection-task {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.line {
  text-align: center;
}

.dialog-footer {
  text-align: right;
}
</style>