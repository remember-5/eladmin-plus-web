<template>
  <div>
    <div style="height: 100px">
      safnjasjfjkas
    </div>
    <div style="height: 100px;">
      <div :class="className" :style="{height:height,width:width}" />
    </div>

  </div>

</template>

<script>
import echarts from 'echarts'

require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'
import { getrecordday } from '@/api/taskStatistics'

export default {
  name: 'Table2',
  props: {
    type: {
      type: String,
      default: '',
      required: true
    },
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '10vh'
    },
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      data: {
        agentId: '',
        times: [],
        value: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)]
      },
      channel: '',
      chart: null,
      sidebarElm: null,
      Date: [],
      chartData: {
        channel: [],
        dailyCount: [],
        successCount: [],
        successProbability: [],
        failCount: []
      }
    }
  },
  // 监听index传过来的type字段
  watch: {
    type: {
      handler(newValue, oldValue) {
        this.data.agentId = newValue
        this.relodValue()
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      console.log(111)
      this.relodValue(this.data)
    })
    if (this.autoResize) {
      this.__resizeHandler = debounce(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 100)
      window.addEventListener('resize', this.__resizeHandler)
      window.addEventListener('resize', this.__resizeHandler)
    }

    // 监听侧边栏的变化
    this.sidebarElm = document.getElementsByClassName('sidebar-container')[0]
    this.sidebarElm && this.sidebarElm.addEventListener('transitionend', this.sidebarResizeHandler)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    if (this.autoResize) {
      window.removeEventListener('resize', this.__resizeHandler)
    }

    this.sidebarElm && this.sidebarElm.removeEventListener('transitionend', this.sidebarResizeHandler)

    this.chart.dispose()
    this.chart = null
  },
  methods: {
    relodValue() {
      getrecordday(this.data).then(res => {
        console.log(res)
        for (const resKey in res) {
          this.chartData.dailyCount.push(res[resKey].count)
          this.Date.push(res[resKey].createTime)
        }
        // this.chartData.successCount = res.successCount
        // this.chartData.failCount = res.failCount
        // this.chartData.successProbability = res.successProbability
        // this.Date.push(res.Date)
        this.initChart()
      })
    },
    sidebarResizeHandler(e) {
      if (e.propertyName === 'width') {
        this.__resizeHandler()
      }
    },
    setOptions({ dailyCount } = {}) {
      this.chart.setOption()
    },
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    }
  }
}
</script>

<style scoped>

</style>
