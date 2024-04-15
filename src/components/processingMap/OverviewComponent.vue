<script>
import ECharts from 'vue-echarts'
import { nodeOverviewOption } from '@/components/processingMap/proecessingMapOptions/Overview/nodeOverviewOption'
import {
  costTimeOverviewOption
} from '@/components/processingMap/proecessingMapOptions/Overview/costTimeOverviewOption'
import {
  dateHeatMapOverviewOption
} from '@/components/processingMap/proecessingMapOptions/Overview/dateHeatMapOverviewOption'
import { endOverviewOption } from '@/components/processingMap/proecessingMapOptions/Overview/endOverviewOption'
import * as echarts from 'echarts'

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
  name: 'OverviewComponent',
  components: {
    vchart: ECharts
  },
  data () {
    return {
      nodeOverviewOption: nodeOverviewOption,
      costTimeOption: costTimeOverviewOption,
      dateHeatMapOption: dateHeatMapOverviewOption,
      endOverviewOption: endOverviewOption,
      // 展示用数据
      nodeNum: 0,
      totalCostTime: 0
    }
  },
  props: {
    graph: Object,
    graphData: Object,
    userData: Array
  },
  watch: {
    graph () {
      console.log('OverView', this.graph)
      this.nodeNum = this.graph.data.nodes.length
      this.GetNodeCategoryNum()
    },
    userData () {
      // 统计数据
      this.userData.forEach(log => {
        log.nodes.forEach(node => {
          if (node.nodeType === 'InteractionPoint') {
            this.totalCostTime += node.costTime
          }
          // 历经结局数量
          if (node.nodeType === 'End') {
            // 经历到结局的人数
            if (this.endOverviewOption.series.data.find(x => x.name === node.nodeType + node.nodeIndex) !== undefined) {
              this.endOverviewOption.series.data.find(x => x.name === node.nodeType + node.nodeIndex).value++
            } else {
              endOverviewOption.series.data.push({
                value: 1,
                name: node.nodeType + node.nodeIndex
              })
            }
            // 到结局的耗时
            if (this.costTimeOption.xAxis[0].data.find(x => x === node.nodeType + node.nodeIndex) !== undefined) {
              this.costTimeOption.series[0].data[
                this.costTimeOption.xAxis[0].data.findIndex(x => x === node.nodeType + node.nodeIndex)] += node.costTime
            } else {
              this.costTimeOption.xAxis[0].data.push(node.nodeType + node.nodeIndex)
              this.costTimeOption.series[0].data.push(node.costTime)
            }
          }
        })
        // 热力图
        var day = echarts.format.formatTime('yyyy-MM-dd', log.logID * 1000)
        if (this.dateHeatMapOption.series.data.find(x => x[0] === day) !== undefined) {
          this.dateHeatMapOption.series.data.find(x => x[0] === day)[1]++
        } else {
          this.dateHeatMapOption.series.data.push([day, 1])
        }
      })
      // 热力图重新设置最大范围
      this.dateHeatMapOption.visualMap.max = this.GetDateMaxNum()
      // 平均时长求值
      this.costTimeOption.series[0].data.forEach(e => {
        var index = this.costTimeOption.series[0].data.findIndex(x => x === e)
        this.costTimeOption.series[0].data[index] /= this.endOverviewOption.series.data.find(x => x.name ===
          this.costTimeOption.xAxis[0].data[index]).value
      })
      // 刷新绘制
      this.$refs.endPieMap.setOption(this.endOverviewOption)
      this.$refs.endCostMap.setOption(this.costTimeOption)
    }
  },
  methods: {
    GetDateMaxNum () {
      var dataMax = 0
      this.dateHeatMapOption.series.data.forEach(e => {
        if (e[1] > dataMax) dataMax = e[1]
      })
      return dataMax
    },
    GetNodeCategoryNum () {
      this.graph.data.nodes.forEach(node => {
        if (this.nodeOverviewOption.series.data.find(x => x.name === nodeType.get(node.nodeType)) !== undefined) {
          this.nodeOverviewOption.series.data.find(x => x.name === nodeType.get(node.nodeType)).value++
        } else {
          nodeOverviewOption.series.data.push({
            value: 1,
            name: nodeType.get(node.nodeType)
          })
        }
      })
      console.log('结点种类和数量', nodeOverviewOption.series.data)
      this.$refs.nodePieMap.setOption(this.nodeOverviewOption)
    },
  }
}
</script>

<template>
  <el-text style="font-size: xxx-large">总览</el-text>
  <el-divider/>
  <el-row style="text-align: center">
    <el-col :span="8">
      <el-statistic title="用户完整体验次数" :value="userData.length">
        <template #suffix>次</template>
      </el-statistic>
    </el-col>
    <el-col :span="8">
      <el-statistic title="叙事节点总数" :value="nodeNum">
        <template #suffix>个</template>
      </el-statistic>
    </el-col>
    <el-col :span="8">
      <el-statistic title="总用户决策耗时" :value="totalCostTime">
        <template #suffix>秒</template>
      </el-statistic>
    </el-col>
  </el-row>
  <el-divider/>
  <el-row :gutter="20">
    <el-col>
      <el-card>
        <template #header>
          <el-text>玩家体验日期分布情况</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="dateHeatMapOption" ref="dateHeatMapChart"
                :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <template #header>
          <el-text>叙事节点类别分布情况</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="nodeOverviewOption" ref="nodePieMap"
                :autoresize="true"></vchart>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <template #header>
          <el-text>用户结局体验分布情况</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="endOverviewOption" ref="endPieMap"
                :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col>
      <el-card>
        <template #header>
          <el-text>到达各结局平均选择考虑时长</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="costTimeOption" ref="endCostMap" :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
