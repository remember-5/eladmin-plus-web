<template>
  <div style="margin: 50px">
    <div>
      <div style="margin-bottom: 20px">
        <span><b style="font-size: 20px">自定义命名</b>上传文件</span>
      </div>
      <div>
        <el-input v-model="fileData.fileName" placeholder="请输入文件名(包含文件格式后缀)" style="width: 300px;" />
        <el-button type="primary" @click="clean">清空文件列表</el-button>
      </div>
      <div>
        <el-upload
          style="margin-top: 20px;"
          class="upload-demo"
          :on-success="handleSuccessFile"
          :on-error="handleErrorFile"
          :before-upload="beforeAvatarUpload"
          :before-remove="beforeRemoveFile"
          :on-exceed="handleExceedFile"
          :headers="headers"
          :limit="1"
          :file-list="myFiles"
          drag
          :data="fileData"
          :action="this.$baseUrl+'/uploadFile/uploadName'"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">只能上传1个文件，且不超过{{ maxsize }}MB</div>
        </el-upload>
      </div>
      <el-row v-for="(item, index) in myFiles" :key="index">
        <div>{{ item.url }}</div>
      </el-row>
    </div>
    <div>
      <el-divider />
    </div>
    <div>
      <div style="margin-bottom: 20px">
        <span><b style="font-size: 20px">随机命名</b>上传文件</span>
      </div>
      <div>
        <my-file-upload :max-size="maxSize" :file-length="fileLength" @returnFileList="returnFileList" />
      </div>
      <el-row v-for="(item, index) in fileUrls" :key="index">
        <div>{{ item.url }}</div>
      </el-row>
    </div>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import MyFileUpload from '@/components/fileUpload/myFileUpload'
export default {
  components: { MyFileUpload },
  data() {
    return {
      fileData: { fileName: null },
      maxsize: 10,
      headers: { 'Authorization': getToken() },
      myFiles: [],
      fileUrls: [],
      maxSize: 10,
      fileLength: 1
    }
  },
  methods: {
    // 上传组件返回文件列表
    returnFileList(fileList) {
      this.fileUrls = fileList
    },
    // 监听上传成功
    handleSuccessFile(response, file, fileList) {
      this.myFiles.push({ name: file.name, url: response.data })
      this.$message.success('上传成功!!!')
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
          }
        })
      }
    },
    // 上传文件数量限制
    handleExceedFile(files, fileList) {
      return this.$message.warning(`当前限制选择文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },
    // 上传文件前事件 用来校验了
    beforeAvatarUpload(file) {
      if (!this.fileData.fileName) {
        this.$notify({
          title: '请输入文件名(包含文件格式后缀)',
          type: 'error',
          duration: 2500
        })
        return false
      }
      const isLt10M = file.size / 1024 / 1024 < this.maxsize
      if (!isLt10M) {
        this.$message.error(`上传文件大小不能超过 ${this.maxsize}!`)
      }
      return isLt10M
    },
    // 清空文件列表按钮
    clean() {
      this.myFiles = []
      this.fileData.fileName = null
    }
  }
}
</script>

<style scoped>

</style>
