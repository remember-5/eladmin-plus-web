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
      <el-row v-for="item in myFiles" :key="item">
        <div>{{ item }}</div>
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
        <my-file-upload :maxsize="maxSize" :up-list="updateFiles" />
      </div>
      <el-row v-for="item in fileUrls" :key="item">
        <div>{{ item }}</div>
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
      myFileInfos: [],
      mapFileInfoMaps: {},
      maps: {},
      fileUrls: [],
      maxSize: 10
    }
  },
  methods: {
    handleSuccessFile(response, file, fileList) {
      this.maps[file.name] = response.data
      this.mapFileInfoMaps[file.name] = response.data
      this.myFiles.push(response.data)
      this.myFileInfos.push({
        name: this.fileData.fileName,
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
    clean() {
      this.myFiles = []
      this.myFileInfos = []
      this.mapFileInfoMaps = {}
      this.maps = {}
      this.fileData.fileName = null
    },
    updateFiles(files) {
      this.fileUrls = files
    }
  }
}
</script>

<style scoped>

</style>
