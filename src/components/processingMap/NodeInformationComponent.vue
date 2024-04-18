<script>
import ECharts from 'vue-echarts'
import { flowOutNodeOption } from '@/components/processingMap/proecessingMapOptions/Node/flowOutNodeOption'
import { flowInNodeOption } from '@/components/processingMap/proecessingMapOptions/Node/flowInNodeOption'
import * as echarts from 'echarts'

export default {
  name: 'NodeInformationComponent',
  components: {
    vchart: ECharts
  },
  props: {
    graph: Object,
    graphData: Object,
    sankeyOption: Object,
    userData: Array,
    nodeInfo: String
  },
  data () {
    return {
      // 数据
      userCount: 0,
      costTime: 0,
      nodeCategory: null,
      nodeIndex: null,
      // 配置项
      flowOutNodeOption: flowOutNodeOption,
      flowInNodeOption: flowInNodeOption
    }
  },
  mounted () {
  },
  watch: {
    nodeInfo: {
      handler () {
        this.nodeCategory = this.nodeInfo.split(' ')[0]
        this.nodeIndex = this.nodeInfo.split(' ')[1]
        // 统计数据
        this.freshStatistic()
        // 图表数据
        console.log(this.sankeyOption)
        // console.log(this.sankeyOption[0])
        this.flowInNodeOption.series.data = []
        this.flowOutNodeOption.series.data = []
        this.sankeyOption.series[0].links.forEach(link => {
          if (link.target === this.nodeInfo) {
            if (this.flowInNodeOption.series.data.find(x => x.name === link.source) === undefined) {
              this.flowInNodeOption.series.data.push({
                value: this.sankeyOption.series[0].links.find(x => x.source === link.source && x.target === this.nodeInfo).value,
                name: link.source
              })
            }
          }
          if (link.source === this.nodeInfo) {
            if (this.flowOutNodeOption.series.data.find(x => x.name === link.target) === undefined) {
              this.flowOutNodeOption.series.data.push({
                value: this.sankeyOption.series[0].links.find(x => x.target === link.target && x.source === this.nodeInfo).value,
                name: link.target
              })
              console.log(this.sankeyOption.series[0].links.find(x => x.target === link.target && x.source === this.nodeInfo))
            }
          }
        })
        this.userData.forEach(log => {
          log.nodes.forEach(node => {

          })
        })
        // 刷新绘制
        // this.$refs.flowInChart.setOption(this.flowInNodeOption)
        // this.$refs.flowOutChart.setOption(this.flowOutNodeOption)
      },
      immediate: true
    },
    sankeyOption: {
      handler () {

      },
      immediate: true
    },

  },
  methods: {
    formatPercentage (value) {
      return (value * 100).toFixed(2) + '%'
    },
    freshStatistic () {
      var count = 0
      var totalCostTime = 0
      this.userData.forEach(log => {
        log.nodes.forEach(node => {
          // console.log(node)
          // 经历到结点的人数
          if (node.nodeType === this.nodeCategory) {
            if (node.nodeIndex === this.graph.data.nodes[this.nodeInfo.split(' ')[1]].index) {
              // console.log(node.nodeIndex === this.graph.data.nodes[this.nodeInfo.split(' ')[1]].index)
              count++
            }
          }
        })
        // 到结局的耗时
        if (this.nodeCategory === 'End') {
          if (log.nodes[log.nodes.length - 1].nodeIndex === this.graph.data.nodes[this.nodeInfo.split(' ')[1]].index) {
            log.nodes.forEach(node => {
              if (node.nodeType === 'InteractionPoint') {
                totalCostTime += node.costTime
              }
            })
          }
        }
        if (this.nodeCategory === 'InteractionPoint') {
          log.nodes.forEach(node => {
            if (node.nodeType === 'InteractionPoint' && node.nodeIndex === this.graph.data.nodes[this.nodeInfo.split(' ')[1]].index) {
              totalCostTime += node.costTime
            }
          })
        }
      })
      // 更新数据
      this.userCount = count
      // console.log(this.nodeCategory, this.nodeIndex, totalCostTime)
      this.costTime = totalCostTime / count
    }
  }
}
</script>

<template>
  <el-text style="font-size: xxx-large">节点信息</el-text>
  <el-divider/>
  <el-descriptions border :size="'large'">
    <el-descriptions-item label="节点类型" label-align="center" align="center">{{ this.nodeCategory }}
    </el-descriptions-item>
    <el-descriptions-item label="节点序号" label-align="center" align="center">{{ this.nodeIndex }}
    </el-descriptions-item>
  </el-descriptions>
  <el-divider/>
  <el-row style="text-align: center">
    <el-col :span="8">
      <el-statistic title="体验人数" :value="userCount">
        <template #suffix>人</template>
      </el-statistic>
    </el-col>
    <el-col :span="8">
      <el-statistic title="体验人数占比"
                    :formatter="formatPercentage"
                    precision="2"
                    :value="userCount/this.$store.state.totalUserCount"></el-statistic>
    </el-col>
    <el-col :span="8">
      <el-statistic title="平均决策耗时"
                    precision="2"
                    :value="costTime"></el-statistic>
    </el-col>
  </el-row>
  <el-divider/>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <template #header>
          <el-text>流入分布情况</el-text>
        </template>
        <vchart style="height: 20vh;width: auto" :option="flowInNodeOption" ref="flowInChart"></vchart>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <template #header>
          <el-text>流出分布情况</el-text>
        </template>
        <vchart style="height: 20vh;width: auto" :option="flowOutNodeOption" ref="flowOutChart"></vchart>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col>
      <el-card>
        <template #header>
          <el-text>当前结局下“选择结点权重-决策耗时”散点回归图</el-text>
        </template>
        <vchart style="height: 20vh;width: auto" :option="costTimeOption" ref="vchart"></vchart>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
