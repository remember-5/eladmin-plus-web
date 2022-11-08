<template>
  <el-upload
    style="margin-top: 20px;"
    class="upload-demo"
    :on-success="handleSuccessFile"
    :on-error="handleErrorFile"
    :before-upload="beforeAvatarUpload"
    :before-remove="beforeRemoveFile"
    :on-exceed="handleExceedFile"
    :headers="headers"
    :limit="maxsize"
    :on-change="handleChange"
    :file-list="files"
    drag
    :list-type="listType"
    :action="this.$baseUrl+'/uploadFile/upload'"
  >
    <i class="el-icon-upload" />
    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    <div slot="tip" class="el-upload__tip">只能上传1个文件，且不超过{{ maxsize }}MB</div>
  </el-upload>
</template>

<script>
import { getToken } from '@/utils/auth'
export default {
  name: 'MyFileUpload',
  props: {
    upList: null,
    maxsize: {
      type: Number,
      default: 1
    },
    listType: {
      type: String,
      default: ''
    },
    files: {
      type: Array,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: []
    },
    form: null,
    formItemName: null
  },
  data() {
    return {
      headers: { 'Authorization': getToken() },
      myFiles: [],
      myFileInfos: [],
      mapFileInfoMaps: {},
      maps: {}
    }
  },
  mounted() {
    this.files.forEach(item => {
      this.maps[item.url] = item.url
      this.myFiles.push(item.url)
    })
    if (this.form) {
      this.maps[this.form[this.formItemName]] = this.form[this.formItemName]
      this.myFiles.push(this.form[this.formItemName])
    }
  },
  methods: {
    handleSuccessFile(response, file, fileList) {
      this.maps[file.name] = response.data
      this.mapFileInfoMaps[file.name] = response.data
      this.myFiles.push(response.data)
      this.myFileInfos.push({
        name: file.name,
        url: response.data
      })
      if (this.upList) this.upList(this.myFiles, this.myFileInfos)
      if (this.form) {
        this.form[this.formItemName] = response.data
      }
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
        this.myFiles.forEach((item, index) => {
          if (this.maps[file.name] === item) {
            this.$delete(this.myFiles, index)
            this.$delete(this.myFileInfos, index)
            if (this.upList) this.upList(this.myFiles, this.myFileInfos)
          }
        })
      }
    },
    handleExceedFile(files, fileList) {
      return this.$message.warning(`当前限制选择文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    beforeAvatarUpload(file) {
      const isLt10M = file.size / 1024 / 1024 < this.maxsize
      if (!isLt10M) {
        this.$message.error(`上传文件大小不能超过 ${this.maxsize}!`)
      }
      return isLt10M
    },
    handleChange(file, fileList) {
    }
  }
}
</script>

<style scoped>

</style>
