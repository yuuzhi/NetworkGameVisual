<script>
import ECharts from 'vue-echarts'
import { nodeOverviewOption } from '@/components/processingMap/proecessingMapOptions/Overview/nodeOverviewOption'
import {
  costTimeOverviewOption
} from '@/components/processingMap/proecessingMapOptions/Overview/costTimeOverviewOption'

export default {
  name: 'EdgeInformationComponent',
  components: {
    vchart: ECharts
  },
  props: {
    edgeInfo: null,
  },
  data () {
    return {
      // 数据
      userCount: 0,
      costTime: 0,
      startNode: null,
      endNode: null,
      // 配置项
    }
  },
  watch: {
    edgeInfo: {
      handler () {
        console.log(this.edgeInfo)
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
        // this.freshStatistic()
        // // 图表数据
        // this.freshPieChart()
        // this.freshScatter()
        // this.freshParallel()
        // // 刷新绘制
      },
      immediate: true
    },
  },
  methods: {
    formatPercentage (value) {
      return (value * 100).toFixed(2) + '%'
    },
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
    <el-descriptions-item label="起点节点类型" label-align="center" align="center">{{ this.startNode.nodeCategory }}
    </el-descriptions-item>
    <el-descriptions-item label="起点节点序号" label-align="center" align="center">{{ this.startNode.nodeIndex }}
    </el-descriptions-item>
  </el-descriptions>
  <el-descriptions border :size="'large'">
    <el-descriptions-item label="终点节点类型" label-align="center" align="center">{{ this.endNode.nodeCategory }}
    </el-descriptions-item>
    <el-descriptions-item label="终点节点序号" label-align="center" align="center">{{ this.endNode.nodeIndex }}
    </el-descriptions-item>
  </el-descriptions>
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
