<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="过滤表的名字" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="过滤表的表述">
            <el-input v-model="form.blacklistDescribe" style="width: 370px;" />
          </el-form-item>
          <el-form-item v-if="crud.status.edit === 1" label="更新模式">
            <el-radio v-model="form.updateType" label="0">增量更新</el-radio>
            <el-radio v-model="form.updateType" label="1">全量更新</el-radio>
          </el-form-item>
          <el-form-item label="文件" prop="fileUrl">
            <el-upload
              ref="upload"
              :limit="1"
              :before-upload="beforeUpload"
              :auto-upload="true"
              :headers="headers"
              :on-success="handleSuccess"
              :on-error="handleError"
              :action="baseApi +'/uploadFile/upload'"
            >
              <div class="eladmin-upload"><i class="el-icon-upload" /> 添加文件</div>
              <div slot="tip" class="el-upload__tip">可上传xlsx或xls格式文件，且不超过100M</div>
            </el-upload>
          </el-form-item>
          <div>
            <el-link href="http://118.25.95.207:9000/ahtc/2021-04-21/0b4887ab-3878-4ac0-b1ec-44167b13b00b.xlsx">点击下载模版</el-link>
          </div>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="过滤表的名字" />
        <el-table-column prop="blacklistDescribe" label="过滤表的表述" />
        <el-table-column v-if="checkPer(['admin','keywordfiltering:edit','keywordfiltering:del'])" label="操作" width="150px" align="center">
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
import crudKeywordfiltering from '@/api/keyword/keywordfiltering'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'

const defaultForm = { id: null, createTime: null, updateTime: null, isDel: null, name: null, blacklistDescribe: null, fileUrl: null, updateType: null, by1: null, by2: null, by3: null, by4: null, by5: null, by6: null, by7: null, by8: null, by9: null, by10: null }
export default {
  name: 'Keywordfiltering',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '关键词过滤', url: 'api/keywordfiltering', idField: 'id', sort: 'id,desc', crudMethod: { ...crudKeywordfiltering }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'keywordfiltering:add'],
        edit: ['admin', 'keywordfiltering:edit'],
        del: ['admin', 'keywordfiltering:del']
      },
      headers: { 'Authorization': getToken() },
      rules: {
        name: [
          { required: true, message: '关键词表名不能为空', trigger: 'blur' }
        ],
        fileUrl: [
          { required: true, message: '上传文件不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'baseApi',
      'fileUploadApi'
    ])
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    beforeUpload(file) {
      let isLt2M = true
      isLt2M = file.size / 1024 / 1024 < 100
      console.log(file.type)
      var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const extension = testmsg === 'xls'
      const extension2 = testmsg === 'xlsx'
      if (!extension && !extension2) {
        this.$message.error('请上传xlsx或xls')
        return false
      }
      if (!isLt2M) {
        this.loading = false
        this.$message.error('上传文件大小不能超过 100MB!')
      }
      return isLt2M
    },
    handleSuccess(response, file, fileList) {
      this.crud.notify('上传成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
      console.log(response)
      this.form.fileUrl = response.data
    },
    // 监听上传失败
    handleError(e, file, fileList) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 2500
      })
      this.loading = false
    }
  }
}
</script>

<style scoped>

</style>
