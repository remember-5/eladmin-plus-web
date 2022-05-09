<template>
  <div class="tinymce-container">
    <div style="float: left;width: 80%;">
      <div class="block" style="margin-top: 20px;">
        <span class="demonstration">栏目：</span>
        <!--        <el-input v-model="programa" placeholder="一级栏目" style="margin-top: 10px;"></el-input>-->
        <!--        <el-input v-model="programa" placeholder="二级栏目" style="margin-top: 10px;"></el-input>-->
        <el-select v-model="hobbiess" placeholder="请选择" @change="changecmsColumn1()">
          <el-option
            v-for="item in hobbies"
            :key="item.columnName"
            :label="item.columnName"
            :value="item.id"
            @click.native="getcmsColumn1(item.id)"
          />
        </el-select>
        <!-- <el-cascader :options="options" :show-all-levels="false"></el-cascader> -->
        <el-select v-model="hobbiesss" placeholder="请选择">
          <el-option
            v-for="item in hobbies1"
            :key="item.columnName"
            :label="item.columnName"
            :value="item.id"
          />
        </el-select>
      </div>
      <div class="block" style="margin-top: 20px;">
        <span class="demonstration">作者：</span>
        <el-input v-model="author" placeholder="作者" style="margin-top: 10px;" />
      </div>
      <div class="block" style="margin-top: 20px;">
        <span class="demonstration">标题：</span>
        <el-input v-model="title" placeholder="标题名称" style="margin-top: 10px;" />
      </div>
      <div class="block" style="margin-top: 20px;">
        <span class="demonstration">发布内容：</span>
        <!-- <el-input v-model="value" type="textarea" :rows="5" placeholder="内容" style="margin-top: 10px;" /> -->
        <editor id="tinymce" v-model="value" style="height: 200px" :init="init" />
      </div>
      <div class="block" style="margin-top: 20px;">
        <span class="demonstration">上传附件：</span>
        <el-upload
          v-model="annexUrl"
          style="margin-top: 20px;"
          class="upload-demo"
          :on-success="handleSuccessFile"
          :on-error="handleErrorFile"
          :before-remove="beforeRemoveFile"
          :on-exceed="handleExceedFile"
          :file-list="imgListFile"
          :headers="headers"
          list-type="picture"
          drag
          :action="this.$baseUrl+'/uploadFile/upload'"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div slot="tip" class="el-upload__tip">建议上传比例1:1,只能上传jpg/png文件，且不超过500kb,最多只能上传1个文件，建议上传尺寸750x380图片</div>
        </el-upload>
      </div>
    </div>

    <div style="float: right;width: 20%;">
      <div class="block" style="margin-top: 20px;">
        <el-button style="margin-top: 20px;" type="primary" @click="addCms()">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import crudCms from '@/api/cms'
