<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">
        <search id="header-search" class="right-menu-item" />

        <el-tooltip content="项目文档" effect="dark" placement="bottom">
          <Doc class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-badge :value="MessageData.length">
          <el-tooltip content="消息通知" effect="dark" placement="bottom">
            <el-popover
              placement="bottom"
              width="800"
              trigger="click"
            >
              <el-button slot="reference" icon="el-icon-message-solid" />
              <el-table :data="MessageData">
                <el-table-column prop="briefly" label="消息简要" />
                <el-table-column prop="messageLevel" label="级别">
                  <template slot-scope="scope">
                    {{ dict.label.message_level[scope.row.messageLevel] }}
                  </template>
                </el-table-column>
                <el-table-column prop="messageLabel" label="标签">
                  <template slot-scope="scope">
                    {{ dict.label.message_label[scope.row.messageLabel] }}
                  </template>
                </el-table-column>
                <el-table-column prop="messageState" label="状态">
                  <template slot-scope="scope">
                    {{ dict.label.message_state[scope.row.messageState] }}
                  </template>
                </el-table-column>
                <el-table-column prop="createDate" label="时间" />
                <el-table-column label=" ">
                  <template slot-scope="scope">
                    <el-button type="text" @click="oks(scope.row)">知道了</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-popover>
          </el-tooltip>
        </el-badge>

        <el-tooltip content="全屏缩放" effect="dark" placement="bottom">
          <screenfull id="screenfull" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="布局设置" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

      </template>

      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="user.avatarPath ? user.avatarPath : Avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <span style="display:block;" @click="show = true">
            <el-dropdown-item>
              布局设置
            </el-dropdown-item>
          </span>
          <router-link to="/user/center">
            <el-dropdown-item>
              个人中心
            </el-dropdown-item>
          </router-link>
          <span style="display:block;" @click="open">
            <el-dropdown-item divided>
              退出登录
            </el-dropdown-item>
          </span>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Doc from '@/components/Doc'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import Avatar from '@/assets/images/avatar.png'
import crudMessage from '@/api/messageNotification'
import { getToken } from '@/utils/auth'

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    Doc
  },
  dicts: ['message_level', 'message_label', 'message_state'],
  data() {
    return {
      Avatar: Avatar,
      dialogVisible: false,
      MessageData: [],
      WebSocketParam: {
        head: {
          type: null,
          uid: null,
          token: getToken()
        },
        body: {
          content: null
        }
      }
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'device',
      'user',
      'baseApi'
    ]),
    show: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    }
  },
  created() {
    this.initWebSocket()
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    open() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.logout()
      })
    },
    logout() {
      this.$store.dispatch('LogOut').then(() => {
        location.reload()
      })
    },
    initWebSocket() {
      if (process.env.ENABLE_WEBSOCKET) {
        const wsUri = process.env.VUE_APP_WS_API + '/ws'
        this.websock = new WebSocket(wsUri)
        this.websock.onerror = this.webSocketOnError
        this.websock.onmessage = this.webSocketOnMessage
        this.websock.onopen = this.webSocketOnOpen
        this.websock.onclose = this.webSocketOnClose
      }
    },
    webSocketOnError(e) {
      this.$notify({
        title: '消息通知WebSocket连接发生错误',
        type: 'error',
        duration: 3000
      })
    },
    // 收到消息
    webSocketOnMessage(e) {
      if (e.data === '服务器连接成功！') {
        this.$notify({
          title: '消息通知服务已连接',
          type: 'success',
          duration: 3000
        })
        this.getMessage()
      } else {
        const data = JSON.parse(e.data)
        this.MessageData.push(data)
      }
    },
    // 发送消息
    webSocketSend(agentData) {
      this.WebSocketParam.head.type = 1
      this.WebSocketParam.body.content = agentData
      this.websock.send(JSON.stringify(this.WebSocketParam))
    },
    // 连接成功事件
    webSocketOnOpen() {
      this.WebSocketParam.head.type = 0
      this.WebSocketParam.head.uid = this.user.username
      this.websock.send(JSON.stringify(this.WebSocketParam))
    },
    webSocketOnClose() {
      this.$notify({
        title: '消息通知服务连接断线',
        type: 'error',
        duration: 0
      })
    },
    oks(row) {
      this.webSocketSend(row)
      this.MessageData.forEach((item, index, arr) => {
        if (item === row) {
          arr.splice(index, 1)
        }
      })
    },
    getMessage() {
      crudMessage.getMessage().then((data) => {
        this.MessageData = data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-badge button{
  border: none !important;
  padding: 8px;
  position: relative;
  top: -17px;
}
::v-deep .el-badge button i{
  border: none !important;
  font-size: 18px !important;;
}
::v-deep .el-badge .el-badge__content{
  font-size: 12px !important;
  //transform: scale(0.9);
  text-align: center;
  transform: translate(80%,-50%) scale(0.7) !important;
}

.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
