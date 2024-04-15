<script>
import ECharts from 'vue-echarts'
import { nodeOverviewOption } from '@/components/processingMap/proecessingMapOptions/Overview/nodeOverviewOption'
import {
  costTimeOverviewOption
} from '@/components/processingMap/proecessingMapOptions/Overview/costTimeOverviewOption'
export default {
  name: 'NodeInformationComponent',
  components: {
    vchart: ECharts
  },
  data () {
    return {
      nodeOverviewOption: nodeOverviewOption,
      costTimeOption: costTimeOverviewOption
    }
  }
}
</script>

<template>
  <el-text style="font-size: xxx-large">节点信息</el-text>
  <el-divider/>
  <el-row style="text-align: center">
    <el-col :span="6">
      <el-statistic title="Daily active users" :value="268500"></el-statistic>
    </el-col>
    <el-col :span="6">
      <el-statistic title="Daily active users" :value="268500"></el-statistic>
    </el-col>
    <el-col :span="6">
      <el-statistic title="Daily active users" :value="268500"></el-statistic>
    </el-col>
    <el-col :span="6">
      <el-statistic title="Daily active users" :value="268500"></el-statistic>
    </el-col>
  </el-row>
  <el-divider/>
  <el-row :gutter="20">
    <el-col :span="12">
      <el-card>
        <template #header>
          <el-statistic title="Daily active users" :value="268500"></el-statistic>
        </template>
        <vchart style="height: 20vh;width: auto" :option="nodeOverviewOption" ref="vchart"></vchart>
      </el-card>
    </el-col>
    <el-col :span="12">
      <el-card>
        <template #header>
          <el-statistic title="Daily active users" :value="268500"></el-statistic>
        </template>
        <vchart style="height: 20vh;width: auto" :option="nodeOverviewOption" ref="vchart"></vchart>
      </el-card>
    </el-col>
  </el-row>
  <el-row :gutter="20">
    <el-col>
      <el-card>
        <template #header>
          <el-statistic title="Daily active users" :value="268500"></el-statistic>
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
