<template>
  <div class="crud-opts">
    <span class="crud-opts-left">
      <el-button
        v-permission="permission.importData"
        :loading="crud.downloadTemplateLoading"
        class="filter-item"
        size="mini"
        type="success"
        icon="el-icon-download"
        @click="crud.downloadTemplate()"
      >
        下载模板
      </el-button>
    </span>
    <span class="crud-opts-right">
      <el-upload
        class="upload-demo"
        :on-success="importData"
        :on-error="errorInfo"
        :headers="headers"
        :action="this.$baseUrl + '/' + crud.url + '/importData'"
        :show-file-list="false"
      >
        <el-button
          v-permission="permission.importData"
          class="filter-item"
          size="mini"
          type="warning"
          icon="el-icon-upload2"
        >
          导入
        </el-button>
      </el-upload>
    </span>
  </div>
</template>

<script>
import { crud } from '@crud/crud'
import { getToken } from '@/utils/auth'

export default {
  mixins: [crud()],
  props: {
    permission: {
      type: Object,
      default: () => { return {} }
    }
  },
  data() {
    return {
      headers: { 'Authorization': getToken() }
    }
  },
  watch: {},
  methods: {
    importData(response, file, fileList) {
      this.crud.refresh()
      this.$notify({
        title: '导入成功',
        type: 'success',
        duration: 1000
      })
    },
    errorInfo(err, file, fileList) {
      console.error(err)
      this.$notify({
        title: '导入失败',
        type: 'error',
        duration: 1000
      })
    }
  }
}
</script>

<style scoped>
.crud-opts {
  padding: 4px 0;
  display: -webkit-flex;
  display: flex;
  align-items: center;
}

.crud-opts .crud-opts-right {
  margin-left: 0;
}
</style>
