<template>
  <div class="app-container">
    <el-row :gutter="15">
      <el-col style="margin-bottom: 10px">
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">字段配置：{{ tableName }}</span>
            <el-button
              :loading="genLoading"
              icon="el-icon-s-promotion"
              size="mini"
              style="float: right; padding: 6px 9px;"
              type="success"
              @click="toGen"
            >保存&生成</el-button>
            <el-button
              :loading="columnLoading"
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px;margin-right: 9px"
              type="primary"
              @click="saveColumnConfig"
            >保存</el-button>
            <el-tooltip class="item" effect="dark" content="数据库中表字段变动时使用该功能" placement="top-start">
              <el-button
                :loading="syncLoading"
                icon="el-icon-refresh"
                size="mini"
                style="float: right; padding: 6px 9px;"
                type="info"
                @click="sync"
              >同步</el-button>
            </el-tooltip>
          </div>
          <el-form size="small" label-width="90px">
            <el-table v-loading="loading" :data="data" :max-height="tableHeight" size="small" style="width: 100%;margin-bottom: 15px">
              <el-table-column prop="columnName" label="字段名称" />
              <el-table-column prop="columnType" label="字段类型" />
              <el-table-column prop="remark" label="字段描述">
                <template slot-scope="scope">
                  <el-input v-model="data[scope.$index].remark" size="mini" class="edit-input" />
                </template>
              </el-table-column>
              <el-table-column align="center" label="必填" width="70px">
                <template slot-scope="scope">
                  <el-checkbox v-model="data[scope.$index].notNull" />
                </template>
              </el-table-column>
              <el-table-column align="center" label="列表" width="70px">
                <template slot-scope="scope">
                  <el-checkbox v-model="data[scope.$index].listShow" />
                </template>
              </el-table-column>
              <el-table-column align="center" label="表单" width="70px">
                <template slot-scope="scope">
                  <el-checkbox v-model="data[scope.$index].formShow" />
                </template>
              </el-table-column>
              <el-table-column label="表单类型">
                <template slot-scope="scope">
                  <el-select v-model="data[scope.$index].formType" filterable class="edit-input" clearable size="mini" placeholder="请选择">
                    <el-option
                      label="文本框"
                      value="Input"
                    />
                    <el-option
                      label="文本域"
                      value="Textarea"
                    />
                    <el-option
                      label="单选框"
                      value="Radio"
                    />
                    <el-option
                      label="下拉框"
                      value="Select"
                    />
                    <el-option
                      label="日期框"
                      value="Date"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="查询方式">
                <template slot-scope="scope">
                  <el-select v-model="data[scope.$index].queryType" filterable class="edit-input" clearable size="mini" placeholder="请选择">
                    <el-option
                      label="="
                      value="="
                    />
                    <el-option
                      label="!="
                      value="!="
                    />
                    <el-option
                      label=">="
                      value=">="
                    />
                    <el-option
                      label="<="
                      value="<="
                    />
                    <el-option
                      label="Like"
                      value="Like"
                    />
                    <el-option
                      label="NotNull"
                      value="NotNull"
                    />
                    <el-option
                      label="BetWeen"
                      value="BetWeen"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="日期注解">
                <template slot-scope="scope">
                  <el-select v-model="data[scope.$index].dateAnnotation" filterable class="edit-input" clearable size="mini" placeholder="请选择">
                    <el-option
                      label="自动创建时间"
                      value="CreationTimestamp"
                    />
                    <el-option
                      label="自动更新时间"
                      value="UpdateTimestamp"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="关联字典">
                <template slot-scope="scope">
                  <el-select v-model="data[scope.$index].dictName" filterable class="edit-input" clearable size="mini" placeholder="请选择">
                    <el-option v-for="item in dicts" :key="item.id" :label="item.remark === '' ? item.name : item.remark" :value="item.name" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </el-card>
      </el-col>
      <el-col>
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">生成配置</span>
            <el-button
              :loading="configLoading"
              icon="el-icon-check"
              size="mini"
              style="float: right; padding: 6px 9px"
              type="primary"
              @click="doSubmit"
            >保存</el-button>
          </div>
          <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
            <el-form-item label="作者名称" prop="author">
              <el-input v-model="form.author" style="width: 40%" placeholder="wangjiahao" />
              <span style="color: #C0C0C0;margin-left: 10px;">类上面的作者名称</span>
            </el-form-item>
            <el-form-item label="模块名称" prop="moduleName">
              <el-select v-model="form.moduleName" placeholder="请选择模块" style="width: 40%" @change="changeModule">
                <el-option
                  v-for="item in modulesOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <!--              <el-input v-model="form.moduleName" style="width: 40%" placeholder="eladmin-system" />-->
              <span style="color: #C0C0C0;margin-left: 10px;">模块的名称，请选择项目中已存在的模块</span>
            </el-form-item>
            <el-form-item label="至于包下" prop="pack">
              <el-input v-model="form.pack" style="width: 40%" placeholder="com.remember5.system.modules.xx" />
              <span style="color: #C0C0C0;margin-left: 10px;">项目包的名称，生成的代码放到哪个包里面(自动获取包名),<b>会根据表名生成文件夹</b></span>
              <el-tree
                ref="tree"
                style="width: 40%"
                :data="packageOptions"
                :props="defaultPackageProps"
                accordion
                :highlight-current="true"
                :filter-node-method="packageFilterNode"
                empty-text="请选择模块后，再来选择包名"
                @node-click="packageClick"
              />
            </el-form-item>
            <el-form-item label="接口名称" prop="apiAlias">
              <el-input v-model="form.apiAlias" style="width: 40%" />
              <span style="color: #C0C0C0;margin-left: 10px;">接口的名称，用于控制器与接口文档中</span>
            </el-form-item>
            <el-form-item label="相对路径" prop="relativePath">
              <el-radio-group :key="form.autoGenerateMenu" v-model="form.relativePath" size="mini" style="width: 40%">
                <el-radio-button label="true">是</el-radio-button>
                <el-radio-button label="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="前端路径" prop="path">
              <el-input v-model="form.path" style="width: 40%" />
              <span style="color: #C0C0C0;margin-left: 10px;">输入views文件夹下的目录，不存在即创建</span>
            </el-form-item>
            <!--            <el-form-item label="接口目录">-->
            <!--              <el-input v-model="form.apiPath" style="width: 40%" />-->
            <!--              <span style="color: #C0C0C0;margin-left: 10px;">Api存放路径[src/api]，为空则自动生成路径</span>-->
            <!--            </el-form-item>-->
            <el-form-item label="去表前缀" prop="prefix">
              <el-input v-model="form.prefix" placeholder="默认去除表前缀t_" style="width: 40%" />
              <span style="color: #C0C0C0;margin-left: 10px;">默认去除表前缀t_，可自定义</span>
            </el-form-item>
            <el-form-item label="生成菜单" prop="autoGenerateMenu">
              <el-radio-group :key="form.autoGenerateMenu" v-model="form.autoGenerateMenu" size="mini" style="width: 40%">
                <el-radio-button label="true">是</el-radio-button>
                <el-radio-button label="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="form.autoGenerateMenu === 'true'" label="菜单标题" prop="menuHeadline">
              <el-input v-model="form.menuHeadline" placeholder="目录使用反斜杠分割" style="width: 40%" />
              <span style="color: #C0C0C0;margin-left: 10px;">目录使用反斜杠分割，一级目录/二级目录/菜单 ,最后一个为菜单,以最后一个有效目录为准（如果如果第一个不存在，第二个存在，则第一个会创建，菜单会放到第二个下面）</span>
            </el-form-item>
            <el-form-item v-if="form.autoGenerateMenu === 'true'" label="路由地址" prop="routingAddress">
              <el-input v-model="form.routingAddress" placeholder="和菜单标题保持一致" style="width: 40%" />
              <span style="color: #C0C0C0;margin-left: 10px;">和菜单标题保持一致，1lv/2lv/menu ,上级菜单没有时需要保证一一对应</span>
            </el-form-item>
            <el-form-item v-if="form.autoGenerateMenu === 'true'" label="组件相对路径" prop="componentPath">
              <el-input v-model="form.componentPath" placeholder="views文件夹下的目录需要带index" style="width: 40%" />
              <span style="color: #C0C0C0;margin-left: 10px;" />
            </el-form-item>
            <el-form-item v-if="form.autoGenerateMenu === 'true'" label="管理员权限" prop="adminJurisdiction">
              <el-radio-group v-model="form.adminJurisdiction" size="mini" style="width: 40%">
                <el-radio-button label="true">是</el-radio-button>
                <el-radio-button label="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="是否覆盖" prop="cover">
              <el-radio-group v-model="form.cover" size="mini" style="width: 40%">
                <el-radio-button label="true">是</el-radio-button>
                <el-radio-button label="false">否</el-radio-button>
              </el-radio-group>
              <span style="color: #C0C0C0;margin-left: 10px;">谨防误操作，请慎重选择</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crud from '@/mixins/crud'
