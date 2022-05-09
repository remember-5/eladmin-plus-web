<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container" />
    <el-tabs v-model="activeName" :tabtype="tabtype" @tab-click="handleClick">
      <el-tab-pane label="日推送统计" name="first">
        <child1 :tabtype="tabtype" lazy :type="mytype" :start-time="mystartTime" />
      </el-tab-pane>
      <el-tab-pane label="周推送统计" lazy name="second">
        <child2 :tabtype="tabtype" :type="mytype" :start-time="mystartTime" />
      </el-tab-pane>
      <el-tab-pane label="月推送统计" lazy name="third">
        <child3 :tabtype="tabtype" :type="mytype" :start-time="mystartTime" />
      </el-tab-pane>
      <el-tab-pane label="自定义时间选择" lazy name="fourth">
        <div>
          <el-date-picker
            v-model="time1"
            type="datetimerange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="mychange"
          />
        </div>
        <div ref="ec" :class="className" style="height: 100vh;width: 100vh" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import table1 from '@/views/smsServlet/pushDayChart'
import table2 from '@/views/smsServlet/pushWeekChart'
import table3 from '@/views/smsServlet/pushMonthChart'
import echarts from 'echarts'
import { getcustomTime } from '@/api/taskStatistics'
require('echarts/theme/macarons') // echarts theme
export default {
  name: 'TableChange',
  components: {
    child1: table1,
    child2: table2,
    child3: table3
  },
  data() {
    return {
      activeName: 'first',
      mytype: '1',
      mystartTime: [],
      time: '',
      className: '',
      width: '300px',
      height: '300px',
      radio3: 1,
      time1: '',
      opt: {
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
          data: [],
          axisPointer: {
            type: 'shadow'
          }
        },
        yAxis: [{
          type: 'value',
          name: '发送量',
          axisLabel: {
            formatter: '{value}'
          }
        }],
        legend: {
          data: ['发送量']
        },
        series: [{
          name: '发送量',
          type: 'bar',
          data: [],
          itemStyle: {
            normal: {
              color: '#00BBFF'
            }
          }
        }]
      }
    }
  },
  watch: {
    type: {
      handler(newValue, oldValue) {
        this.mytype = newValue
        // this.initChart()
      }
    },
    startTime: {
      handler(newValue, oldValue) {
        this.mystartTime = newValue
        // this.initChart()
      }
    }
  },
  methods: {
    tabtype() {

    },
    handleClick(tab, event) {
      console.log(tab, event)
    },
    mychange() {
      console.log(this.time1[0])
      getcustomTime(this.time1[0], this.time1[1]).then(res => {
        console.log(res)
        this.opt.xAxis.data = []
        this.opt.series.data = []
        for (const resKey in res) {
          this.opt.xAxis.data.push(res[resKey].createTime)
          this.opt.series[0].data.push(res[resKey].count)
        }
        console.log(this.opt)
        this.chart = echarts.init(this.$refs.ec, 'macarons')
        this.chart.setOption(this.opt)
      })
    }
  }
}
</script>

<style scoped>

</style>
