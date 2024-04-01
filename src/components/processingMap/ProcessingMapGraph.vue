<script>
import { ref } from 'vue'
import axios from 'axios'
import createGraph from 'ngraph.graph'
import dagre from 'dagre'
import { mainOption } from './proecessingMapOptions/mainMapOption'
import { sankeyOption } from './proecessingMapOptions/sankeyMapOption'
import ECharts from 'vue-echarts'
import OverviewComponent from '@/components/processingMap/OverviewComponent.vue'
import NodeInformationComponent from '@/components/processingMap/NodeInformationComponent.vue'
import EdgeInformationComponent from '@/components/processingMap/EdgeInformationComponent.vue'

const nodeType = new Map([[0, 'InteractionPoint'],
  [1, 'Option'],
  [2, 'Input'],
  [3, 'Fork'],
  [4, 'Constraints'],
  [5, 'End'],
  [6, 'Event'],
  [7, 'Feedback'],
  [8, 'Obsolete']])

const processingMapGraph = createGraph()

const $NetworkStoreUrl = 'https://baishe.obs.cn-north-4.myhuaweicloud.com/'
const $LogStoreUrl = 'https://baishelog.obs.cn-north-4.myhuaweicloud.com/'

let pointOption = new Map()
export default {
  data () {
    return {
      graphMap: null,
      graphData: null,
      option: mainOption,
      sOption: sankeyOption,
      sankeyMapState: false,
      userData: [],
      dargeGraph: null,
      isShowOverview: true,
      isShowNode: false,
      isShowEdge: false,
      isShowSelect: false,
      selectList: []
    }
  },
  components: {
    EdgeInformationComponent,
    NodeInformationComponent,
    OverviewComponent,
    vchart: ECharts
  },
  mounted () {
    // ref(axios.get($NetworkStoreUrl + 'processingMapGraph.json').then((res) => {
    //   this.graphMap = res
    //   console.log(res)
    // }))
    // ref(axios.get($NetworkStoreUrl + 'processingMapData.json').then((data) => {
    //   this.graphData = data
    //   console.log(data)
    // }))

    // 本地
    ref(axios.get('/ProcessingMap/processingMapGraph.json').then((res) => {
      this.graphMap = res
      // console.log(res)
    }))
    ref(axios.get('/ProcessingMap/processingMapData.json').then((data) => {
      this.graphData = data
      // console.log(data)
    }))
  },
  watch: {
    graphMap (newVal, oldVal) {
      // console.log('graphMap新值：', newVal)
      this.ReadJsonMakeProcessingGraph()
    },
    graphData (newVal) {
      this.ReadPathMakeProcessingData()
    },
    async userData () {
      // console.log(this.sOption.series[0].links)
      // 处理数据
      this.userData.forEach(log => {
        log.nodes.forEach(node => {
          switch (node.nodeType) {
            case 'InteractionPoint':
              var nextIndex
              // 找到下一个是interactionPoint的对象索引
              for (let i = log.nodes.indexOf(node) + 1; i < log.nodes.length; i++) {
                if (log.nodes[i].nodeType === 'InteractionPoint' || log.nodes[i].nodeType === 'End') {
                  nextIndex = i
                  break
                }
              }
              var optionIndex = this.graphMap.data.nodes.findIndex(n =>
                n.nodeType === 1 && n.index === node.chosenOptionIndex
              )
              // source交互点
              var temp1 = this.GetNodeArrayObject(node.nodeType, node.nodeIndex)
              // target交互点
              var temp2 = this.GetNodeArrayObject(log.nodes[nextIndex].nodeType, log.nodes[nextIndex].nodeIndex)
              // source->target所经过的option
              var temp3 = this.graphMap.data.nodes[optionIndex]

              // var sourceName = nodeType.get(temp1.nodeType) + ' ' + this.graphMap.data.nodes.indexOf(temp1) + '->' +
              //   nodeType.get(temp3.nodeType) + ' ' +
              var sourceName = nodeType.get(temp1.nodeType) + ' ' + this.graphMap.data.nodes.indexOf(temp1)
              var targetName = nodeType.get(temp2.nodeType) + ' ' + this.graphMap.data.nodes.indexOf(temp2)
              // console.log(sourceName, targetName)
              // this.data.point2Option.get(this.GetNodeArrayIndex(node.nodeType, node.nodeIndex):获得Map数组
              if (this.sOption.series[0].links.findIndex(
                l => ((l.source === sourceName) && (l.target === targetName))) > -1) {
                this.sOption.series[0].links[this.sOption.series[0].links.findIndex(
                  l => ((l.source === sourceName) && (l.target === targetName)
                  )) + pointOption.get(this.GetNodeArrayIndex(log.nodes[nextIndex].nodeType, log.nodes[nextIndex].nodeIndex)).findIndex(i => i === optionIndex)].value++
                // console.log(pointOption.get(this.GetNodeArrayIndex(log.nodes[nextIndex].nodeType, log.nodes[nextIndex].nodeIndex)))
                // console.log('index:', this.sOption.series[0].links.findIndex(
                //   l => ((l.source === sourceName) && (l.target === targetName)
                //   )), '+', pointOption.get(this.GetNodeArrayIndex(log.nodes[nextIndex].nodeType, log.nodes[nextIndex].nodeIndex)).findIndex(i => i === optionIndex), optionIndex)
              }
              break
          }
        })
      })
    }
  },
  methods: {
    ReadPathMakeProcessingData () {
      const userDataTemp = []
      const basePath = ''

      axios.get($LogStoreUrl + basePath)
        .then(async (response) => {
          // console.log('response', response)
          var dom = new DOMParser()
          var res = dom.parseFromString(response.data, 'text/xml')
          // console.log('res', res)
          const fileNames = res.getElementsByTagName('Contents')
          // console.log('fileNames', fileNames)
          for (const fileName of fileNames) {
            // console.log('key', fileName.getElementsByTagName('Key'))
            if (fileName.getElementsByTagName('Key')[0].innerHTML.endsWith('.json')) {
              var name = fileName.getElementsByTagName('Key')[0].innerHTML
              const jsonFileResponse = await axios.get($LogStoreUrl + basePath + name)
              userDataTemp.push(jsonFileResponse.data)
            }
          }
          this.userData = JSON.parse(JSON.stringify(userDataTemp))
        })
        .catch(error => {
          console.error('Error fetching file names:', error)
        })
    },
    ReadJsonMakeProcessingGraph () {
      // 测试
      this.dargeGraph = new dagre.graphlib.Graph()

      // console.log(this.graphMap.data)

      // Set an object for the graph label
      this.dargeGraph.setGraph({
        rankdir: 'LR',
        edgesep: 100,
        ranksep: 100
      })
      // Default to assigning a new object as a label for each new edge.
      this.dargeGraph.setDefaultEdgeLabel(function () {
        return {}
      })

      //  映射(NGraph和dargeGraph)
      for (let i = 0; i < this.graphMap.data.nodes.length; i++) {
        processingMapGraph.addNode(i, this.graphMap.data.nodes[i])
        this.dargeGraph.setNode(i, {
          data: this.graphMap.data.nodes,
          width: 100,
          height: 100,
        })
      }
      for (let i = 0; i < this.graphMap.data.edgeIndexes.length; i++) {
        processingMapGraph.addLink(this.graphMap.data.edgeIndexes[i].x, this.graphMap.data.edgeIndexes[i].y)
        this.dargeGraph.setEdge(this.graphMap.data.edgeIndexes[i].x, this.graphMap.data.edgeIndexes[i].y)
      }
      dagre.layout(this.dargeGraph)

      // 绘图
      for (let i = 0; i < this.graphMap.data.nodes.length; i++) {
        if (this.graphMap.data.nodes[i].nodeType === 8) continue
        const temp = {
          name: nodeType.get(this.graphMap.data.nodes[i].nodeType) + ' ' + i.toString(),
          x: this.dargeGraph.node(i).x,
          y: this.dargeGraph.node(i).y
        }
        switch (nodeType.get(this.graphMap.data.nodes[i].nodeType)) {
          case 'InteractionPoint':
            temp.category = 0
            // 在桑基图中添加节点
            this.sOption.series[0].data.push({
              name: nodeType.get(this.graphMap.data.nodes[i].nodeType) + ' ' + i.toString()
            })
            break
          case 'Option':
            temp.category = 1
            break
          case 'Input':
            temp.category = 2
            break
          case 'Fork':
            temp.category = 3
            break
          case 'Constraints':
            temp.category = 4
            break
          case 'End':
            temp.category = 5
            // 在桑基图中添加节点
            this.sOption.series[0].data.push({
              name: nodeType.get(this.graphMap.data.nodes[i].nodeType) + ' ' + i.toString(),
            })
            break
          case 'Event':
            temp.category = 6
            break
          case 'Feedback':
            temp.category = 7
            break
          default:
            break
        }
        if (!this.option.series[0].data.includes(temp)) {
          this.option.series[0].data.push(temp)
        }
      }
      for (let i = 0; i < this.graphMap.data.edgeIndexes.length; i++) {
        this.option.series[0].links.push({
          source: nodeType.get(this.graphMap.data.nodes[this.graphMap.data.edgeIndexes[i].x].nodeType) + ' ' + this.graphMap.data.edgeIndexes[i].x,
          target: nodeType.get(this.graphMap.data.nodes[this.graphMap.data.edgeIndexes[i].y].nodeType) + ' ' + this.graphMap.data.edgeIndexes[i].y,
        })
      }

      const point2OptionMap = new Map()
      processingMapGraph.forEachNode(node => {
        if (node.data.nodeType === 0 || node.data.nodeType === 5) {
          processingMapGraph.forEachLinkedNode(node.id, n => {
            var tempOption = []
            // console.log(n.id)
            currentResult = []
            FindNextInteractionNode(n.id)
            var nextNode = currentResult
            if (nextNode !== null) {
              nextNode.forEach(nextNode => {
                // 把边塞进桑基图
                // console.log(nextNode)
                // console.log(nodeType.get(node.data.nodeType) + ' ' + node.id, '->',
                //   nodeType.get(nextNode.data.nodeType) + ' ' + nextNode.id)
                this.sOption.series[0].links.push({
                  source: nodeType.get(node.data.nodeType) + ' ' + node.id,
                  target: nodeType.get(nextNode.data.nodeType) + ' ' + nextNode.id,
                  value: 0,
                  lineStyle: {
                    color: 'source'
                  }
                })
                tempOption.push(n.id)
                // 配置Map
                if (point2OptionMap.has(nextNode.id)) {
                  var array = point2OptionMap.get(nextNode.id)
                  array.push(n.id)
                  point2OptionMap.set(nextNode.id, array)
                } else {
                  point2OptionMap.set(nextNode.id, tempOption)
                }
              })
            }
          }, true)
        }
      })
      pointOption = point2OptionMap

      // console.log(point2OptionMap)
      var currentResult = []

      function FindNextInteractionNode (id) {
        let result // 初始化返回值为 null
        processingMapGraph.forEachLinkedNode(id, n => {
          if (n.data === null) {
            return // 终止当前循环
          }
          if (n.data.nodeType === 0) {
            currentResult.push(n)
            result = n // 设置返回值为当前节点 n
          } else if (n.data.nodeType === 5) {
            currentResult.push(n)
            result = n // 设置返回值为当前节点 n
          } else {
            // if (result[index]) index++
            result = FindNextInteractionNode(n.id)
          }
        }, true)
        // console.log('current id:', id, 'result:', result)
        return result // 返回最终结果
      }
    },
    GetNodeArrayObject (type, nodeIndex) {
      return this.graphMap.data.nodes.find(n => (nodeType.get(n.nodeType) === type && (nodeIndex === n.index)))
    },
    GetNodeArrayIndex (type, nodeIndex) {
      return this.graphMap.data.nodes.findIndex(n => (nodeType.get(n.nodeType) === type && (nodeIndex === n.index)))
    },
    GraphSelectEvent (e) {
      console.log(e)
      // 切换展示状态
      switch (e.dataType) {
        case 'node':
          this.NodeShowEvent(e)
          break
        case 'edge':
          this.EdgeShowEvent(e)
          break
        default:
          this.UnselectEvent(e)
      }
    },
    UnselectEvent (e) {
      if (e.target === undefined) {
        this.isShowOverview = true
        this.isShowNode = false
        this.isShowEdge = false
        // 切换缩放和中心点
        this.$refs.dagChart.setOption({
          series: [{
            zoom: 1,
          }]
        })
      }
    },
    EdgeShowEvent (e) {
      this.isShowEdge = true
      this.isShowOverview = false
      this.isShowNode = false
    },
    NodeShowEvent (e) {
      this.isShowNode = true
      this.isShowOverview = false
      this.isShowEdge = false
      // 处理多选节点
      this.CheckSelectedList(e)
      // 处理缩放
      // 设置选中状态
      this.$refs.dagChart.dispatchAction({
        type: 'toggleSelect',
        seriesIndex: e.seriesIndex,
        dataIndex: e.dataIndex
      })
      var nodeData = this.$refs.dagChart.getOption().series[e.seriesIndex].data[e.dataIndexInside]
      console.log(nodeData)
      // 处理缩放
      var selectedNodeX = nodeData.x
      var selectedNodeY = nodeData.y
      // 设置新的视图中心为选中节点的位置
      this.$refs.dagChart.setOption({
        series: [{
          center: [selectedNodeX, selectedNodeY]
        }]
      })
      // 进行放大缩放
      this.$refs.dagChart.setOption({
        series: [{
          zoom: 5
        }]
      })
    },
    CheckSelectedList (e) {
      // 添加/移除选中列表
      // 判断是否在列表中
      if (this.selectList.find(x => x === e) === undefined) { // 如果不在，则添加进列表
        this.selectList.push(e)
      } else { // 否则，移出列表
        this.selectList.pop(e)
      }
      // 进行选中列表的合法性检查
      this.selectList.find(x => x.dataIndexInside === 0)
      // 如果合法，则在右侧展示路径信息
      console.log(this.selectList)
    }
  }
}
</script>

