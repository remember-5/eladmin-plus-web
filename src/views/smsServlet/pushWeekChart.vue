<template>
  <div :class="className" :style="{height:height,width:width}" />

</template>

<script>
import echarts from 'echarts'

require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'
import { getrecordweek } from '@/api/taskStatistics'

export default {
  name: 'Table1',
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
      default: '500px'
    },
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      /* type:'',
      startTime:[],*/
      data: {
        agentId: '',
        times: []
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
    },
    startTime: {
      handler(newValue, oldValue) {
        this.data.times = newValue
        if (this.data.times != null) {
          this.relodValue()
        } else {
          this.data.times = ''
          this.relodValue()
        }
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      console.log(333)
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
      getrecordweek(this.data).then(res => {
        console.log(res)
        for (const resKey in res) {
          this.chartData.dailyCount.push(res[resKey].count)
          this.Date.push(res[resKey].createTime + '周')
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
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {},
        xAxis: {
          type: 'category',
          data: this.Date,
          axisPointer: {
            type: 'shadow'
          }
        },
        yAxis: [{
          type: 'value',
          name: '当日发送量',
          axisLabel: {
            formatter: '{value}'
          }
        }],
        legend: {
          data: ['当日发送量']
        },
        series: [{
          name: '当日发送量',
          type: 'bar',
          data: this.chartData.dailyCount,
          itemStyle: {
            normal: {
              color: '#00BBFF'
            }
          }
        }]
      })
    },
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    }
  }
}
</script>

