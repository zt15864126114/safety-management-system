<template>
  <div class="alert-rules">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="规则名称">
          <el-input v-model="searchForm.name" placeholder="请输入规则名称"></el-input>
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select v-model="searchForm.type" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="阈值规则" value="threshold"></el-option>
            <el-option label="趋势规则" value="trend"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规则状态">
          <el-select v-model="searchForm.status" placeholder="请选择">
            <el-option label="全部" value=""></el-option>
            <el-option label="启用" :value="true"></el-option>
            <el-option label="停用" :value="false"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleAdd">新增规则</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 规则列表 -->
    <el-card class="table-card">
      <el-table
          :data="rulesList"
          v-loading="loading"
          style="width: 100%">
        <el-table-column prop="name" label="规则名称" width="180"></el-table-column>
        <el-table-column prop="type" label="规则类型" width="120">
          <template slot-scope="scope">
            {{ getRuleTypeName(scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="触发条件" width="200"></el-table-column>
        <el-table-column prop="level" label="预警等级" width="120">
          <template slot-scope="scope">
            <el-tag :type="getAlertLevelType(scope.row.level)">
              {{ getAlertLevelName(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-switch
                v-model="scope.row.status"
                @change="(val) => handleStatusChange(val, scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="primary"
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

    <!-- 规则表单对话框 -->
    <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        width="50%"
        :before-close="handleDialogClose">
      <el-form
          :model="ruleForm"
          :rules="rules"
          ref="ruleForm"
          label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="规则类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择规则类型">
            <el-option label="阈值规则" value="threshold"></el-option>
            <el-option label="趋势规则" value="trend"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="触发条件" prop="condition">
          <el-input v-model="ruleForm.condition"></el-input>
        </el-form-item>
        <el-form-item label="预警等级" prop="level">
          <el-select v-model="ruleForm.level" placeholder="请选择预警等级">
            <el-option label="高" value="high"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="低" value="low"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规则状态" prop="status">
          <el-switch v-model="ruleForm.status"></el-switch>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
              type="textarea"
              :rows="3"
              v-model="ruleForm.description">
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
  name: 'AlertRules',
  data() {
    return {
      // 搜索表单
      searchForm: {
        name: '',
        type: '',
        status: ''
      },
      // 规则列表
      rulesList: [],
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
      // 规则表单
      ruleForm: {
        id: null,
        name: '',
        type: '',
        condition: '',
        level: '',
        status: true,
        description: ''
      },
      // 表单验证规则
      rules: {
        name: [
          { required: true, message: '请输入规则名称', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择规则类型', trigger: 'change' }
        ],
        condition: [
          { required: true, message: '请输入触发条件', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择预警等级', trigger: 'change' }
        ]
      },
      // 模拟数据库
      mockDatabase: [
        {
          id: 1,
          name: '温度过高预警',
          type: 'threshold',
          condition: '温度 > 80℃',
          level: 'high',
          status: true,
          description: '设备温度过高预警规则',
          createTime: '2024-01-20 10:00:00'
        },
        {
          id: 2,
          name: '压力异常预警',
          type: 'trend',
          condition: '压力持续上升30分钟',
          level: 'medium',
          status: true,
          description: '设备压力异常预警规则',
          createTime: '2024-01-20 11:00:00'
        }
      ]
    }
  },
  methods: {
    // 加载规则列表
    loadRules() {
      this.loading = true
      // 模拟API调用
      setTimeout(() => {
        let filteredRules = [...this.mockDatabase]

        // 根据搜索条件过滤
        if (this.searchForm.name) {
          filteredRules = filteredRules.filter(rule =>
              rule.name.toLowerCase().includes(this.searchForm.name.toLowerCase())
          )
        }
        if (this.searchForm.type) {
          filteredRules = filteredRules.filter(rule =>
              rule.type === this.searchForm.type
          )
        }
        if (this.searchForm.status !== '') {
          filteredRules = filteredRules.filter(rule =>
              rule.status === this.searchForm.status
          )
        }

        // 计算分页
        const start = (this.pagination.currentPage - 1) * this.pagination.pageSize
        const end = start + this.pagination.pageSize

        this.pagination.total = filteredRules.length
        this.rulesList = filteredRules.slice(start, end)
        this.loading = false
      }, 500)
    },

    // 搜索
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadRules()
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

    // 新增规则
    handleAdd() {
      this.dialogTitle = '新增预警规则'
      this.ruleForm = {
        id: null,
        name: '',
        type: '',
        condition: '',
        level: '',
        status: true,
        description: ''
      }
      this.dialogVisible = true
    },

    // 编辑规则
    handleEdit(row) {
      this.dialogTitle = '编辑预警规则'
      this.ruleForm = { ...row }
      this.dialogVisible = true
    },

    // 删除规则
    handleDelete(row) {
      this.$confirm('确认删除该规则?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = this.mockDatabase.findIndex(r => r.id === row.id)
        if (index !== -1) {
          this.mockDatabase.splice(index, 1)
          this.$message.success('删除成功')
          this.loadRules()
        }
      }).catch(() => {})
    },

    // 保存规则
    handleSave() {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          const now = new Date().toLocaleString()

          if (this.ruleForm.id) {
            // 编辑现有规则
            const index = this.mockDatabase.findIndex(r => r.id === this.ruleForm.id)
            if (index !== -1) {
              this.mockDatabase[index] = {
                ...this.mockDatabase[index],
                ...this.ruleForm,
                updateTime: now
              }
            }
          } else {
            // 新增规则
            const newRule = {
              ...this.ruleForm,
              id: Date.now(),
              createTime: now,
              updateTime: now
            }
            this.mockDatabase.push(newRule)
          }

          this.$message.success('保存成功')
          this.dialogVisible = false
          this.loadRules()
        }
      })
    },

    // 规则状态改变
    handleStatusChange(value, row) {
      const actionText = value ? '启用' : '停用'
      this.$confirm(`确认${actionText}该规则?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const targetRule = this.mockDatabase.find(r => r.id === row.id)
        if (targetRule) {
          targetRule.status = value
          this.$message.success(`${actionText}成功`)
          this.loadRules()
        }
      }).catch(() => {
        row.status = !value // 回滚状态
      })
    },

    // 获取规则类型名称
    getRuleTypeName(type) {
      const types = {
        threshold: '阈值规则',
        trend: '趋势规则'
      }
      return types[type] || type
    },

    // 获取预警等级类型
    getAlertLevelType(level) {
      const types = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return types[level] || ''
    },

    // 获取预警等级名称
    getAlertLevelName(level) {
      const names = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return names[level] || level
    },

    // 对话框关闭处理
    handleDialogClose() {
      this.$refs.ruleForm.resetFields()
      this.dialogVisible = false
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadRules()
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadRules()
    }
  },

  created() {
    this.loadRules()
  }
}
</script>

<style scoped>
.alert-rules {
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
</style>