<template>
  <el-container>
    <el-aside width="70%">
      <div style="height: 95%; width:98%">
        <el-col style="height: 50%">
          <vchart class="echart" :option="option" :autoresize="true" ref="dagChart"
                  @select="GraphSelectEvent"
                  @unselect="UnselectEvent"
                  @zr:click="UnselectEvent">
          </vchart>
        </el-col>
        <el-divider/>
        <el-col style="height: 50%">
          <vchart class="echart" :option="sOption" :autoresize="true" ref="sankeyChart"
                  @select="GraphSelectEvent"
                  @unselect="UnselectEvent"
                  @zr:click="UnselectEvent">
          </vchart>
        </el-col>
      </div>
    </el-aside>
    <el-main class="rightSide">
      <OverviewComponent v-if="isShowOverview" style="height: 100%;width: 100%"/>
      <NodeInformationComponent v-if="isShowNode" style="height: 100%;width: 100%"/>
      <EdgeInformationComponent v-if="isShowEdge" style="height: 100%;width: 100%"/>
    </el-main>
  </el-container>
</template>

<style scoped>
.echart {
  height: 100%;
  width: 100%;
  border: gray solid 1px;
  border-radius: 10px;
}

.rightSide {
  border: gray solid 1px;
  border-radius: 10px;
}
</style>
