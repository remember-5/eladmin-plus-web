<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="应用名称" prop="entryName">
            <el-input v-model="form.entryName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="负责人" prop="spreat">
            <el-input v-model="form.spreat" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="联系电话" prop="spreat2">
            <el-input v-model="form.spreat2" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="应用描述" prop="secret">
            <el-input v-model="form.spreat1" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="状态">
            <!--<el-input v-model="form.status" style="width: 370px;" />-->
            <template>
              <el-radio v-model="form.status" label="0">禁用</el-radio>
              <el-radio v-model="form.status" label="1">启用</el-radio>
            </template>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="entryName" label="应用名称" />
        <el-table-column prop="appid" label="appid" />
        <el-table-column prop="secret" label="密钥" />
        <el-table-column prop="spreat" label="负责人" />
        <el-table-column prop="spreat2" label="联系电话" />
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <!--            <div>{{scope.row.statu}}</div>-->
            <el-switch
              v-model="scope.row.statu"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="updatestatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column v-if="checkPer(['admin','projectInformation:edit','projectInformation:del'])" label="操作" width="150px" align="center">
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
  </div>
</template>

<script>
import crudProjectInformation from '@/api/projectInformation'
import CRUD, { presenter, header, form, crud } from './crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, entryName: null, appid: null, spreat: null, spreat1: null, spreat2: null, spreat3: null, secret: null, status: null, createTime: null, statu: null }
export default {
  name: 'ProjectInformation',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '项目信息', url: 'api/projectInformation', idField: 'id', sort: 'id,desc', crudMethod: { ...crudProjectInformation }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'projectInformation:add'],
        edit: ['admin', 'projectInformation:edit'],
        del: ['admin', 'projectInformation:del']
      },
      rules: {
        entryName: [
          { required: true, message: '应用名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    [CRUD.HOOK.afterRefresh]() {
      this.crud.data.forEach(item => {
        item.statu = item.status !== 0
      })
    },
    updatestatus(item) {
      console.log(item)
      if (item.statu) {
        item.status = 1
      } else {
        item.status = 0
      }
      crudProjectInformation.edit(item).then(res => {
        this.crud.refresh()
      })
    }
  }
}
</script>

<style scoped>

</style>
