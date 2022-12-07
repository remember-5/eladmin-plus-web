<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <up-operation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="app的唯一标识">
            <el-input v-model="form.appId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="app的名称">
            <el-input v-model="form.appName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="版本号 as 1.0.0">
            <el-input v-model="form.version" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="构建版本 as 400">
            <el-input v-model="form.build" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="版本标题 as 3.0版本隆重登场">
            <el-input v-model="form.title" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="版本更新内容,主要在app上展示">
            <el-input v-model="form.info" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="最低支持的版本 as 1.0.2">
            <el-input v-model="form.minVersion" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新方式 forcibly = 强制更新, solicit = 弹窗确认更新, silent = 静默更新">
            <el-input v-model="form.updateType" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="平台 ios/android/app(ios&android)">
            <el-input v-model="form.platform" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="wgt">
            <el-input v-model="form.wgtUrl" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="apk">
            <el-input v-model="form.apkUrl" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="是否发布 0=未发布 1=发布">
            <el-input v-model="form.published" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="是否归档 0=未归档 1=归档 可在拦截器判断，归档的版本禁止提供服务">
            <el-input v-model="form.archived" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="逻辑删除 0=未删除 1=删除">
            <el-input v-model="form.isDeleted" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="最新版本 0=不是最新 1=最新">
            <el-input v-model="form.isLatestRelease" style="width: 370px;" />
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
        <el-table-column prop="appId" label="app的唯一标识" />
        <el-table-column prop="appName" label="app的名称" />
        <el-table-column prop="version" label="版本号 as 1.0.0" />
        <el-table-column prop="build" label="构建版本 as 400" />
        <el-table-column prop="title" label="版本标题 as 3.0版本隆重登场" />
        <el-table-column prop="info" label="版本更新内容,主要在app上展示" />
        <el-table-column prop="minVersion" label="最低支持的版本 as 1.0.2" />
        <el-table-column prop="updateType" label="更新方式 forcibly = 强制更新, solicit = 弹窗确认更新, silent = 静默更新" />
        <el-table-column prop="platform" label="平台 ios/android/app(ios&android)" />
        <el-table-column prop="wgtUrl" label="wgt" />
        <el-table-column prop="apkUrl" label="apk" />
        <el-table-column prop="published" label="是否发布 0=未发布 1=发布" />
        <el-table-column prop="archived" label="是否归档 0=未归档 1=归档 可在拦截器判断，归档的版本禁止提供服务" />
        <el-table-column prop="isDeleted" label="逻辑删除 0=未删除 1=删除" />
        <el-table-column prop="isLatestRelease" label="最新版本 0=不是最新 1=最新" />
        <el-table-column prop="createTime" label="创建时间" />
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
import upOperation from '@crud/UP.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, appId: null, appName: null, version: null, build: null, title: null, info: null, minVersion: null, updateType: null, platform: null, wgtUrl: null, apkUrl: null, published: null, archived: null, isDeleted: null, isLatestRelease: null, updateTime: null, createTime: null }
export default {
  name: 'AppVersion',
  components: { pagination, crudOperation, rrOperation, udOperation, upOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: 'app版本', url: 'api/appVersion', idField: 'id', sort: 'id,desc', crudMethod: { ...crudAppVersion }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'appVersion:add'],
        edit: ['admin', 'appVersion:edit'],
        del: ['admin', 'appVersion:del'],
        importData: ['admin', 'appVersion:importData']
      },
      rules: {
      }}
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
