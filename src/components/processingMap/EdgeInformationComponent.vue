<script>
import ECharts from 'vue-echarts'
import { parallelAxisEdgeOption } from '@/components/processingMap/proecessingMapOptions/Edge/parallelAxisEdgeOption'
import createGraph from 'ngraph.graph'
import path from 'ngraph.path'
import { scatterLineEdgeOption } from '@/components/processingMap/proecessingMapOptions/Edge/scatterLineEdgeOption'
import ecStat from 'echarts-stat'

export default {
  name: 'EdgeInformationComponent',
  components: {
    vchart: ECharts
  },
  props: {
    graph: Object,
    graphData: Object,
    sankeyOption: Object,
    userData: Array,
    dargeGraph: Object,
    edgeInfo: null,
  },
  data () {
    return {
      // 数据
      userCount: 0,
      costTime: 0,
      startNode: null,
      endNode: null,
      // 状态
      isEnd: false,
      // 配置项
      parallelAxisEdgeOption: parallelAxisEdgeOption,
      scatterLineEdgeOption: scatterLineEdgeOption
    }
  },
  watch: {
    edgeInfo: {
      handler () {
        // console.log(this.edgeInfo)
        this.startNode = {
          nodeCategory: this.edgeInfo.source.split(' ')[0],
          nodeIndex: this.edgeInfo.source.split(' ')[1]
        }
        this.endNode = {
          nodeCategory: this.edgeInfo.target.split(' ')[0],
          nodeIndex: this.edgeInfo.target.split(' ')[1]
        }
        this.userCount = this.edgeInfo.value
        // // 设置状态
        // this.changeState()
        // // 统计数据
        this.freshStatistic()
        // // 图表数据
        this.freshParallel()
        this.freshScatter()
        // // 刷新绘制
      },
      immediate: true
    },
  },
  methods: {
    formatPercentage (value) {
      return (value * 100).toFixed(2) + '%'
    },
    freshStatistic () {
      // 总耗时
      let totalCostTime = 0
      // console.log(this.userData)
      this.userData.forEach(log => {
        const temp1 = log.nodes.findIndex(x => x.nodeType === this.startNode.nodeCategory && x.nodeIndex === this.graph.data.nodes[this.startNode.nodeIndex].index)
        const temp2 = log.nodes.findIndex(x => x.nodeType === this.endNode.nodeCategory && x.nodeIndex === this.graph.data.nodes[this.endNode.nodeIndex].index)
        // // console.log('temp1,temp2', temp1, temp2)
        if (temp1 !== -1 && temp2 !== -1) {
          totalCostTime += log.nodes[temp1].costTime
        }
      })
      this.costTime = totalCostTime / this.userCount
    },
    freshParallel () {
      this.parallelAxisEdgeOption.series.data = []
      const data = this.ParallelData
      if (data !== undefined) {
        this.parallelAxisEdgeOption.series.data = data
        // // console.log(this.parallelAxisEdgeOption)
        this.$nextTick(() => {
          this.$refs.parallelAxisChart.setOption(this.parallelAxisEdgeOption)
        })
      }
    },
    freshScatter () {
      const scatterData = this.CurrentWeightAndIndex
      this.scatterLineEdgeOption.series[0].data = []
      this.scatterLineEdgeOption.series[1].data = []
      this.scatterLineEdgeOption.series[2].data = []
      // console.log(scatterData)
      if (scatterData !== undefined) {
        const categories = []
        // 散点图
        this.scatterLineEdgeOption.series[0].data = scatterData
        // 盒须图预处理
        const temp = []
        scatterData.forEach(data => {
          if (temp.find(x => x[0] === data[0])) {
            temp[temp.findIndex(x => x[0] === data[0])][1].push(data[1])
          } else {
            temp.push([data[0], []])
            temp[temp.findIndex(x => x[0] === data[0])][1].push(data[1])
          }
        })
        temp.forEach(set => {
          categories.push(set[0])
          this.scatterLineEdgeOption.series[1].data.push([ecStat.statistics.min(set[1]),
            ecStat.statistics.quantile(set[1], 0.25),
            ecStat.statistics.quantile(set[1], 0.5),
            ecStat.statistics.quantile(set[1], 0.75),
            ecStat.statistics.max(set[1])])
        })
        categories.sort(function (a, b) { return a - b })
        this.scatterLineEdgeOption.xAxis.data = categories
        // 设置回归的参数
        const regressionData = []
        this.scatterLineEdgeOption.series[1].data.forEach(data => {
          // 添加中位数
          regressionData.push([Number(categories[this.scatterLineEdgeOption.series[1].data.findIndex(x => x === data)]), data[2]])
        })

        const myRegression = ecStat.regression('linear', regressionData, null)
        // // console.log(' myRegression', myRegression)
        myRegression.points.forEach(point => {
          this.scatterLineEdgeOption.series[2].data.push(point[1])
        })
        // console.log('this.scatterLineEdgeOption', this.scatterLineEdgeOption)
        // 重新绘制
        this.$nextTick(() => {
          this.$refs.scatterLineChart.setOption(this.scatterLineEdgeOption)
        })
      }
    }
  },
  computed: {
    CurrentWeightAndIndex () {
      if (this.endNode.nodeCategory !== 'InteractionPoint') {
        this.isEnd = true
        return undefined
      }
      this.isEnd = false
      // // console.log(this.userData)
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
        // // console.log(endName)
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
        // // console.log('weight', weight)
        // 算出2个点的权值
        const startIndex = log.nodes.findIndex(x => x.nodeType === this.startNode.nodeCategory && x.nodeIndex === this.graph.data.nodes[this.startNode.nodeIndex].index)
        const endIndex = log.nodes.findIndex(x => x.nodeType === this.endNode.nodeCategory && x.nodeIndex === this.graph.data.nodes[this.endNode.nodeIndex].index)
        if (startIndex !== -1 && endIndex !== -1) {
          let lastWeight, nextWeight
          const startWeight = weight.get('InteractionPoint' + ' ' + this.graph.data.nodes.findIndex(x => x.nodeType === 0 && x.index === log.nodes[startIndex].nodeIndex))
          const endWeight = weight.get('InteractionPoint' + ' ' + this.graph.data.nodes.findIndex(x => x.nodeType === 0 && x.index === log.nodes[endIndex].nodeIndex))
          const currentIndexes = [startIndex, endIndex]
          const currentWeights = [startWeight, endWeight]
          // // console.log(currentWeights)
          // 权值乘以事件
          const weightTime = []
          for (let i = 0; i < 2; i++) {
            if (currentWeights[i] !== undefined) res.push([Number(currentWeights[i]), log.nodes[currentIndexes[i]].costTime])
          }
          // // console.log('weightTime', weightTime)
        }
      })
      // 返回res
      // console.log(res)
      return res
    },
    ParallelData () {
      if (this.endNode.nodeCategory !== 'InteractionPoint') {
        this.isEnd = true
        return undefined
      }
      this.isEnd = false
      // // console.log(this.userData)
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
        // // console.log(endName)
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
        // // console.log('weight', weight)
        // 算出2个点的权值
        const startIndex = log.nodes.findIndex(x => x.nodeType === this.startNode.nodeCategory && x.nodeIndex === this.graph.data.nodes[this.startNode.nodeIndex].index)
        const endIndex = log.nodes.findIndex(x => x.nodeType === this.endNode.nodeCategory && x.nodeIndex === this.graph.data.nodes[this.endNode.nodeIndex].index)
        if (startIndex !== -1 && endIndex !== -1) {
          const startWeight = weight.get('InteractionPoint' + ' ' + this.graph.data.nodes.findIndex(x => x.nodeType === 0 && x.index === log.nodes[startIndex].nodeIndex))
          const endWeight = weight.get('InteractionPoint' + ' ' + this.graph.data.nodes.findIndex(x => x.nodeType === 0 && x.index === log.nodes[endIndex].nodeIndex))
          const currentIndexes = [startIndex, endIndex]
          const currentWeights = [startWeight, endWeight]
          // // console.log(currentWeights)
          // 权值乘以事件
          const weightTime = []
          for (let i = 0; i < 2; i++) {
            if (currentWeights[i] !== undefined) weightTime.push(log.nodes[currentIndexes[i]].costTime * currentWeights[i])
            else weightTime.push(0)
          }
          // // console.log('weightTime', weightTime)
          // 添加进res数组
          res.push(weightTime)
        }
      })
      // 返回res
      // // console.log(res)
      return res
    }
  }
}
</script>

