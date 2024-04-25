<script>
import ECharts from 'vue-echarts'
import { flowOutNodeOption } from '@/components/processingMap/proecessingMapOptions/Node/flowOutNodeOption'
import { flowInNodeOption } from '@/components/processingMap/proecessingMapOptions/Node/flowInNodeOption'
import { scatterLineNodeOption } from '@/components/processingMap/proecessingMapOptions/Node/scatterLineNodeOption'
import { parallelAxisNodeOption } from '@/components/processingMap/proecessingMapOptions/Node/parallelAxisNodeOption'
import path from 'ngraph.path'
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
      scatterLineNodeOption: scatterLineNodeOption,
      parallelAxisNodeOption: parallelAxisNodeOption,
      // 状态
      isEndNode: false,
      isIPNode: false
    }
  },
  mounted () {
  },
  watch: {
    nodeInfo: {
      handler () {
        this.nodeCategory = this.nodeInfo.split(' ')[0]
        this.nodeIndex = this.nodeInfo.split(' ')[1]
        // 设置状态
        this.changeState()
        // 统计数据
        this.freshStatistic()
        // 图表数据
        this.freshPieChart()
        this.freshScatter()
        this.freshParallel()
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
    changeState () {
      this.isEndNode = false
      this.isIPNode = false
      switch (this.nodeCategory) {
        case 'End':
          this.isEndNode = true
          break
        case 'InteractionPoint':
          this.isIPNode = true
          break
        default:
          break
      }
    },
    // 刷新统计数据
    freshStatistic () {
      let count = 0
      let totalCostTime = 0
      // TODO
      // console.log('graphData', this.graph)
      // console.log('log', this.userData)
      this.userData.forEach(log => {
        log.nodes.forEach(node => {
          // // console.log(node)
          // 经历到结点的人数
          if (node.nodeType === this.nodeCategory) {
            if (node.nodeIndex === this.graph.data.nodes[this.nodeInfo.split(' ')[1]].index) {
              // // console.log(node.nodeIndex === this.graph.data.nodes[this.nodeInfo.split(' ')[1]].index)
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
      // // console.log(this.nodeCategory, this.nodeIndex, totalCostTime)
      this.costTime = totalCostTime / count
    },
    // 刷新饼状图
    freshPieChart () {
      // console.log(this.sankeyOption)
      // // console.log(this.sankeyOption[0])
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
            // console.log(this.sankeyOption.series[0].links.find(x => x.target === link.target && x.source === this.nodeInfo))
          }
        }
      })
    },
    // 散点图
    freshScatter () {
      if (this.nodeCategory !== 'End') {
        return undefined
      }
      // console.log('this.InteractionNodeWeight:', this.InteractionNodeWeight)
      this.scatterLineNodeOption.series[0].data = []
      this.scatterLineNodeOption.series[1].data = []
      this.scatterLineNodeOption.series[2].data = []
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
        // // console.log(this.scatterLineNodeOption.series[0].data)
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
        // console.log(temp)
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
        // 设置回归的参数
        const regressionData = []
        this.scatterLineNodeOption.series[1].data.forEach(data => {
          // 添加中位数
          regressionData.push([Number(categories[this.scatterLineNodeOption.series[1].data.findIndex(x => x === data)]), data[2]])
        })

        const myRegression = ecStat.regression('linear', regressionData, null)
        // console.log(' myRegression', myRegression)
        myRegression.points.forEach(point => {
          this.scatterLineNodeOption.series[2].data.push(point[1])
        })
        // 重新绘制
        // console.log(this.scatterLineNodeOption)
        this.$nextTick(() => {
          this.$refs.scatterLineChart.setOption(this.scatterLineNodeOption)
        })
      }
    },
    freshParallel () {
      const data = this.ParallelData
      if (data !== undefined) {
        this.parallelAxisNodeOption.series.data = data
        console.log(this.scatterLineNodeOption)
        this.$nextTick(() => {
          this.$refs.parallelAxisChart.setOption(this.parallelAxisNodeOption)
        })
      }
    }
  },
  computed: {
    InteractionNodeWeight () { // 获取当前情况下交互点的权重
      // 建图
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
      // 如果当前选中的是End
      if (this.nodeCategory === 'End') {
        // // console.log(this.graph.data.nodes)
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
        // console.log(res)
        return res
      }
      return undefined
    },
    ParallelData () {
      if (this.nodeCategory !== 'InteractionPoint') {
        return undefined
      }
      // console.log(this.userData)
      const res = []
      // 建图
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
      // 遍历所有log
      this.userData.forEach(log => {
        // 找到end节点
        const endNode = log.nodes[log.nodes.length - 1]
        const endName = endNode.nodeType + ' ' + this.graph.data.nodes.findIndex(x => x.nodeType === 5 && x.index === endNode.nodeIndex)
        // console.log(endName)
        const resultpath = []
        this.sankeyOption.series[0].data.forEach(node => {
          const type = node.name.split(' ')[0]
          const index = this.sankeyOption.series[0].data.findIndex(x => x === node)
          if (type === 'InteractionPoint') {
            resultpath.push(pathFinder.find(index, this.sankeyOption.series[0].data.findIndex(x => x.name === endName)))
          }
        })
        const weight = new Map()
        resultpath.forEach(path => {
          weight.set(path[path.length - 1].data, (1 / (path.length - 1)).toFixed(2))
        })
        // console.log('weight', weight)
        // 算出三个点的权值
        const currentIndex = log.nodes.findIndex(x => x.nodeType === 'InteractionPoint' && x.nodeIndex === this.graph.data.nodes[this.nodeIndex].index)
        if (currentIndex !== -1) {
          // console.log('currentIndex', currentIndex)
          let lastIndex, nextIndex, lastWeight, nextWeight
          const currentWeight = weight.get('InteractionPoint' + ' ' + this.graph.data.nodes.findIndex(x => x.nodeType === 0 && x.index === log.nodes[currentIndex].nodeIndex))
          for (let i = currentIndex - 1; i >= 0; i--) {
            if (log.nodes[i].nodeType === 'InteractionPoint') {
              lastIndex = i
              lastWeight = weight.get('InteractionPoint' + ' ' + this.graph.data.nodes.findIndex(x => x.nodeType === 0 && x.index === log.nodes[lastIndex].nodeIndex))
              break
            }
          }
          for (let i = currentIndex + 1; i < log.nodes.length; i++) {
            if (log.nodes[i].nodeType === 'InteractionPoint') {
              nextIndex = i
              nextWeight = weight.get('InteractionPoint' + ' ' + this.graph.data.nodes.findIndex(x => x.nodeType === 0 && x.index === log.nodes[nextIndex].nodeIndex))
              break
            }
          }
          const currentIndexes = [lastIndex, currentIndex, nextIndex]
          const currentWeights = [lastWeight, currentWeight, nextWeight]
          // console.log(currentWeights)
          // 权值乘以事件
          const weightTime = []
          for (let i = 0; i < 3; i++) {
            if (currentWeights[i] !== undefined)weightTime.push(log.nodes[currentIndexes[i]].costTime * currentWeights[i])
            else weightTime.push(0)
          }
          // console.log('weightTime', weightTime)
          // 添加进res数组
          res.push(weightTime)
        }
      })
      // 返回res
      // console.log(res)
      return res
    }
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
        <vchart style="height: 15vh;width: auto" :option="flowInNodeOption" ref="flowInChart"
                :autoresize="true"></vchart>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <template #header>
          <el-text>流出分布情况</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="flowOutNodeOption" ref="flowOutChart"
                :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col>
      <el-card v-if="isEndNode">
        <template #header>
          <el-text>当前结局下“选择结点权重-决策耗时”散点回归图</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="scatterLineNodeOption" ref="scatterLineChart"
                :autoresize="true"></vchart>
      </el-card>
      <el-card v-if="isIPNode">
        <template #header>
          <el-text>“前一节点-当前节点-后一节点”加权平均耗时的平行坐标图</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="parallelAxisNodeOption" ref="parallelAxisChart"
                :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
