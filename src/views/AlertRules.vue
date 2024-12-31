<template>
  <div class="alert-rules">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card" :body-style="{ padding: '20px' }">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="规则名称">
          <el-input
              v-model="searchForm.name"
              placeholder="请输入规则名称"
              clearable>
          </el-input>
        </el-form-item>
        <el-form-item label="规则类型">
          <el-select
              v-model="searchForm.type"
              placeholder="请选择"
              clearable>
            <el-option label="阈值规则" value="threshold"></el-option>
            <el-option label="趋势规则" value="trend"></el-option>
            <el-option label="状态规则" value="status"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预警等级">
          <el-select
              v-model="searchForm.level"
              placeholder="请选择"
              clearable>
            <el-option label="高" value="high"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="低" value="low"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规则状态">
          <el-select
              v-model="searchForm.status"
              placeholder="请选择"
              clearable>
            <el-option :label="'启用'" :value="true"></el-option>
            <el-option :label="'停用'" :value="false"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" icon="el-icon-search">查询</el-button>
          <el-button @click="resetSearch" icon="el-icon-refresh">重置</el-button>
          <el-button type="success" @click="handleAdd" icon="el-icon-plus">新增规则</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 规则列表 -->
    <el-card class="table-card" :body-style="{ padding: '20px' }">
      <el-table
          :data="rulesList"
          v-loading="loading"
          border
          style="width: 100%">
        <el-table-column prop="name" label="规则名称" min-width="180">
          <template slot-scope="scope">
            <el-tooltip :content="scope.row.description" placement="top" effect="light">
              <span class="rule-name">{{ scope.row.name }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="规则类型" width="120">
          <template slot-scope="scope">
            <el-tag :type="getRuleTypeStyle(scope.row.type)">
              {{ getRuleTypeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="触发条件" min-width="200">
          <template slot-scope="scope">
            <el-tooltip
                :content="getConditionDetail(scope.row)"
                placement="top"
                effect="light">
              <span>{{ scope.row.condition }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="预警等级" width="100">
          <template slot-scope="scope">
            <el-tag
                :type="getAlertLevelType(scope.row.level)"
                effect="dark">
              {{ getAlertLevelName(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-switch
                v-model="scope.row.status"
                @change="(val) => handleStatusChange(val, scope.row)"
                active-color="#13ce66"
                inactive-color="#ff4949">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="primary"
                @click="handleEdit(scope.row)"
                icon="el-icon-edit">
              编辑
            </el-button>
            <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
                icon="el-icon-delete">
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
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称"></el-input>
        </el-form-item>
        <el-form-item label="规则类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择规则类型" style="width: 100%">
            <el-option label="阈值规则" value="threshold"></el-option>
            <el-option label="趋势规则" value="trend"></el-option>
            <el-option label="状态规则" value="status"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="触发条件" prop="condition">
          <el-input
              v-model="ruleForm.condition"
              type="textarea"
              :rows="3"
              placeholder="请输入触发条件">
          </el-input>
        </el-form-item>
        <el-form-item label="预警等级" prop="level">
          <el-select v-model="ruleForm.level" placeholder="请选择预警等级" style="width: 100%">
            <el-option label="高" value="high"></el-option>
            <el-option label="中" value="medium"></el-option>
            <el-option label="低" value="low"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="规则状态" prop="status">
          <el-switch
              v-model="ruleForm.status"
              active-color="#13ce66"
              inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="规则描述" prop="description">
          <el-input
              v-model="ruleForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入规则描述">
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
        level: '',
        status: ''
      },
      // 加载状态
      loading: false,
      // 分页信息
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      // 规则列表
      rulesList: [],
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
          { required: true, message: '请输入规则名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择规则类型', trigger: 'change' }
        ],
        condition: [
          { required: true, message: '请输入触发条件', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择预警等级', trigger: 'change' }
        ],
        description: [
          { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
        ]
      },
      // 模拟数据库
      mockDatabase: [
        {
          id: 1,
          name: '温度过高预警',
          type: 'threshold',
          condition: '温度 > 80°C',
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
        if (this.searchForm.level) {
          filteredRules = filteredRules.filter(rule =>
              rule.level === this.searchForm.level
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
        level: '',
        status: ''
      }
      this.handleSearch()
    },

    // 新增规则
    handleAdd() {
      this.dialogTitle = '新增规则'
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
      this.dialogTitle = '编辑规则'
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
          if (this.ruleForm.id) {
            // 编辑现有规则
            const index = this.mockDatabase.findIndex(r => r.id === this.ruleForm.id)
            if (index !== -1) {
              this.mockDatabase[index] = {
                ...this.mockDatabase[index],
                ...this.ruleForm,
                updateTime: this.formatDateTime(new Date())
              }
            }
          } else {
            // 新增规则
            const newRule = {
              ...this.ruleForm,
              id: Date.now(),
              createTime: this.formatDateTime(new Date()),
              updateTime: this.formatDateTime(new Date())
            }
            this.mockDatabase.push(newRule)
          }

          this.$message.success('保存成功')
          this.dialogVisible = false
          this.loadRules()
        }
      })
    },

    // 状态改变
    handleStatusChange(val, row) {
      const actionText = val ? '启用' : '停用'
      this.$message.success(`${actionText}成功`)
      const index = this.mockDatabase.findIndex(r => r.id === row.id)
      if (index !== -1) {
        this.mockDatabase[index].status = val
      }
    },

    // 对话框关闭
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
    },

    // 获取规则类型名称
    getRuleTypeName(type) {
      const types = {
        threshold: '阈值规则',
        trend: '趋势规则',
        status: '状态规则'
      }
      return types[type] || type
    },

    // 获取规则类型样式
    getRuleTypeStyle(type) {
      const styles = {
        threshold: 'primary',
        trend: 'success',
        status: 'warning'
      }
      return styles[type] || ''
    },

    // 获取预警等级名称
    getAlertLevelName(level) {
      const levels = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return levels[level] || level
    },

    // 获取预警等级样式
    getAlertLevelType(level) {
      const types = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return types[level] || ''
    },

    // 获取条件详情
    getConditionDetail(rule) {
      return `${rule.name}\n${rule.condition}\n${rule.description}`
    },

    // 格式化日期时间
    formatDateTime(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
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
  transition: all 0.3s;
}

.search-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-form .el-form-item {
  margin-bottom: 0;
  margin-right: 10px;
}

.table-card {
  transition: all 0.3s;
}

.table-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.rule-name {
  color: #409EFF;
  cursor: pointer;
  transition: color 0.3s;
}

.rule-name:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 表格动画效果 */
.el-table {
  transition: all 0.3s;
}

.el-table:hover {
  transform: translateY(-2px);
}

.el-table td, .el-table th {
  transition: background-color 0.3s;
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #f5f7fa;
}

/* 标签动画效果 */
.el-tag {
  transition: all 0.3s;
}

.el-tag:hover {
  transform: scale(1.05);
}

/* 按钮动画效果 */
.el-button {
  transition: all 0.3s;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
}

/* 开关动画效果 */
.el-switch {
  transition: all 0.3s;
}

.el-switch:hover {
  opacity: 0.8;
}

/* 对话框动画效果 */
.el-dialog {
  transition: all 0.3s;
}

.el-dialog__header {
  border-bottom: 1px solid #ebeef5;
  padding: 20px;
  margin: 0;
}

.el-dialog__body {
  padding: 30px 20px;
}

.el-dialog__footer {
  border-top: 1px solid #ebeef5;
  padding: 20px;
  text-align: right;
}

/* 表单动画效果 */
.el-form-item {
  transition: all 0.3s;
}

.el-form-item:hover {
  transform: translateX(5px);
}

.el-input__inner,
.el-textarea__inner {
  transition: all 0.3s;
}

.el-input__inner:focus,
.el-textarea__inner:focus {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,.1);
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

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .search-form {
    .el-form-item {
      margin-bottom: 10px;
    }
  }
}

@media screen and (max-width: 768px) {
  .alert-rules {
    padding: 10px;
  }

  .el-form-item {
    width: 100%;
    margin-right: 0;
  }

  .el-dialog {
    width: 90% !important;
  }
}

/* 自定义动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-rules {
  animation: slideIn 0.5s ease-out;
}

/* 工具提示动画 */
.el-tooltip__popper {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 表格行动画 */
.el-table__row {
  transition: all 0.3s;
}

.el-table__row:hover {
  background-color: #f5f7fa !important;
  transform: scale(1.001);
}

/* 卡片内容过渡效果 */
.el-card__body {
  transition: all 0.3s;
}

.el-card:hover .el-card__body {
  transform: translateY(-2px);
}
</style>