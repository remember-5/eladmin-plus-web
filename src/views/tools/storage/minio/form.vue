<template>
  <el-dialog :visible.sync="dialog" :close-on-click-modal="false" title="七牛云配置" append-to-body width="580px">
    <el-form ref="form" :model="form" :rules="rules" style="margin-top: 6px;" size="small" label-width="110px">
      <el-form-item label="url" prop="host">
        <el-input v-model="form.host" style="width: 95%;" placeholder="http://xxx.xxx.xxx.xxx:9000" />
      </el-form-item>
      <el-form-item label="空间名称" prop="bucket">
        <el-input v-model="form.bucket" style="width: 95%;" placeholder="存储空间名称作为唯一的 Bucket 识别符" />
      </el-form-item>
      <el-form-item label="Access Key" prop="accessKey">
        <el-input v-model="form.accessKey" style="width: 95%" placeholder="accessKey" />
      </el-form-item>
      <el-form-item label="Secret Key" prop="secretKey">
        <el-input v-model="form.secretKey" type="password" style="width: 95%;" placeholder="secretKey" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="dialog = false">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { get, update } from '@/api/tools/minio'
export default {
  data() {
    return {
      dialog: false,
      loading: false, form: { accessKey: '', secretKey: '', bucket: '', host: '', id: '' },
      rules: {
        accessKey: [
          { required: true, message: '请输入accessKey', trigger: 'blur' }
        ],
        secretKey: [
          { required: true, message: '请输入secretKey', trigger: 'blur' }
        ],
        bucket: [
          { required: true, message: '请输入空间名称', trigger: 'blur' }
        ],
        host: [
          { required: true, message: '请输入url', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init() {
      get().then(res => {
        if (res) {
          this.form = res[0]
        }
      })
    },
    doSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true
          update(this.form).then(res => {
            this.$notify({
              title: '修改成功',
              type: 'success',
              duration: 2500
            })
            // 查询文件
            // this.$parent.crud.toQuery()
            this.loading = false
            this.dialog = false
          }).catch(err => {
            this.loading = false
            console.log(err.response.data.message)
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
