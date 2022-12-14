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
    :limit="fileLength"
    :file-list="myFiles"
    drag
    :list-type="listType"
    :action="this.$baseUrl+'/uploadFile/upload'"
  >
    <i class="el-icon-upload" />
    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    <div slot="tip" class="el-upload__tip">只能上传1个文件，且不超过{{ maxSize }}MB</div>
  </el-upload>
</template>

<script>
import { getToken } from '@/utils/auth'
export default {
  name: 'MyFileUpload',
  props: {
    maxSize: {
      type: Number,
      default: 1
    },
    fileLength: {
      type: Number,
      default: 1
    },
    listType: {
      type: String,
      default: 'text'
    }
  },
  data() {
    return {
      headers: { 'Authorization': getToken() },
      myFiles: []
    }
  },
  methods: {
    // 监听上传成功
    handleSuccessFile(response, file, fileList) {
      this.myFiles.push({ name: file.name, url: response.data })
      this.$message.success('上传成功!!!')
      this.$emit('returnFileList', this.myFiles)
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
    beforeRemoveFile(file, fileList) {
      if (file.name !== undefined) {
        this.myFiles.forEach((item, index) => {
          if (file.name === item.name) {
            this.myFiles.splice(index, 1)
            this.$emit('returnFileList', this.myFiles)
          }
        })
      }
    },
    // 上传文件数量限制
    handleExceedFile(files, fileList) {
      return this.$message.warning(`当前限制选择文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    // 上传文件前事件 用来校验了 可校验文件格式
    beforeAvatarUpload(file) {
      // todo 校验文件格式
      const isMaxSize = file.size / 1024 / 1024 < this.maxSize
      if (!isMaxSize) {
        this.$message.error(`上传文件大小不能超过 ${this.maxSize}!`)
      }
      return isMaxSize
    }
  }
}
</script>

<style scoped>

</style>
