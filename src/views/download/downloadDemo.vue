<template>
  <el-button type="primary" icon="el-icon-download" @click="downloadfile()" />
</template>

<script>
import download from 'downloadjs'
import axios from 'axios'

export default {
  name: 'DownloadDemo',
  methods: {
    downloadfile(row) {
      // url 文件url路径
      axios({
        method: 'get',
        url: '',
        data: {},
        responseType: 'blob'
      }).then(res => {
        // console.log(res);
        if (!res) {
          return
        }
        // fileName 文件名字
        download(res.data, row.fileName, res.data.type)
      }).catch((error) => {
        console.log(error)
      })
      // console.log(row)
      // 下载文件
      // download('aa.png', row.url)
    }
  }
}
</script>

<style scoped>

</style>
