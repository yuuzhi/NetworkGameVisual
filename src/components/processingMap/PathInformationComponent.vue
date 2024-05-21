<script>
import ECharts from 'vue-echarts'
import { scatterLinePathOption } from '@/components/processingMap/proecessingMapOptions/Path/scatterLinePathOption'
import ecStat from 'echarts-stat'
import createGraph from 'ngraph.graph'
import path from 'ngraph.path'

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
  name: 'PathInformationComponent',
  components: {
    vchart: ECharts
  },
  data () {
    return {
      // 数据
      userCount: 0,
      costTime: 0,
      nodeCategory: null,
      nodeIndex: null,
      // 配置项
      scatterLinePathOption: scatterLinePathOption,
    }
  },
  props: {
    graph: Object,
    graphData: Object,
    sankeyOption: Object,
    userData: Array,
    nodes: Object,
    selectedList: Array,
    dagOption: Object
  },
  watch: {
    selectedList: {
      handler () {
        // console.log(this.selectedList)
      },
      immediate: true
    },
    dagOption: {
      handler () {
        // console.log(this.dagOption)
      },
      immediate: true
    },
    userData: {
      handler () {
        console.log(this.selectedList)
        console.log(this.userData)
        this.userData.forEach(log => {
          let isPath = true
          // 如果log里的结点存在任意一个不属于被选择的列表里
          log.nodes.forEach(x => {
            if (x.nodeType === 'InteractionPoint' || x.nodeType === 'End') {
              // TODO 下面这个if函数没写完，傻逼学校
              if (this.selectedList.findIndex(t => nodeType.get(this.graph.data.nodes[t.dataIndexInside].nodeType) === x.nodeType &&
                  this.graph.data.nodes[t.dataIndexInside].index === x.nodeIndex) === -1) {
                isPath = false
              }
            }
          })
          if (isPath) {
            this.userCount++
            log.nodes.forEach(x => { this.costTime += x.costTime })
          }
        })
        this.freshScatter()
      },
      immediate: true
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
      // 获取记录里的End结点
      const endNode = this.selectedList.find(t => nodeType.get(this.graph.data.nodes[t.dataIndexInside].nodeType) === 'End')
      console.log(endNode)
      // 如果当前选中的是End
      if (endNode !== undefined) {
        // // console.log(this.graph.data.nodes)
        const resultpath = []
        this.sankeyOption.series[0].data.forEach(node => {
          const type = node.name.split(' ')[0]
          const index = this.sankeyOption.series[0].data.findIndex(x => x === node)
          if (type === 'InteractionPoint') {
            resultpath.push(pathFinder.find(index, this.sankeyOption.series[0].data.findIndex(x => x.name === 'End' + ' ' + endNode.dataIndexInside)))
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
  },
  methods: {
    formatPercentage (value) {
      return (value * 100).toFixed(2) + '%'
    },
    freshScatter () {
      console.log('this.InteractionNodeWeight:', this.InteractionNodeWeight)
      this.scatterLinePathOption.series[0].data = []
      this.scatterLinePathOption.series[1].data = []
      this.scatterLinePathOption.series[2].data = []
      // 获取记录里的End结点
      const endNode = this.selectedList.find(t => nodeType.get(this.graph.data.nodes[t.dataIndexInside].nodeType) === 'End')
      if (endNode !== undefined) {
        this.userData.forEach(log => {
          log.nodes.forEach(node => {
            if (node.nodeType === 'InteractionPoint' && this.selectedList.findIndex(t => nodeType.get(this.graph.data.nodes[t.dataIndexInside].nodeType) === node.nodeType &&
                this.graph.data.nodes[t.dataIndexInside].index === node.nodeIndex) === -1) {
              const graphNodeIndex = this.graph.data.nodes.findIndex(x => node.nodeType === nodeType.get(x.nodeType) && x.index === node.nodeIndex)
              const name = node.nodeType + ' ' + graphNodeIndex
              this.scatterLinePathOption.series[0].data.push([this.InteractionNodeWeight.get(name), node.costTime])
            }
          })
        })
        console.log(this.scatterLinePathOption.series[0].data)
        // 盒须图预处理
        const temp = []
        this.scatterLinePathOption.series[0].data.forEach(data => {
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
          this.scatterLinePathOption.series[1].data.push([ecStat.statistics.min(set[1]),
            ecStat.statistics.quantile(set[1], 0.25),
            ecStat.statistics.quantile(set[1], 0.5),
            ecStat.statistics.quantile(set[1], 0.75),
            ecStat.statistics.max(set[1])])
        })
        this.scatterLinePathOption.xAxis.data = categories
        // 设置回归的参数
        const regressionData = []
        this.scatterLinePathOption.series[1].data.forEach(data => {
          // 添加中位数
          regressionData.push([Number(categories[this.scatterLinePathOption.series[1].data.findIndex(x => x === data)]), data[2]])
        })

        const myRegression = ecStat.regression('linear', regressionData, null)
        // console.log(' myRegression', myRegression)
        myRegression.points.forEach(point => {
          this.scatterLinePathOption.series[2].data.push(point[1])
        })
        // 重新绘制
        // console.log(this.scatterLinePathOption)
        this.$nextTick(() => {
          this.$refs.scatterLineChart.setOption(this.scatterLinePathOption)
        })
      }
    },
  }
}
</script>

<template>
  <el-text style="font-size: xx-large">路径信息</el-text>
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
                    :value="costTime/userCount"></el-statistic>
    </el-col>
  </el-row>
  <el-divider/>
    <el-card>
      <template #header>
        <el-text>路径节点</el-text>
      </template>
      <el-scrollbar height="20vh" >
        <div>
          <p v-for="(item) in selectedList" :key="item.dataIndexInside" class="scrollbar-demo-item">
            {{ dagOption.series[0].data[item.dataIndexInside].name }}
          </p>
        </div>
      </el-scrollbar>
    </el-card>
  <el-divider/>
  <el-row :gutter="20">
    <el-col>
      <el-card>
        <template #header>
          <el-text>“路径结点权重-决策耗时”散点回归图</el-text>
        </template>
        <vchart style="height: 19vh;width: auto" :option="scatterLinePathOption" ref="scatterLineChart"
                :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  //border: gray solid 1px;
  background: #e9eeec;
  color:  #364f6b;
}
</style>
