<template>
  <div class="app-container" style="padding: 8px;">
    <!--表单组件-->
    <eForm ref="form" />
    <!-- 工具栏 -->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.key" clearable size="small" placeholder="输入文件名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery" />
        <date-range-picker v-model="query.createTime" class="date-item" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission">
        <template slot="left">
          <!-- 上传 -->
          <el-button class="filter-item" size="mini" type="primary" icon="el-icon-upload" disabled @click="dialog = true">上传</el-button>
          <!-- 同步 -->
          <el-button :icon="icon" class="filter-item" size="mini" type="warning" disabled>同步</el-button>
          <!-- 配置 -->
          <el-button
            class="filter-item"
            size="mini"
            type="success"
            icon="el-icon-s-tools"
            @click="doConfig"
          >配置</el-button>
        </template>
      </crudOperation>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" :show-overflow-tooltip="true" label="文件名">
        <!--          <template slot-scope="scope">-->
        <!--            <a href="JavaScript:" class="el-link el-link&#45;&#45;primary" target="_blank" type="primary" @click="download(scope.row.id)">{{ scope.row.key }}</a>-->
        <!--          </template>-->
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="suffix" label="文件类型" @selection-change="crud.selectionChangeHandler" />
        <el-table-column prop="bucket" label="空间名称" />
        <el-table-column prop="size" label="文件大小" />
        <el-table-column prop="updateTime" label="创建日期" />
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudMinio from '@/api/tools/minio'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import eForm from './form'
import CRUD, { presenter, header, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

export default {
  components: { eForm, pagination, crudOperation, rrOperation, DateRangePicker },
  cruds() {
    return CRUD({ title: 'Minio文件', url: 'api/minioConfig', crudMethod: { ...crudMinio }})
  },
  mixins: [presenter(), header(), crud()],
  data() {
    return {
      permission: {
        del: ['admin', 'storage:del']
      },
      title: '文件', dialog: false,
      icon: 'el-icon-refresh',
      url: '', headers: { 'Authorization': getToken() },
      dialogImageUrl: '', dialogVisible: false, fileList: [], files: [], newWin: null
    }
  },
  computed: {
    ...mapGetters([
      'qiNiuUploadApi'
    ])
  },
  watch: {
    url(newVal, oldVal) {
      if (newVal && this.newWin) {
        this.newWin.sessionStorage.clear()
        this.newWin.location.href = newVal
        // 重定向后把url和newWin重置
        this.url = ''
        this.newWin = null
      }
    }
  },
  created() {
    this.crud.optShow.add = false
    this.crud.optShow.edit = false
  },
  methods: {
    // 七牛云配置
    doConfig() {
      const _this = this.$refs.form
      _this.init()
      _this.dialog = true
    }
  }
}
</script>

<style scoped>

</style>
