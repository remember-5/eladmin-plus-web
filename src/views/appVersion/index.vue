<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <up-operation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="500px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="版本号" prop="versionName">
            <el-input v-model="form.versionName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="打包号" prop="buildCode">
            <el-input v-model="form.buildCode" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="最新">
            <el-select v-model="form.isNew" placeholder="请选择">
              <el-option
                v-for="(item,index) in isAndNot"
                :key="index"
                :label="item"
                :value="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="升级说明">
            <el-input v-model="form.content" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="下载链接" prop="url">
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
          <el-form-item label="必须更新">
            <el-select v-model="form.isMust" placeholder="请选择">
              <el-option
                v-for="(item,index) in isAndNot"
                :key="index"
                :label="item"
                :value="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="资源类型">
            <el-select v-model="form.resType" placeholder="请选择">
              <el-option
                v-for="(item,index) in resType"
                :key="index"
                :label="item"
                :value="index"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="id" />
        <el-table-column prop="versionName" label="版本号" />
        <el-table-column prop="buildCode" label="打包号" />
        <el-table-column prop="isNew" label="是否最新">
          <template slot-scope="scope">
            {{ isAndNot[scope.row.isNew] }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="升级说明" />
        <el-table-column prop="url" label="下载链接">
          <template slot-scope="scope">
            <el-link :href="scope.row.url">点击下载</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="isMust" label="是否是必须更新">
          <template slot-scope="scope">
            {{ isAndNot[scope.row.isMust] }}
          </template>
        </el-table-column>
        <el-table-column prop="resType" label="资源类型">
          <template slot-scope="scope">
            {{ resType[scope.row.resType] }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="checkPer(['admin','version:edit','version:del'])"
          label="操作"
          width="150px"
          align="center"
        >
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
import crudVersion from '@/api/version'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import upOperation from '@crud/UP.operation'
import pagination from '@crud/Pagination'
import { getToken } from '@/utils/auth'

const defaultForm = {
  id: null,
  versionName: null,
  buildCode: null,
  isNew: null,
  isDeleted: null,
  content: null,
  url: null,
  createDate: null,
  updateDate: null,
  isMust: null,
  resType: null
}
export default {
  name: 'Version',
  components: { pagination, crudOperation, udOperation, upOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: 'app版本', url: 'api/version', idField: 'id', sort: 'id,desc', crudMethod: { ...crudVersion }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'version:add'],
        edit: ['admin', 'version:edit'],
        del: ['admin', 'version:del'],
        importData: ['admin', 'version:importData']
      },
      FileUrl: [],
      headers: { 'Authorization': getToken() },
      resType: {
        1: 'apk',
        2: 'wgt'
      },
      is_new: {
        1: '历史',
        0: '最新'
      },
      isAndNot: {
        1: '否',
        0: '是'
      },
      rules: {
        versionName: [
          { required: true, message: '版本号  这里设定为只有基础功能或大改动时才会有改动不能为空', trigger: 'blur' }
        ],
        buildCode: [
          { required: true, message: '打包号  这里设定wgt包改动或功能性改动不能为空', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '下载链接不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    handleSuccessFile(response, file, fileList) {
      this.form.url = response.data
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
    }
  }
}
</script>

<style scoped>

</style>