import { update, get, modules, _package } from '@/api/generator/genConfig'
import { save, sync, generator } from '@/api/generator/generator'
import { getDicts } from '@/api/system/dict'
export default {
  name: 'GeneratorConfig',
  components: {},
  mixins: [crud],
  data() {
    return {
      activeName: 'first', tableName: '', tableHeight: 550, columnLoading: false, configLoading: false, dicts: [], syncLoading: false, genLoading: false,
      form: { id: null, tableName: '', author: '', pack: '', path: '',
        moduleName: '', autoGenerateMenu: 'true', cover: 'false', apiPath: '',
        prefix: '', apiAlias: null, menuHeadline: '', routingAddress: '',
        relativePath: '', adminJurisdiction: '',
        componentPath: '' },
      rules: {
        author: [
          { required: true, message: '作者不能为空', trigger: 'blur' }
        ],
        pack: [
          { required: true, message: '包路径不能为空', trigger: 'blur' }
        ],
        moduleName: [
          { required: true, message: '包路径不能为空', trigger: 'blur' }
        ],
        path: [
          { required: true, message: '前端路径不能为空', trigger: 'blur' }
        ],
        apiAlias: [
          { required: true, message: '接口名称不能为空', trigger: 'blur' }
        ],
        cover: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        menuHeadline: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        routingAddress: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        autoGenerateMenu: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        relativePath: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        adminJurisdiction: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        componentPath: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      modulesOptions: [],
      packageOptions: [],
      defaultPackageProps: {
        children: 'children',
        label: 'label'
      }
    }
  },
  watch: {
    'form.pack': function(val) {
      this.$refs.tree.filter(val)
    }
  },
  created() {
    this.tableHeight = document.documentElement.clientHeight - 385
    this.tableName = this.$route.params.tableName
    this.$nextTick(() => {
      this.init()
      get(this.tableName).then(data => {
        this.form = data
        this.form.autoGenerateMenu = this.form.autoGenerateMenu.toString()
        this.form.cover = this.form.cover.toString()
        this.form.relativePath = this.form.relativePath.toString()
        this.form.adminJurisdiction = this.form.adminJurisdiction.toString()
        if (!this.form.apiAlias) {
          this.form.apiAlias = this.$route.query.remake
        }
      })
      getDicts().then(data => {
        this.dicts = data
      })
      modules().then(data => {
        this.modulesOptions = []
        data.forEach(e => {
          this.modulesOptions.push({ value: e, label: e })
        })
      })
    })
  },
  methods: {
    changeModule(moduleName) {
      _package({ moduleName: moduleName }).then(data => {
        this.packageOptions = data.children
      })
    },
    packageClick(value) {
      this.form.pack = value.value
    },
    beforeInit() {
      this.url = 'api/generator/columns'
      const tableName = this.tableName
      this.params = { tableName }
      return true
    },
    saveColumnConfig() {
      this.columnLoading = true
      save(this.data).then(res => {
        this.notify('保存成功', 'success')
        this.columnLoading = false
      }).catch(err => {
        this.columnLoading = false
        console.log(err.response.data.message)
      })
    },
    doSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (!((this.form.menuHeadline && this.form.routingAddress) || (!this.form.menuHeadline && !this.form.routingAddress))) {
            this.notify('菜单标题和路由地址成对填写', 'error')
            return
          } else if (this.form.menuHeadline && this.form.routingAddress) {
            const strings = this.form.menuHeadline.split('/')
            const strings1 = this.form.routingAddress.split(`/`)
            if (!(strings.length === strings1.length) && strings.length > 1) {
              this.notify('菜单标题和路由地址不一致可能会造成生成错误', 'error')
              return
            }
          }
          this.configLoading = true
          update(this.form).then(res => {
            this.notify('保存成功', 'success')
            this.form = res
            this.form.cover = this.form.cover.toString()
            this.form.relativePath = this.form.relativePath.toString()
            this.form.adminJurisdiction = this.form.adminJurisdiction.toString()
            this.form.autoGenerateMenu = this.form.autoGenerateMenu.toString()
            this.configLoading = false
          }).catch(err => {
            this.configLoading = false
            console.log(err.response.data.message)
          })
        }
      })
    },
    sync() {
      this.syncLoading = true
      sync([this.tableName]).then(() => {
        this.init()
        this.notify('同步成功', 'success')
        this.syncLoading = false
      }).then(() => {
        this.syncLoading = false
      })
    },
    toGen() {
      this.genLoading = true
      save(this.data).then(res => {
        this.notify('保存成功', 'success')
        // 生成代码
        generator(this.tableName, 0).then(data => {
          this.genLoading = false
          this.notify('生成成功', 'success')
        }).catch(err => {
          this.genLoading = false
          console.log(err.response.data.message)
        })
      }).catch(err => {
        this.genLoading = false
        console.log(err.response.data.message)
      })
    },
    packageFilterNode(value, data) {
      if (!value) return true
      return data.value.indexOf(value) !== -1
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
  .edit-input {
    .el-input__inner {
      border: 1px solid #e5e6e7;
    }
  }
</style>

<style scoped>
 ::v-deep .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
</style>
