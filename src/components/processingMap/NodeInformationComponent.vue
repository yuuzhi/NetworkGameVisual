<script>
import ECharts from 'vue-echarts'
import { flowOutNodeOption } from '@/components/processingMap/proecessingMapOptions/Node/flowOutNodeOption'
import { flowInNodeOption } from '@/components/processingMap/proecessingMapOptions/Node/flowInNodeOption'
import { scatterLineNodeOption } from '@/components/processingMap/proecessingMapOptions/Node/scatterLineNodeOption'
import 'ngraph.path'
import ecStat from 'echarts-stat'
import * as echarts from 'echarts'
import createGraph from 'ngraph.graph'
// import dagre from 'dagre'

const nodeType = new Map([[0, 'InteractionPoint'],
  [1, 'Option'],
  [2, 'Input'],
  [3, 'Fork'],
  [4, 'Constraints'],
  [5, 'End'],
  [6, 'Event'],
  [7, 'Feedback'],
  [8, 'Obsolete']])

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
    dargeGraph: Object,
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
      flowInNodeOption: flowInNodeOption,
      scatterLineNodeOption: scatterLineNodeOption
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
        this.freshPieChart()
        this.freshScatter()
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
    // 刷新统计数据
    freshStatistic () {
      let count = 0
      let totalCostTime = 0
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
    },
    // 刷新饼状图
    freshPieChart () {
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
    },
    // 散点图
    freshScatter () {
      console.log('this.InteractionNodeWeight:', this.InteractionNodeWeight)
      this.scatterLineNodeOption.series[0].data = []
      this.scatterLineNodeOption.series[1].data = []
      if (this.nodeCategory === 'End') {
        this.userData.forEach(log => {
          log.nodes.forEach(node => {
            if (node.nodeType === 'InteractionPoint') {
              const graphNodeIndex = this.graph.data.nodes.findIndex(x => node.nodeType === nodeType.get(x.nodeType) && x.index === node.nodeIndex)
              const name = node.nodeType + ' ' + graphNodeIndex
              this.scatterLineNodeOption.series[0].data.push([this.InteractionNodeWeight.get(name), node.costTime])
            }
          })
        })
      }
      // console.log(this.scatterLineNodeOption.series[0].data)
      // 盒须图预处理
      const temp = []
      this.scatterLineNodeOption.series[0].data.forEach(data => {
        if (temp.find(x => x[0] === data[0])) {
          temp[temp.findIndex(x => x[0] === data[0])][1].push(data[1])
        } else {
          temp.push([data[0], []])
          temp[temp.findIndex(x => x[0] === data[0])][1].push(data[1])
        }
      })
      console.log(temp)
      // 设置option的categories
      const categories = []
      temp.forEach(set => {
        categories.push(set[0])
        this.scatterLineNodeOption.series[1].data.push([ecStat.statistics.min(set[1]),
          ecStat.statistics.quantile(set[1], 0.25),
          ecStat.statistics.quantile(set[1], 0.5),
          ecStat.statistics.quantile(set[1], 0.75),
          ecStat.statistics.max(set[1])])
      })
      this.scatterLineNodeOption.xAxis.data = categories
      console.log(this.scatterLineNodeOption)
      this.$nextTick(() => {
        this.$refs.scatterLineChart.setOption(this.scatterLineNodeOption)
      })
    },
  },
  computed: {
    InteractionNodeWeight () { // 获取当前情况下交互点的权重
      const sankeyGraph = createGraph()
      this.sankeyOption.series[0].data.forEach(node => {
        sankeyGraph.addNode(this.sankeyOption.series[0].data.findIndex(x => x === node), node.name)
      })
      this.sankeyOption.series[0].links.forEach(link => {
        sankeyGraph.addLink(this.sankeyOption.series[0].data.findIndex(x => x.name === link.source),
          this.sankeyOption.series[0].data.findIndex(x => x.name === link.target))
      })
      const path = require('ngraph.path')
      const pathFinder = path.aStar(sankeyGraph) // graph is https://github.com/anvaka/ngraph.graph
      if (this.nodeCategory === 'End') {
        // console.log(this.graph.data.nodes)
        const resultpath = []
        this.sankeyOption.series[0].data.forEach(node => {
          const type = node.name.split(' ')[0]
          const index = this.sankeyOption.series[0].data.findIndex(x => x === node)
          if (type === 'InteractionPoint') {
            resultpath.push(pathFinder.find(index, this.sankeyOption.series[0].data.findIndex(x => x.name === this.nodeInfo)))
          }
        })
        const res = new Map()
        resultpath.forEach(path => {
          res.set(path[path.length - 1].data, (1 / (path.length - 1)).toFixed(2))
        })
        console.log(res)
        return res
        // now we can find a path between two nodes:
      }
      // return undefined
    },
    // InteractionNodeCostTime () {
    //   var userCountMap = new Map()
    //   var totalCostTimeMap = new Map()
    //   this.sankeyOption.series[0].data.forEach(node => {
    //     userCountMap.set(node.name, 0)
    //     totalCostTimeMap.set(node.name, 0)
    //   })
    //   this.userData.forEach(log => {
    //     log.nodes.forEach(node => {
    //       if (node.nodeType === 'End' || node.nodeType === 'InteractionPoint') {
    //         var graphNodeIndex = this.graph.data.nodes.findIndex(x => node.nodeType === nodeType.get(x.nodeType) && x.index === node.nodeIndex)
    //         var name = node.nodeType + ' ' + graphNodeIndex
    //         if (userCountMap.has(name)) {
    //           userCountMap.set(name, userCountMap.get(name) + 1)
    //         }
    //       }
    //     })
    //   })
    //   console.log(userCountMap)
    // }
  }
}
</script>

<template>
  <el-text style="font-size: xx-large">节点信息</el-text>
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
        <vchart style="height: 15vh;width: auto" :option="flowInNodeOption" ref="flowInChart" :autoresize="true"></vchart>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <template #header>
          <el-text>流出分布情况</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="flowOutNodeOption" ref="flowOutChart" :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col>
      <el-card>
        <template #header>
          <el-text>当前结局下“选择结点权重-决策耗时”散点回归图</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="scatterLineNodeOption" ref="scatterLineChart" :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
