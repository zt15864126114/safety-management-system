<!-- 任务配置对话框 -->
<el-dialog
    :title="dialogTitle"
    :visible.sync="taskDialogVisible"
    width="60%"
    :before-close="handleDialogClose">
<el-form
    :model="taskForm"
    :rules="rules"
    ref="taskForm"
    label-width="100px"
    class="task-form">
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

  <el-form-item label="巡检区域" prop="areas">
    <el-cascader
        v-model="taskForm.areas"
        :options="areaOptions"
        :props="{ multiple: true }"
        collapse-tags
        placeholder="请选择巡检区域">
    </el-cascader>
  </el-form-item>

  <el-form-item label="巡检项目" prop="items">
    <el-transfer
        v-model="taskForm.items"
        :data="inspectionItems"
        :titles="['可选项目', '已选项目']"
        :button-texts="['移除', '添加']"
        filterable>
    </el-transfer>
  </el-form-item>

  <el-form-item label="执行人" prop="executor">
    <el-select
        v-model="taskForm.executor"
        filterable
        remote
        reserve-keyword
        placeholder="请输入姓名搜索"
        :remote-method="remoteSearchUsers"
        :loading="userLoading">
      <el-option
          v-for="user in userOptions"
          :key="user.id"
          :label="user.name"
          :value="user.id">
        <span>{{ user.name }}</span>
        <span class="user-info">({{ user.department }})</span>
      </el-option>
    </el-select>
  </el-form-item>

  <el-form-item label="计划时间" prop="timeRange" required>
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

  <el-form-item label="重复设置" v-if="taskForm.type === 'daily'">
    <el-checkbox-group v-model="taskForm.repeatDays">
      <el-checkbox label="1">周一</el-checkbox>
      <el-checkbox label="2">周二</el-checkbox>
      <el-checkbox label="3">周三</el-checkbox>
      <el-checkbox label="4">周四</el-checkbox>
      <el-checkbox label="5">周五</el-checkbox>
      <el-checkbox label="6">周六</el-checkbox>
      <el-checkbox label="0">周日</el-checkbox>
    </el-checkbox-group>
  </el-form-item>

  <el-form-item label="提醒设置" prop="reminder">
    <el-select v-model="taskForm.reminder">
      <el-option label="不提醒" value="none"></el-option>
      <el-option label="开始时" value="start"></el-option>
      <el-option label="提前15分钟" value="15min"></el-option>
      <el-option label="提前30分钟" value="30min"></el-option>
      <el-option label="提前1小时" value="1hour"></el-option>
    </el-select>
  </el-form-item>

  <el-form-item label="备注" prop="description">
    <el-input
        type="textarea"
        v-model="taskForm.description"
        :rows="3">
    </el-input>
  </el-form-item>
</el-form>
<div slot="footer">
  <el-button @click="handleDialogClose">取消</el-button>
  <el-button type="primary" @click="saveTask">保存</el-button>
</div>
</el-dialog>

<!-- 任务详情对话框 -->
<el-dialog
    title="任务详情"
    :visible.sync="detailDialogVisible"
    width="50%">
<el-descriptions :column="2" border>
  <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
  <el-descriptions-item label="任务类型">
    {{ getTaskTypeName(currentTask.type) }}
  </el-descriptions-item>
  <el-descriptions-item label="执行人">{{ currentTask.executor }}</el-descriptions-item>
  <el-descriptions-item label="执行状态">
    <el-tag :type="getStatusType(currentTask.status)">
      {{ getStatusName(currentTask.status) }}
    </el-tag>
  </el-descriptions-item>
  <el-descriptions-item label="计划开始时间">{{ currentTask.planStartTime }}</el-descriptions-item>
  <el-descriptions-item label="计划结束时间">{{ currentTask.planEndTime }}</el-descriptions-item>
  <el-descriptions-item label="实际开始时间">{{ currentTask.actualStartTime || '-' }}</el-descriptions-item>
  <el-descriptions-item label="实际结束时间">{{ currentTask.actualEndTime || '-' }}</el-descriptions-item>
  <el-descriptions-item label="进度">
    <el-progress
        :percentage="currentTask.progress"
        :status="getProgressStatus(currentTask)">
    </el-progress>
  </el-descriptions-item>
  <el-descriptions-item label="创建时间">{{ currentTask.createTime }}</el-descriptions-item>
  <el-descriptions-item label="备注" :span="2">
    {{ currentTask.description }}
  </el-descriptions-item>
