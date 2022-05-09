<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">分类</label>
        <el-select v-model="query.type" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in typeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
        <label class="el-form-item-label">资源编号</label>
        <el-input v-model="query.num" clearable placeholder="资源编号" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">accessKey</label>
        <el-input v-model="query.accesskey" clearable placeholder="accessKey" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <up-operation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="95px">
          <el-form-item label="分类">
            <el-radio-group v-model="form.type">
              <el-radio :label="1">minIO</el-radio>
              <el-radio :label="2">七牛云</el-radio>
              <el-radio :label="3">阿里云</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="资源编号" prop="num">
            <el-input v-model="form.num" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="资源地址" prop="url">
            <el-input v-model="form.url" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="端口号" prop="port">
            <el-input v-model="form.port" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="空间名" prop="bucket">
            <el-input v-model="form.bucket" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="accessKey" prop="accesskey">
            <el-input v-model="form.accesskey" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="secretKey" prop="secretkey">
            <el-input v-model="form.secretkey" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="自定义前缀" prop="isPrefix">
            <el-radio-group v-model="form.isPrefix">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="自定义前缀内容">
            <el-input v-model="form.prefixStr" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="https" prop="isHttps">
            <el-radio-group v-model="form.isHttps">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remarks" :rows="3" type="textarea" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <el-dialog title="对象存储上传调试" :visible.sync="dialogVisible" width="40%" :before-close="handleClose">
        <el-form ref="form" :model="formData" :rules="rules" size="small" label-width="80px">
          <el-form-item label="资源编号">
            <el-input v-model="formData.num" style="width: 370px;" disabled />
          </el-form-item>
          <el-form-item label="上传背景">
            <el-upload
              style="margin-top: 20px;"
              class="upload-demo"
              :on-success="handleSuccessFile"
              :on-error="handleErrorFile"
              :before-upload="beforeAvatarUpload"
              :before-remove="beforeRemoveFile"
              :on-exceed="handleExceedFile"
              :file-list="FileUrl"
              :headers="headers"
              :limit="1"
              drag
              :action="this.$baseUrl+'/uploadFile/upload'"
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div slot="tip" class="el-upload__tip">只能上传1个文件，且不超过10MB</div>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="type" label="分类" width="60">
          <template slot-scope="scope">
            {{ dict.label.resources_type[scope.row.type] }}
          </template>
        </el-table-column>
        <el-table-column prop="num" label="资源编号" />
        <el-table-column prop="url" label="资源地址" width="130" />
        <el-table-column prop="port" label="端口号" width="60" />
        <el-table-column prop="bucket" label="空间名" />
        <el-table-column prop="accesskey" label="accessKey" />
        <el-table-column prop="secretkey" label="secretKey" width="150" />
        <el-table-column prop="isPrefix" label="自定义前缀">
          <template slot-scope="scope">
            {{ scope.row.isPrefix === 0 ? '否' : '是' }}
          </template>
        </el-table-column>
        <el-table-column prop="prefixStr" label="自定义前缀内容" width="120" />
        <el-table-column prop="isHttps" label="https">
          <template slot-scope="scope">
            {{ scope.row.isHttps === 0 ? '否' : '是' }}
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.enabled"
              v-permission="permission.switchs"
              active-color="#409EFF"
              inactive-color="#F56C6C"
              @change="changeEnabled(scope.row, scope.row.enabled,)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" width="150" />
        <el-table-column v-if="checkPer(['admin','resourcesManagement:edit','resourcesManagement:del'])" label="操作" width="160px" align="center">
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
import crudResourcesManagement from '@/api/resourcesManagement'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from './resourcesUD.operation'
import upOperation from '@crud/UP.operation'
import pagination from '@crud/Pagination'
import Bus from '@/utils/bus'
import { getToken } from '@/utils/auth'

const defaultForm = { id: null, type: null, num: null, url: null, port: null, bucket: null, accesskey: null, secretkey: null, enabled: null, isPrefix: null, prefixStr: null, isHttps: null, remarks: null, createDate: null, updateDate: null, isDeleted: null }
export default {
  name: 'ResourcesManagement',
  components: { pagination, crudOperation, rrOperation, udOperation, upOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['resource_status', 'resources_type'],
  cruds() {
    return CRUD({ title: '存储资源', url: 'api/resourcesManagement', idField: 'id', sort: 'id,desc', crudMethod: { ...crudResourcesManagement }})
  },
  data() {
    return {
      FileUrl: [],
      headers: { 'Authorization': getToken() },
      dialogVisible: false,
      formData: { num: null },
      permission: {
        add: ['admin', 'resourcesManagement:add'],
        edit: ['admin', 'resourcesManagement:edit'],
        del: ['admin', 'resourcesManagement:del'],
        switchs: ['admin', 'resourcesManagement:switchs'],
        importData: ['admin', 'resourcesManagement:importData']
      },
      rules: {
        num: [
          { required: true, message: '请输入资源编号', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输资源地址', trigger: 'blur' }
        ],
        port: [
          { required: true, message: '请输入端口号', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ],
        bucket: [
          { required: true, message: '请输入空间名', trigger: 'blur' }
        ],
        accesskey: [
          { required: true, message: '请输入accesskey', trigger: 'blur' }
        ],
        secretkey: [
          { required: true, message: '请输入secretkey', trigger: 'blur' }
        ],
        isPrefix: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        isHttps: [
          { required: true, message: '请选择', trigger: 'change' }
        ]
      },
      queryTypeOptions: [
        { key: 'type', display_name: '分类' },
        { key: 'num', display_name: '资源编号' },
        { key: 'accesskey', display_name: 'accessKey' }
      ],
      typeOptions: [
        { key: 1, display_name: 'minIO' },
        { key: 2, display_name: '七牛云' },
        { key: 3, display_name: '阿里云' }
      ]
    }
  },
  mounted() {
    Bus.$on('testUploadFile', (data) => {
      // console.log(data)
      this.formData.num = data.num
      this.FileUrl = []
      this.dialogVisible = true
    })
  },
  beforeDestroy() {
    Bus.$off('testUploadFile')
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    handleClose(done) {
      this.form.num = null
      done()
    },
    handleSuccessFile(response, file, fileList) {
      const that = this
      that.FileUrl.push({ name: response.data, url: response.data })
      this.$message.success('上传成功!!! 请在控制台查看url')
      console.log(that.FileUrl)
      this.dialogVisible = false
    },
    // 监听上传失败
    handleErrorFile(e, file, fileList) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 2500
      })
    },
    beforeRemoveFile(file, fileList) {
      if (file.name !== undefined) {
        for (let i = 0; i < this.FileUrl.length; i++) {
          if (this.FileUrl[i].name === file.url) {
            this.FileUrl.splice(i, 1)
          }
        }
      }
    },
    handleExceedFile(files, fileList) {
      return this.$message.warning(`当前限制选择文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeAvatarUpload(file) {
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB!')
      }
      return isLt10M
    },
    // 改变状态
    changeEnabled(data, val) {
      this.$confirm('此操作将 "' + this.dict.label.resource_status[val] + '" ' + data.num + '此存储资源, 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudResourcesManagement.editEnabled(data).then(res => {
          this.crud.notify(this.dict.label.resource_status[val] + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(err => {
          data.enabled = !data.enabled
          console.log(err.response.data.message)
        })
      }).catch(() => {
        data.enabled = !data.enabled
      })
    }
  }
}
</script>

<style scoped>

</style>
