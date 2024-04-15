<script>
import ECharts from 'vue-echarts'
import { nodeOverviewOption } from '@/components/processingMap/proecessingMapOptions/Overview/nodeOverviewOption'
import {
  costTimeOverviewOption
} from '@/components/processingMap/proecessingMapOptions/Overview/costTimeOverviewOption'
import {
  dateHeatMapOverviewOption
} from '@/components/processingMap/proecessingMapOptions/Overview/dateHeatMapOverviewOption'
import * as echarts from 'echarts'

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
      // 展示用数据
      nodeNum: 0
    }
  },
  props: {
    graph: Object,
    data: Array
  },
  watch: {
    graph () {
      console.log('OverView', this.graph)
      this.nodeNum = this.graph.data.nodes.length
      dateHeatMapOverviewOption.series.data = this.getVirtualData(2024)
    }
  },
  methods: {
    getVirtualData (year) {
      const date = +echarts.time.parse(year + '-01-01')
      const end = +echarts.time.parse(+year + 1 + '-01-01')
      const dayTime = 3600 * 24 * 1000
      const data = []
      for (let time = date; time < end; time += dayTime) {
        data.push([
          echarts.time.format(time, '{yyyy}-{MM}-{dd}', false),
          Math.floor(Math.random() * 10000)
        ])
      }
      return data
    }
  }
}
</script>

<template>
  <el-text style="font-size: xxx-large">总览</el-text>
  <el-divider/>
  <el-row style="text-align: center">
    <el-col :span="8">
      <el-statistic title="用户完整体验次数" :value="data.length"></el-statistic>
    </el-col>
    <el-col :span="8">
      <el-statistic title="叙事节点总数" :value="nodeNum"></el-statistic>
    </el-col>
    <el-col :span="8">
      <el-statistic title="总用户决策耗时"></el-statistic>
    </el-col>
  </el-row>
  <el-divider/>
  <el-row :gutter="20">
    <el-col>
      <el-card>
        <template #header>
          <el-text>玩家体验日期分布情况</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="dateHeatMapOption" ref="vchart" :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <template #header>
          <el-text>叙事节点类别分布情况</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="nodeOverviewOption" ref="vchart" :autoresize="true"></vchart>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <template #header>
          <el-text>用户结局体验分布情况</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="nodeOverviewOption" ref="vchart" :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col>
      <el-card>
        <template #header>
          <el-text>到达各结局平均选择考虑时长</el-text>
        </template>
        <vchart style="height: 15vh;width: auto" :option="costTimeOption" ref="vchart" :autoresize="true"></vchart>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
