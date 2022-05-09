<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--侧边数据-->
      <el-col :xs="9" :sm="6" :md="5" :lg="4" :xl="4">
        <el-tree
          :data="columnTreeDatas"
          :props="defaultProps"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        />
      </el-col>

      <el-col :xs="15" :sm="18" :md="19" :lg="20" :xl="20">
        <!--工具栏-->
        <div class="head-container">
          <el-button
            v-if="crud.optShow.add"
            v-permission="permission.adds"
            class="filter-item"
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="toAdd"
          >
            新增顶级栏目
          </el-button>
          <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
          <crudOperation :permission="permission" />
          <!--表单组件-->
          <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
            <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
              <el-form-item label="栏目名" prop="columnName">
                <el-input v-model="form.columnName" style="width: 370px;" />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="text" @click="crud.cancelCU">取消</el-button>
              <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
            </div>
          </el-dialog>
          <el-dialog :visible.sync="dialogVisible" title="新增顶级类目" width="500px" :before-close="handleClose">
            <el-form ref="form" :model="addFirstLevelColumnForm" :rules="rules" size="small" label-width="80px">
              <el-form-item label="栏目名" prop="columnName">
                <el-input v-model="addFirstLevelColumnForm.columnName" style="width: 370px;" />
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="text" @click="cancel">取消</el-button>
              <el-button type="primary" @click="submit">创建</el-button>
            </div>
          </el-dialog>
          <!--表格渲染-->
          <el-table ref="table" v-loading="crud.loading" :data="columnTableDatas" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="columnName" label="栏目名" />
            <el-table-column prop="createDate" label="创建时间" />
            <el-table-column v-if="checkPer(['admin','cmsColumn:edit','cmsColumn:del'])" label="操作" width="150px" align="center">
              <template slot-scope="scope">
                <udOperation
                  :data="scope.row"
                  :permission="permission"
                />
              </template>
            </el-table-column>
          </el-table>
          <!--分页组件-->
          <pagination />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudCmsColumn from '@/api/cmsColumn'
import CRUD, { presenter, header, form, crud } from './columncrud'
import crudOperation from './columnCRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import request from '@/utils/request'
import Bus from '@/utils/bus'

const defaultForm = { id: null, fid: null, columnName: null, createTime: null, updateTime: null, isDeleted: null, by1: null, by2: null, by3: null, by4: null, by5: null }
export default {
  name: 'CmsColumn',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '栏目管理', url: 'api/cmsColumn', idField: 'id', sort: 'id,desc', crudMethod: { ...crudCmsColumn }})
  },
  data() {
    return {
      columnTreeDatas: [],
      columnTableDatas: [],
      addFirstLevelColumnForm: { fid: null, columnName: null },
      dialogVisible: false,
      params: { fid: null },
      defaultProps: { children: 'columns', label: 'columnName', isLeaf: 'leaf' },
      permission: {
        add: ['admin', 'cmsColumn:add'],
        adds: ['admin', 'cmsColumn:addFirstLevelColumn'],
        edit: ['admin', 'cmsColumn:edit'],
        del: ['admin', 'cmsColumn:del']
      },
      rules: {
        columnName: [
          { required: true, message: '栏目名称不能为空', trigger: 'blur' }
        ]
      }}
  },
  created() {
    this.getTree()
    Bus.$on('refresh', (data) => {
      this.getTree()
    })
  },
  beforeDestroy() {
    Bus.$off('refresh')
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    getTree() {
      crudCmsColumn.getTree().then(data => {
        // console.log(data)
        this.columnTableDatas = []
        this.columnTreeDatas = []
        this.columnTreeDatas = data
      }).catch(err => {
        console.log(err)
      })
    },
    handleNodeClick(data) {
      // console.log(data)
      defaultForm.fid = data.id
      Bus.$emit('fid', data.id)
      this.params.fid = data.id
      this.addFirstLevelColumnForm.fid = data.id
      request({
        url: 'api/cmsColumn?page=0&size=10&sort=id%2Cdesc&fid=' + this.params.fid,
        method: 'get'
      }).then(data => {
        // console.log(data.content)
        this.columnTableDatas = []
        this.columnTableDatas = data.content
      }).catch(err => {
        console.log(err)
      })
    },
    handleClose(done) {
      this.addFirstLevelColumnForm.columnName = null
      done()
    },
    toAdd() {
      this.addFirstLevelColumnForm.columnName = null
      this.dialogVisible = true
    },
    cancel() {
      this.dialogVisible = false
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          crudCmsColumn.addFirstLevelColumn(this.addFirstLevelColumnForm).then(data => {
            // console.log(data)
            this.$message.success('创建成功')
            this.crud.refresh()
            this.dialogVisible = false
          }).catch(err => {
            console.log(err)
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