import crudColumn from '@/api/cmsColumn'
import tinymce from 'tinymce'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/themes/silver/theme'
import 'tinymce/plugins/image'
import 'tinymce/plugins/link'
import 'tinymce/plugins/code'
import 'tinymce/plugins/table'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/wordcount'
import 'tinymce/skins/ui/oxide/skin.css'
import CRUD from '@crud/crud'
import 'tinymce/icons/default/icons.js'
import axios from 'axios'
import { getToken } from '@/utils/auth'
// 下面的插件是自带的,不需要引入
// import "tinymce/plugins/contextmenu";
// import "tinymce/plugins/colorpicker";
// import "tinymce/plugins/textcolor";
export default {
  name: 'AddCms',
  components: {
    Editor
  },
  props: {
    tinymceHtml: null,
    tinymceHeight: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      headers: { 'Authorization': getToken() },
      imgListFile: [],
      hobbies: '',
      hobbiess: '',
      hobbiesss: '',
      hobbies1: '',
      programa: '',
      author: '',
      title: '',
      content: '',
      annexUrl: '',
      value: this.tinymceHtml, // 父组件通过ref拿到该组件的值
      init: {
        selector: '#tinymce',
        language_url: '/zh_CN.js',
        language: 'zh_CN',
        skin_url: 'tinymce/skins/ui/oxide', // 编辑器需要一个skin才能正常工作，所以要设置一个skin_url指向之前复制出来的skin文件
        height: this.tinymceHeight,
        plugins: 'advlist anchor autolink autosave code codesample colorpicker colorpicker contextmenu directionality emoticons fullscreen hr image imagetools insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textcolor textpattern visualblocks visualchars wordcount', // 引入插件
        toolbar: 'fontselect fontsizeselect lineheight searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample hr bullist numlist link image charmap preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen', // 工具栏
        browser_spellcheck: true, // 拼写检查
        branding: false, // 去水印
        elementpath: false, // 禁用编辑器底部的状态栏
        statusbar: false, // 隐藏编辑器底部的状态栏
        paste_data_images: true, // 允许粘贴图像
        menubar: 'file edit insert view format table', // 隐藏最上方menu

        file_picker_types: 'image',
        images_upload_credentials: true,
        fontsize_formats: '14px 16px 18px 20px 24px 26px 28px 30px 32px 36px', // 字体大小
        font_formats:
                        '微软雅黑=Microsoft YaHei,Helvetica Neue;PingFang SC;sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun;serifsans-serif;Terminal=terminal;monaco;Times New Roman=times new roman;times', // 字体
        /**
         * 下面方法是为tinymce添加自定义插入图片按钮
         * 借助iview的Upload组件,将图片先上传到存储云上，再将图片的存储地址放入编辑器内容
         */
        // 图片上传三个参数，图片数据，成功时的回调函数，失败时的回调函数
        images_upload_handler: function(blobInfo, success, failure) {
          const formdata = new FormData()
          formdata.append('file', blobInfo.blob())
          axios.post(process.env.VUE_APP_BASE_API + '/uploadFile/upload', formdata, { headers: { 'Authorization': getToken() }}).then(res => {
            success(res.data.data)
          }).catch(error => {
            console.log(error)
            failure('error')
          })
        }
      }
    }
  },
  computed: {},
  watch: {
    tinymceHtml(newV, oldV) {
      this.value = newV
    }
  },
  created() {
    this.getcmsColumn()
  },
  mounted() {
    tinymce.init({})
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    handleSuccessFile(response, file, fileList) {
      const that = this
      that.annexUrl = response.data
      that.imgListFile.push({ name: response.data, url: response.data })
      //        if (that.imgListTop.length > 1) {
      //          return this.$confirm(`最多只能上传1张`);
      //        }
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
      console.log(file)

      if (file.name !== undefined) {
        for (let i = 0; i < this.imgListFile.length; i++) {
          if (this.imgListFile[i].name === file.url) {
            this.imgListFile.splice(i, 1)
          }
        }
      }
    },
    handleExceedFile(files, fileList) {
      return this.$message.warning(`当前限制选择文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`)
    },

    getcmsColumn() {
      crudColumn.selectcms({ fid: -1 })
        .then(response => {
          this.hobbies = response
        }).catch(err => {
          console.log(err)
        })
    },

    getcmsColumn1(str) {
      // debugger
      crudColumn.selectcms({ fid: str })
        .then(response => {
          this.hobbies1 = response
        }).catch(err => {
          console.log(err)
        })
    },
    changecmsColumn1() {
      this.hobbiesss = ''
    },

    addCms() {
      const data = {
        // programa: this.programa,
        column: { id: this.hobbiesss ? this.hobbiesss : this.hobbiess },
        author: this.author,
        title: this.title,
        content: this.value,
        annexUrl: this.annexUrl
      }
      crudCms.add(data).then(res => {
        this.$message({
          message: '提交成功！',
          type: 'success'
        })
        this.$router.push({ name: 'Cms' })
      }).catch(err => {
        console.log(err)
        this.$message.error('@、@ 程序员哥哥也不知道哪里出了问题，请联系管理员！')
      })
    }

  }
}
</script>
<style lang="scss" scoped>
</style>