</el-descriptions>

<!-- 巡检项目列表 -->
<div class="items-section">
  <h4>巡检项目</h4>
  <el-table :data="currentTask.items" border size="small">
    <el-table-column prop="name" label="项目名称"></el-table-column>
    <el-table-column prop="standard" label="检查标准"></el-table-column>
    <el-table-column prop="result" label="检查结果">
      <template slot-scope="scope">
        <el-tag :type="scope.row.result === 'normal' ? 'success' : 'danger'">
          {{ scope.row.result === 'normal' ? '正常' : '异常' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="checkTime" label="检查时间"></el-table-column>
    <el-table-column prop="remarks" label="备注"></el-table-column>
  </el-table>
</div>

<!-- 任务日志 -->
<div class="log-section">
  <h4>执行日志</h4>
  <el-timeline>
    <el-timeline-item
        v-for="(log, index) in taskLogs"
        :key="index"
        :type="log.type"
        :timestamp="log.time">
      {{ log.content }}
    </el-timeline-item>
  </el-timeline>
</div>
</el-dialog>
<!-- 任务配置对话框 -->
<el-dialog
    :title="dialogTitle"
    :visible.sync="taskDialogVisible"
    width="60%"
    :before-close="handleDialogClose">
<el-form
    :model="taskForm"
    :rules="rules"
    ref="taskForm"
    label-width="100px"
    class="task-form">
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

  <el-form-item label="巡检区域" prop="areas">
    <el-cascader
        v-model="taskForm.areas"
        :options="areaOptions"
        :props="{ multiple: true }"
        collapse-tags
        placeholder="请选择巡检区域">
    </el-cascader>
  </el-form-item>

  <el-form-item label="巡检项目" prop="items">
    <el-transfer
        v-model="taskForm.items"
        :data="inspectionItems"
        :titles="['可选项目', '已选项目']"
        :button-texts="['移除', '添加']"
        filterable>
    </el-transfer>
  </el-form-item>

  <el-form-item label="执行人" prop="executor">
    <el-select
        v-model="taskForm.executor"
        filterable
        remote
        reserve-keyword
        placeholder="请输入姓名搜索"
        :remote-method="remoteSearchUsers"
        :loading="userLoading">
      <el-option
          v-for="user in userOptions"
          :key="user.id"
          :label="user.name"
          :value="user.id">
        <span>{{ user.name }}</span>
        <span class="user-info">({{ user.department }})</span>
      </el-option>
    </el-select>
  </el-form-item>

  <el-form-item label="计划时间" prop="timeRange" required>
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

  <el-form-item label="重复设置" v-if="taskForm.type === 'daily'">
    <el-checkbox-group v-model="taskForm.repeatDays">
      <el-checkbox label="1">周一</el-checkbox>
      <el-checkbox label="2">周二</el-checkbox>
      <el-checkbox label="3">周三</el-checkbox>
      <el-checkbox label="4">周四</el-checkbox>
      <el-checkbox label="5">周五</el-checkbox>
      <el-checkbox label="6">周六</el-checkbox>
      <el-checkbox label="0">周日</el-checkbox>
    </el-checkbox-group>
  </el-form-item>

  <el-form-item label="提醒设置" prop="reminder">
    <el-select v-model="taskForm.reminder">
      <el-option label="不提醒" value="none"></el-option>
      <el-option label="开始时" value="start"></el-option>
      <el-option label="提前15分钟" value="15min"></el-option>
      <el-option label="提前30分钟" value="30min"></el-option>
      <el-option label="提前1小时" value="1hour"></el-option>
    </el-select>
  </el-form-item>

  <el-form-item label="备注" prop="description">
    <el-input
        type="textarea"
        v-model="taskForm.description"
        :rows="3">
    </el-input>
  </el-form-item>
</el-form>
<div slot="footer">
  <el-button @click="handleDialogClose">取消</el-button>
  <el-button type="primary" @click="saveTask">保存</el-button>
</div>
</el-dialog>

<!-- 任务详情对话框 -->
<el-dialog
    title="任务详情"
    :visible.sync="detailDialogVisible"
    width="50%">
<el-descriptions :column="2" border>
  <el-descriptions-item label="任务名称">{{ currentTask.name }}</el-descriptions-item>
  <el-descriptions-item label="任务类型">
    {{ getTaskTypeName(currentTask.type) }}
  </el-descriptions-item>
  <el-descriptions-item label="执行人">{{ currentTask.executor }}</el-descriptions-item>
  <el-descriptions-item label="执行状态">
    <el-tag :type="getStatusType(currentTask.status)">
      {{ getStatusName(currentTask.status) }}
    </el-tag>
  </el-descriptions-item>
  <el-descriptions-item label="计划开始时间">{{ currentTask.planStartTime }}</el-descriptions-item>
  <el-descriptions-item label="计划结束时间">{{ currentTask.planEndTime }}</el-descriptions-item>
  <el-descriptions-item label="实际开始时间">{{ currentTask.actualStartTime || '-' }}</el-descriptions-item>
  <el-descriptions-item label="实际结束时间">{{ currentTask.actualEndTime || '-' }}</el-descriptions-item>
  <el-descriptions-item label="进度">
    <el-progress
        :percentage="currentTask.progress"
        :status="getProgressStatus(currentTask)">
    </el-progress>
  </el-descriptions-item>
  <el-descriptions-item label="创建时间">{{ currentTask.createTime }}</el-descriptions-item>
  <el-descriptions-item label="备注" :span="2">
    {{ currentTask.description }}
  </el-descriptions-item>
</el-descriptions>

<!-- 巡检项目列表 -->
<div class="items-section">
  <h4>巡检项目</h4>
  <el-table :data="currentTask.items" border size="small">
    <el-table-column prop="name" label="项目名称"></el-table-column>
    <el-table-column prop="standard" label="检查标准"></el-table-column>
    <el-table-column prop="result" label="检查结果">
      <template slot-scope="scope">
        <el-tag :type="scope.row.result === 'normal' ? 'success' : 'danger'">
          {{ scope.row.result === 'normal' ? '正常' : '异常' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="checkTime" label="检查时间"></el-table-column>
    <el-table-column prop="remarks" label="备注"></el-table-column>
  </el-table>
</div>

<!-- 任务日志 -->
<div class="log-section">
  <h4>执行日志</h4>
  <el-timeline>
    <el-timeline-item
        v-for="(log, index) in taskLogs"
        :key="index"
        :type="log.type"
        :timestamp="log.time">
      {{ log.content }}
    </el-timeline-item>
  </el-timeline>
</div>
</el-dialog>

<script>
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default {
  name: 'InspectionTask',
  data() {
    return {
      // 模拟数据库
      mockDatabase: [
        {
          id: 1,
          name: '设备日常巡检',
          type: 'daily',
          areas: ['工厂1', '车间A'],
          items: [
            {
              id: 1,
              name: '温度检查',
              standard: '正常范围：20-30℃',
              result: 'normal',
              checkTime: '2024-01-20 10:00:00',
              remarks: '温度正常'
            },
            {
              id: 2,
              name: '压力检查',
              standard: '正常范围：0.5-0.8MPa',
              result: 'normal',
              checkTime: '2024-01-20 10:05:00',
              remarks: '压力正常'
            }
          ],
          executor: {
            id: 1,
            name: '张三',
            department: '运维部'
          },
          status: 'processing',
          progress: 60,
          planStartTime: '2024-01-20 09:00:00',
          planEndTime: '2024-01-20 17:00:00',
          actualStartTime: '2024-01-20 09:05:00',
          actualEndTime: null,
          repeatDays: ['1', '2', '3', '4', '5'],
          reminder: '15min',
          description: '日常设备巡检任务',
          createTime: '2024-01-19 16:00:00'
        }
      ],
      // 搜索表单
      searchForm: {
        name: '',
        type: '',
        status: '',
        dateRange: []
      },
      // 表格加载状态
      tableLoading: false,
      // 任务列表
      tasksList: [],
      // 选中的任务
      selection: [],
      // 分页信息
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      // 对话框显示控制
      taskDialogVisible: false,
      detailDialogVisible: false,
      importDialogVisible: false,
      dialogTitle: '',
      // 当前任务
      currentTask: {},
      // 任务表单
      taskForm: {
        name: '',
        type: '',
        areas: [],
        items: [],
        executor: null,
        planStartTime: '',
        planEndTime: '',
        repeatDays: [],
        reminder: 'none',
        description: ''
      },
      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择任务类型', trigger: 'change' }
        ],
        areas: [
          { required: true, message: '请选择巡检区域', trigger: 'change' }
        ],
        items: [
          { required: true, message: '请选择巡检项目', trigger: 'change' }
        ],
        executor: [
          { required: true, message: '请选择执行人', trigger: 'change' }
        ],
        planStartTime: [
          { required: true, message: '请选择计划开始时间', trigger: 'change' }
        ],
        planEndTime: [
          { required: true, message: '请选择计划结束时间', trigger: 'change' }
        ]
      },
      // 区域选项
      areaOptions: [
        {
          value: '工厂1',
          label: '工厂1',
          children: [
            { value: '车间A', label: '车间A' },
            { value: '车间B', label: '车间B' },
            { value: '仓库', label: '仓库' }
          ]
        },
        {
          value: '工厂2',
          label: '工厂2',
          children: [
            { value: '车间C', label: '车间C' },
            { value: '车间D', label: '车间D' }
          ]
        }
      ],
      // 巡检项目列表
      inspectionItems: [
        { key: 1, label: '温度检查' },
        { key: 2, label: '压力检查' },
        { key: 3, label: '噪音检查' },
        { key: 4, label: '振动检查' },
        { key: 5, label: '润滑检查' }
      ],
      // 用户选择相关
      userLoading: false,
      userOptions: [],
      // 任务日志
      taskLogs: [],
      // 操作日志
      operationLogs: []
    }
  },
  methods: {
    // 加载任务列表
    async loadTasks() {
      this.tableLoading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))

        // 过滤任务
        let filteredTasks = [...this.mockDatabase]

        if (this.searchForm.name) {
          filteredTasks = filteredTasks.filter(task =>
              task.name.toLowerCase().includes(this.searchForm.name.toLowerCase())
          )
        }

        if (this.searchForm.type) {
          filteredTasks = filteredTasks.filter(task => task.type === this.searchForm.type)
        }

        if (this.searchForm.status) {
          filteredTasks = filteredTasks.filter(task => task.status === this.searchForm.status)
        }

        if (this.searchForm.dateRange && this.searchForm.dateRange.length === 2) {
          const startDate = this.searchForm.dateRange[0]
          const endDate = this.searchForm.dateRange[1]
          filteredTasks = filteredTasks.filter(task => {
            const planStartTime = new Date(task.planStartTime)
            return planStartTime >= startDate && planStartTime <= endDate
          })
        }

        // 计算分页
        const start = (this.pagination.currentPage - 1) * this.pagination.pageSize
        const end = start + this.pagination.pageSize

        this.pagination.total = filteredTasks.length
        this.tasksList = filteredTasks.slice(start, end)
      } catch (error) {
        this.$message.error('加载任务列表失败')
        console.error(error)
      } finally {
        this.tableLoading = false
      }
    },

    // 保存任务
    async saveTask() {
      try {
        await this.$refs.taskForm.validate()

        const formData = { ...this.taskForm }
        const now = new Date().toLocaleString()

        if (formData.id) {
          // 编辑现有任务
          const index = this.mockDatabase.findIndex(t => t.id === formData.id)
          if (index !== -1) {
            this.mockDatabase[index] = {
              ...this.mockDatabase[index],
              ...formData,
              updateTime: now
            }
            this.addOperationLog('更新', formData.name)
          }
        } else {
          // 新增任务
          const newTask = {
            ...formData,
            id: Date.now(),
            status: 'pending',
            progress: 0,
            createTime: now,
            updateTime: now
          }
          this.mockDatabase.push(newTask)
          this.addOperationLog('新增', formData.name)
        }

        this.$message.success('任务保存成功')
        this.taskDialogVisible = false
        this.loadTasks()
      } catch (error) {
        this.$message.error('表单验证失败，请检查必填项')
      }
    },

    // 任务控制（开始/暂停）
    async handleTaskControl(task) {
      const isStart = task.status !== 'processing'
      const actionText = isStart ? '开始' : '暂停'

      try {
        await this.$confirm(`确认${actionText}该任务?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const targetTask = this.mockDatabase.find(t => t.id === task.id)
        if (targetTask) {
          if (isStart) {
            targetTask.status = 'processing'
            targetTask.actualStartTime = targetTask.actualStartTime || new Date().toLocaleString()
          } else {
            targetTask.status = 'paused'
          }
          this.addTaskLog(task.id, `任务${actionText}`, isStart ? 'success' : 'warning')
          this.$message.success(`任务${actionText}成功`)
          this.loadTasks()
        }
      } catch (error) {
        // 用户取消操作
      }
    },

    // 批量开始任务
    async batchStart() {
      try {
        await this.$confirm(
            `确认开始选中的 ${this.selection.length} 个任务?`,
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
        )

        this.selection.forEach(task => {
          const target = this.mockDatabase.find(t => t.id === task.id)
          if (target && target.status !== 'processing') {
            target.status = 'processing'
            target.actualStartTime = target.actualStartTime || new Date().toLocaleString()
            this.addTaskLog(task.id, '任务开始', 'success')
          }
        })

        this.$message.success('批量开始成功')
        this.loadTasks()
      } catch (error) {
        // 用户取消操作
      }
    },

    // 批量暂停任务
    async batchPause() {
      try {
        await this.$confirm(
            `确认暂停选中的 ${this.selection.length} 个任务?`,
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
        )

        this.selection.forEach(task => {
          const target = this.mockDatabase.find(t => t.id === task.id)
          if (target && target.status === 'processing') {
            target.status = 'paused'
            this.addTaskLog(task.id, '任务暂停', 'warning')
          }
        })

        this.$message.success('批量暂停成功')
        this.loadTasks()
      } catch (error) {
        // 用户取消操作
      }
    },

    // 删除任务
    async handleDelete(task) {
      try {
        await this.$confirm('确认删除该任务?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const index = this.mockDatabase.findIndex(t => t.id === task.id)
        if (index !== -1) {
          this.mockDatabase.splice(index, 1)
          this.$message.success('任务删除成功')
          this.addOperationLog('删除', task.name)
          this.loadTasks()
        }
      } catch (error) {
        // 用户取消操作
      }
    },

    // 批量删除任务
    async batchDelete() {
      try {
        await this.$confirm(
            `确认删除选中的 ${this.selection.length} 个任务?`,
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'danger'
            }
        )

        const ids = this.selection.map(task => task.id)
        this.mockDatabase = this.mockDatabase.filter(task => !ids.includes(task.id))

        this.$message.success('批量删除成功')
        this.addOperationLog('批量删除', `${this.selection.length}个任务`)
        this.loadTasks()
      } catch (error) {
        // 用户取消操作
      }
    },

    // 显示任务详情
    async showTaskDetail(task) {
      this.currentTask = { ...task }
      await this.loadTaskLogs(task.id)
      this.detailDialogVisible = true
    },

    // 显示新增任务对话框
    showAddTask() {
      this.dialogTitle = '新增巡检任务'
      this.taskForm = {
        name: '',
        type: '',
        areas: [],
        items: [],
        executor: null,
        planStartTime: '',
        planEndTime: '',
        repeatDays: [],
        reminder: 'none',
        description: ''
      }
      this.taskDialogVisible = true
    },

    // 编辑任务
    handleEdit(task) {
      this.dialogTitle = '编辑巡检任务'
      this.taskForm = { ...task }
      this.taskDialogVisible = true
    },

    // 加载任务日志
    async loadTaskLogs(taskId) {
      // 模拟加载任务日志
      this.taskLogs = [
        {
          time: '2024-01-20 09:05:00',
          type: 'success',
          content: '任务开始执行'
        },
        {
          time: '2024-01-20 10:00:00',
          type: 'success',
          content: '完成温度检查：正常'
        },
        {
          time: '2024-01-20 10:05:00',
          type: 'success',
          content: '完成压力检查：正常'
        }
      ]
    },

    // 添加任务日志
    addTaskLog(taskId, content, type = 'info') {
      const log = {
        time: new Date().toLocaleString(),
        type,
        content
      }
      this.taskLogs.unshift(log)
    },

    // 导出任务
    exportTasks() {
      const exportData = this.mockDatabase.map(task => ({
        '任务名称': task.name,
        '任务类型': this.getTaskTypeName(task.type),
        '执行人': task.executor.name,
        '执行状态': this.getStatusName(task.status),
        '计划开始时间': task.planStartTime,
        '计划结束时间': task.planEndTime,
        '进度': `${task.progress}%`,
        '创建时间': task.createTime
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '巡检任务')

      const wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array'
      })

      saveAs(
          new Blob([wbout], { type: 'application/octet-stream' }),
          `巡检任务_${new Date().toLocaleDateString()}.xlsx`
      )
    },

    // 辅助方法
    getTaskTypeName(type) {
      const types = {
        daily: '日常巡检',
        special: '专项巡检',
        temporary: '临时巡检'
      }
      return types[type] || type
    },

    getTaskTypeTag(type) {
      const types = {
        daily: '',
        special: 'success',
        temporary: 'warning'
      }
      return types[type] || ''
    },

    getStatusName(status) {
      const statuses = {
        pending: '未开始',
        processing: '进行中',
        paused: '已暂停',
        completed: '已完成',
        timeout: '已超时'
      }
      return statuses[status] || status
    },

    getStatusType(status) {
      const types = {
        pending: 'info',
        processing: 'primary',
        paused: 'warning',
        completed: 'success',
        timeout: 'danger'
      }
      return types[status] || 'info'
    },

    getProgressStatus(task) {
      if (task.status === 'completed') return 'success'
      if (task.status === 'timeout') return 'exception'
      return ''
    },

    handleSelectionChange(val) {
      this.selection = val
    },

    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadTasks()
    },

    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadTasks()
    },

    handleDialogClose() {
      this.$refs.taskForm.resetFields()
      this.taskDialogVisible = false
    },

    searchTasks() {
      this.pagination.currentPage = 1
      this.loadTasks()
    },

    resetSearch() {
      this.searchForm = {
        name: '',
        type: '',
        status: '',
        dateRange: []
      }
      this.searchTasks()
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin-right: 20px;
}

.quick-actions {
  margin-left: 20px;
}

.search-form {
  margin: 15px 0;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.batch-actions {
  margin: 10px 0;
  padding: 10px;
  background-color: #fff3e6;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.task-form {
  max-height: 500px;
  overflow-y: auto;
}

.items-section,
.log-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.el-transfer {
  margin: 15px 0;
}

.line {
  text-align: center;
}
</style>