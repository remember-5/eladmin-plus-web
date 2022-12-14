<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <el-input v-model="query.version" clearable size="small" placeholder="版本号" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
      <el-input v-model="query.build" clearable size="small" placeholder="构建版本" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
      <el-input v-model="query.minVersion" clearable size="small" placeholder="最低支持的版本" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
      <el-select v-model="query.published" clearable size="small" placeholder="是否发布" class="filter-item" style="width: 120px" @change="crud.toQuery">
        <el-option v-for="item in publishedOptions" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <rrOperation />
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="700px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="150px">
          <el-form-item label="app的唯一标识" prop="appId">
            <el-input v-model="form.appId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="app的名称" prop="appName">
            <el-input v-model="form.appName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="版本号" prop="version">
            <el-input v-model="form.version" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="构建版本" prop="build">
            <el-input v-model="form.build" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="版本标题" prop="title">
            <el-input v-model="form.title" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="版本更新内容" prop="info">
            <el-input v-model="form.info" type="textarea" :rows="6" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="最低支持的版本">
            <el-input v-model="form.minVersion" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新方式">
            <el-select
              v-model="form.updateType"
              style="width: 178px"
              placeholder="请选择"
            >
              <el-option
                v-for="item in updateTypes"
                :key="item.key"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="平台">
            <el-select
              v-model="form.platform"
              style="width: 178px"
              placeholder="请选择"
            >
              <el-option
                v-for="item in platforms"
                :key="item.key"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="wgt文件上传">
            <el-upload
              style="margin-top: 20px;"
              class="upload-demo"
              :on-success="handleSuccessWgtFile"
              :on-error="handleErrorFile"
              :before-upload="beforeAvatarUpload"
              :before-remove="beforeRemoveWgtFile"
              :on-exceed="handleExceedFile"
              :headers="headers"
              :limit="1"
              :file-list="wgtFiles"
              drag
              :action="this.$baseUrl+'/uploadFile/upload'"
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
            <el-input v-model="form.wgtUrl" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="apk文件上传">
            <el-upload
              style="margin-top: 20px;"
              class="upload-demo"
              :on-success="handleSuccessApkFile"
              :on-error="handleErrorFile"
              :before-upload="beforeAvatarUpload"
              :before-remove="beforeRemoveApkFile"
              :on-exceed="handleExceedFile"
              :headers="headers"
              :limit="1"
              :file-list="apkFiles"
              drag
              :action="this.$baseUrl+'/uploadFile/upload'"
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
            <el-input v-model="form.apkUrl" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="是否发布">
            <el-radio-group v-model="form.published" style="width: 180px">
              <el-radio :label="0">未发布</el-radio>
              <el-radio :label="1">发布</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否归档">
            <el-radio-group v-model="form.archived" style="width: 180px">
              <el-radio :label="0">未归档</el-radio>
              <el-radio :label="1">归档</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="最新版本">
            <el-radio-group v-model="form.isLatestRelease" style="width: 180px">
              <el-radio :label="0">不是最新</el-radio>
              <el-radio :label="1">最新</el-radio>
            </el-radio-group>
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
        <el-table-column prop="appId" label="app的唯一标识" width="120" />
        <el-table-column prop="appName" label="app的名称" width="120" />
        <el-table-column prop="version" label="版本号" width="60" />
        <el-table-column prop="build" label="构建版本" width="70" />
        <el-table-column prop="title" label="版本标题" width="120" />
        <el-table-column prop="info" label="版本更新内容" width="300" />
        <el-table-column prop="minVersion" label="最低版本" width="70" />
        <el-table-column prop="updateType" label="更新方式" width="80">
          <template slot-scope="scope">
            {{ scope.row.updateType === 'forcibly' ? '强制更新' : scope.row.updateType === 'solicit' ? '弹窗确认更新' : scope.row.updateType === 'silent' ? '静默更新' : scope.row.updateType }}
          </template>
        </el-table-column>
        <el-table-column prop="platform" label="平台" width="100">
          <template slot-scope="scope">
            {{ scope.row.platform }}
          </template>
        </el-table-column>
        <el-table-column prop="wgtUrl" label="wgt">
          <template slot-scope="scope">
            <div v-if="scope.row.wgtUrl">
              <el-link :href="scope.row.wgtUrl">点击下载</el-link>
            </div>
            <div v-else>
              -
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="apkUrl" label="apk">
          <template slot-scope="scope">
            <div v-if="scope.row.apkUrl">
              <el-link :href="scope.row.apkUrl">点击下载</el-link>
            </div>
            <div v-else>
              -
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="published" label="是否发布" width="100">
          <template slot-scope="scope">
            {{ scope.row.published === 0 ? '未发布' : scope.row.published === 1 ? '已发布' : scope.row.published }}
          </template>
        </el-table-column>
        <el-table-column prop="archived" label="是否归档" width="100">
          <template slot-scope="scope">
            {{ scope.row.archived === 0 ? '未归档' : scope.row.archived === 1 ? '已归档' : scope.row.archived }}
          </template>
        </el-table-column>
        <el-table-column prop="isLatestRelease" label="最新版本" width="100">
          <template slot-scope="scope">
            {{ scope.row.isLatestRelease === 0 ? '旧版本' : scope.row.isLatestRelease === 1 ? '最新版本' : scope.row.isLatestRelease }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="140" />
        <el-table-column v-if="checkPer(['admin','appVersion:edit','appVersion:del'])" label="操作" width="150px" align="center">
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
import crudAppVersion from '@/api/appVersion'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { getToken } from '@/utils/auth'

const defaultForm = { id: null, appId: null, appName: null, version: null, build: null, title: null, info: null, minVersion: null, updateType: 'silent', platform: 'app(ios&android)', wgtUrl: null, apkUrl: null, published: 0, archived: 0, isDeleted: null, isLatestRelease: 0, updateTime: null, createTime: null }
export default {
  name: 'AppVersion',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: 'app版本', url: 'api/appVersion', idField: 'id', sort: 'id,desc', crudMethod: { ...crudAppVersion }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'appVersion:add'],
        edit: ['admin', 'appVersion:edit'],
        del: ['admin', 'appVersion:del']
      },
      rules: {
        appId: [
          { required: true, message: '请输入唯一标识', trigger: 'blur' }
        ],
        appName: [
          { required: true, message: '请输入app名称', trigger: 'blur' }
        ],
        version: [
          { required: true, message: '请输入版本号', trigger: 'blur' }
        ],
        build: [
          { required: true, message: '请输入构建版本', trigger: 'blur' }
        ],
        title: [
          { required: true, message: '请输入版本标题', trigger: 'blur' }
        ],
        info: [
          { required: true, message: '请输入版本更新内容', trigger: 'blur' }
        ]
      },
      updateTypes: [
        { key: 0, name: '强制更新', value: 'forcibly' },
        { key: 1, name: '弹窗确认更新', value: 'solicit' },
        { key: 2, name: '静默更新', value: 'silent' }
      ],
      platforms: [
        { key: 0, name: 'android' },
        { key: 1, name: 'ios' },
        { key: 2, name: 'app(ios&android)' }
      ],
      publishedOptions: [
        { key: 0, name: '未发布' },
        { key: 1, name: '已发布' }
      ],
      headers: { 'Authorization': getToken() },
      wgtFiles: [],
      apkFiles: []
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    [CRUD.HOOK.afterToCU](crud, form) {
      this.wgtFiles = []
      this.apkFiles = []
      return true
    },
    // 监听上传成功
    handleSuccessWgtFile(response, file, fileList) {
      this.wgtFiles = []
      this.wgtFiles.push({ name: file.name, url: response.data })
      this.$message.success('上传成功!!!')
      this.form.wgtUrl = response.data
    },
    handleSuccessApkFile(response, file, fileList) {
      this.apkFiles = []
      this.apkFiles.push({ name: file.name, url: response.data })
      this.$message.success('上传成功!!!')
      this.form.apkUrl = response.data
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
    // 监听移除文件
    beforeRemoveWgtFile(file, fileList) {
      if (file.name !== undefined) {
        this.wgtFiles.forEach((item, index) => {
          if (file.name === item.name) {
            this.wgtFiles.splice(index, 1)
            if (this.form.wgtUrl === item.url) {
              this.form.wgtUrl = null
            }
          }
        })
      }
    },
    beforeRemoveApkFile(file, fileList) {
      if (file.name !== undefined) {
        this.apkFiles.forEach((item, index) => {
          if (file.name === item.name) {
            this.apkFiles.splice(index, 1)
            if (this.form.apkUrl === item.url) {
              this.form.apkUrl = null
            }
          }
        })
      }
    },
    // 上传文件数量限制
    handleExceedFile(files, fileList) {
      return this.$message.warning(`当前限制选择文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    // 上传文件前事件 可校验文件格式/大小
    beforeAvatarUpload(file) {
    }
  }
}
</script>

<style scoped>

</style>
