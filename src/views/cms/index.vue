<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <!-- 搜索 -->
      <el-input v-model="query.author" clearable size="small" placeholder="输入作者姓名" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
      <el-select v-model="query.auditStatus" clearable size="small" placeholder="审核状态" class="filter-item" style="width: 110px" @change="crud.toQuery">
        <el-option v-for="item in auditStatusOptions" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-select v-model="query.cmsStatus" clearable size="small" placeholder="发布状态" class="filter-item" style="width: 110px" @change="crud.toQuery">
        <el-option v-for="item in cmsStatusOptions" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <!--      <el-button @click="addSearchCriteria()">添加</el-button>-->
      <!-- <el-row v-for="(item,index) in searchCriteria" :key="index">
        <el-col :span="4">
          <el-select v-model="searchCriteria[index].joinsymbol" clearable size="small">
            <el-option v-for=" (item1,index1) in dict.label.es_join_symbol" :key="index1" :label="item1" :value="index1" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchCriteria[index].value.field" clearable size="small" @change="searchCriteriaChange(index)">
            <el-option v-for=" (item1,index1) in dict.label.es_cms_field" :key="index1" :label="item1" :value="index1" />
          </el-select>
        </el-col>
        <el-col v-if="!(searchCriteria[index].value.field=='publishTime'|| searchCriteria[index].value.field=='updateTime')" :span="12">
          <el-input v-model="searchCriteria[index].value.value" size="small" />
        </el-col>
        <el-col v-else :span="12">
          <el-date-picker
            v-model="searchCriteria[index].value.value"
            size="small"
            type="datetimerange"
            format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right"
          />
        </el-col>
        <el-col v-if="index!=0" :span="1">
          <el-button size="small" @click="delSearchCriteria(index)">-</el-button>
        </el-col>
        <el-col :span="1">
          <el-button size="small" @click="addSearchCriteria(index)">+</el-button>
        </el-col>
      </el-row> -->
      <rrOperation />
      <crudOperation :permission="permission" />
      <el-row />
      <!--      <el-row>
        <el-button @click="esSearch()">搜索</el-button>
      </el-row> -->
      <!--表单组件-->
      <!--  预览    -->
      <el-dialog title="预览" :visible.sync="viewdialogVisible" width="50%" :before-close="handleClose">
        <div style="width: 100%" v-html="viewhtml" />
      </el-dialog>
      <!--  审核   -->
      <el-dialog :visible.sync="auditdialogVisible" :before-close="handleClose" title="审核" width="500px">
        <el-form ref="form" :model="auditForm" :rules="rules" size="small" label-width="80px">
          <el-form-item label="审核">
            <el-radio-group v-model="auditForm.auditStatus">
              <el-radio :label="1">通过</el-radio>
              <el-radio :label="2">驳回</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="意见">
            <el-input v-model="auditForm.auditProposal" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="handleClose">取消</el-button>
          <el-button type="primary" @click="auditSubmit">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" border size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="column.columnName" label="栏目" />
        <el-table-column prop="author" label="作者" />
        <el-table-column prop="title" label="内容标题" />
        <el-table-column prop="content" label="发布内容" width="150" show-overflow-tooltip />
        <el-table-column prop="cmsStatus" label="状态">
          <template slot-scope="scope">
            {{ dict.label.cms_status[scope.row.cmsStatus] }}
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核状态">
          <template slot-scope="scope">
            {{ dict.label.audit_status[scope.row.auditStatus] }}
          </template>
        </el-table-column>
        <el-table-column prop="auditPerson" label="审核人" />
        <el-table-column prop="auditProposal" label="审核意见" />
        <el-table-column prop="auditTime" label="审核时间" />
        <el-table-column prop="publishTime" label="发布时间" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="updateTime" label="修改时间" />
        <el-table-column prop="annexUrl" label="附件url" show-overflow-tooltip />
        <el-table-column v-if="checkPer(['admin','cms:edit','cms:del'])" label="操作" width="280px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
              @view="view"
              @audit="audit"
              @publish="publish"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudCms from '@/api/cms'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from './cmsCRUD.operation'
import udOperation from './cmsUD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, columnId: null, author: null, title: null, content: null, cmsStatus: null, auditPerson: null, auditStatus: null, auditProposal: null, createTime: null, updateTime: null, publishTime: null, auditTime: null, isDeleted: null, annexUrl: null, by2: null, by3: null, by4: null, by5: null }
export default {
  name: 'Cms',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: 'cms', url: 'api/cms', idField: 'id', sort: 'id,desc', crudMethod: { ...crudCms }})
  },
  // 设置数据字典
  dicts: ['audit_status', 'cms_status', 'es_join_symbol', 'es_cms_field'],
  data() {
    return {
      permission: {
        add: ['admin', 'cms:add'],
        edit: ['admin', 'cms:edit'],
        del: ['admin', 'cms:del']
      },
      auditStatusOptions: [
        { key: 0, name: '未审核' },
        { key: 1, name: '已通过' },
        { key: 2, name: '未通过' }
      ],
      cmsStatusOptions: [
        { key: 0, name: '未发布' },
        { key: 1, name: '已发布' }
      ],
      rules: {
      },
      viewdialogVisible: false,
      viewhtml: null,
      auditdialogVisible: false,
      auditForm: { auditStatus: null, auditProposal: null },
      auditData: null,
      searchCriteria: [
        {
          'joinsymbol': 'and',
          'value': {
            'field': 'all',
            'value': ''
          }
        }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    // 预览
    view(data) {
      if (data.content != '' && data.content != null) {
        this.viewhtml = data.content
        this.viewdialogVisible = true
      } else {
        this.viewhtml = '暂无内容'
        this.viewdialogVisible = true
      }
    },
    handleClose(done) {
      done()
    },
    // 审核
    audit(data) {
      console.log(data)
      this.auditData = data
      this.auditForm.auditStatus = null
      this.auditForm.auditProposal = null
      this.auditdialogVisible = true
    },
    auditSubmit() {
      this.auditData.auditStatus = this.auditForm.auditStatus
      this.auditData.auditProposal = this.auditForm.auditProposal
      crudCms.audit(this.auditData).then(e => {
        this.$message.success('审核完成')
        this.crud.refresh()
      }).catch(err => {
        console.log(err)
      })
      this.auditdialogVisible = false
    },
    // 发布
    publish(data) {
      console.log(data)
      this.$confirm('确定发布文章?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudCms.publish(data).then(e => {
          this.$message.success('发布成功')
          this.crud.refresh()
          this.pushtest(data.column.columnName, data.title)
        }).catch(err => {
          console.log(err)
        })
      }).catch(() => {
      })
    },
    // 推送信息
    pushtest(typeName, msgBriefly) {
      crudCms.pushTest(typeName, msgBriefly).then(r => {
        console.log(r)
      })
    },
    // 添加条件
    addSearchCriteria(index) {
      this.searchCriteria.splice(index + 1, 0,
        {
          'joinsymbol': 'and',
          'value': {
            'field': 'all',
            'value': ''
          }
        }
      )
    },
    delSearchCriteria(index) {
      this.searchCriteria.splice(index, 1)
    },
    esSearch() {
      console.log(JSON.stringify(this.searchCriteria))
      crudCms.esquery(this.searchCriteria).then(res => {
        if (res) {
          this.crud.data = res
        } else {
          this.$message({
            message: '暂无数据',
            type: 'warning'
          })
        }
      })
    },
    searchCriteriaChange(index) {
      this.searchCriteria[index].value.value = ''
    }
  }
}
</script>

<style scoped>

</style>
