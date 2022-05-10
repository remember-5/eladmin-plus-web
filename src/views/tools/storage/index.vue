<template>
  <el-tabs v-model="activeName" style="padding-left: 8px;" @tab-click="tabClick">
    <el-tab-pane label="本地存储" name="first">
      <Local ref="local" />
    </el-tab-pane>
    <el-tab-pane label="七牛云存储" name="second">
      <QiNiu ref="qiNiu" />
    </el-tab-pane>
    <el-tab-pane label="Minio存储" name="minio">
      <Minio ref="minio" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import Minio from './minio/index'
import QiNiu from './qiniu/index'
import Local from './local/index'
export default {
  name: 'Storage',
  components: { Minio, QiNiu, Local },
  data() {
    return {
      activeName: 'first'
    }
  },
  methods: {
    tabClick(name) {
      if (this.activeName === 'first') {
        this.$refs.local.crud.toQuery()
      } else if (this.activeName === 'second') {
        this.$refs.qiNiu.crud.toQuery()
      }
      // else if (this.activeName === 'minio') {
      //   this.$refs.minio.crud.toQuery()
      // }
    }
  }
}
</script>

<style scoped>
</style>