<template>
  <el-text style="font-size: xx-large">边信息</el-text>
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
  <el-descriptions border :size="'large'">
    <el-descriptions-item width="120" label="起点节点类型" label-align="center" align="center">
      {{ this.startNode.nodeCategory }}
    </el-descriptions-item>
    <el-descriptions-item width="120" label="起点节点序号" label-align="center" align="center">
      {{ this.startNode.nodeIndex }}
    </el-descriptions-item>
  </el-descriptions>
  <el-descriptions border :size="'large'">
    <el-descriptions-item width="120" label="终点节点类型" label-align="center" align="center">
      {{ this.endNode.nodeCategory }}
    </el-descriptions-item>
    <el-descriptions-item width="120" label="终点节点序号" label-align="center" align="center">{{
        this.endNode.nodeIndex
      }}
    </el-descriptions-item>
  </el-descriptions>
  <el-divider/>
  <el-row :gutter="20">
    <el-col>
      <el-card>
        <template #header>
          <el-text>“起点节点-终点节点”加权平均考虑耗时的平行坐标图</el-text>
        </template>
        <el-empty v-if="isEnd" :image-size="80"  style="height: 12vh;width: auto" description="结局节点无权重" />
        <vchart v-if="!isEnd" style="height: 12vh;width: auto" :option="parallelAxisEdgeOption" ref="parallelAxisChart"
                :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col>

      <el-card>
        <template #header>
          <el-text>起点节点和终点节点的“结点权重-决策耗时”散点回归图</el-text>
        </template>
        <el-empty v-if="isEnd" :image-size="80" style="height: 14vh;width: auto" description="结局节点无权重" />
        <vchart v-if="!isEnd" style="height: 14vh;width: auto" :option="scatterLineEdgeOption" ref="scatterLineChart"
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
