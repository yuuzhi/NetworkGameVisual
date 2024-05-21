<script>
import { ref } from 'vue'
import axios from 'axios'
import createGraph from 'ngraph.graph'
import dagre from 'dagre'
import { mainOption } from './proecessingMapOptions/mainMapOption'
import { sankeyOption } from './proecessingMapOptions/sankeyMapOption'
import ECharts, { THEME_KEY } from 'vue-echarts'
import OverviewComponent from '@/components/processingMap/OverviewComponent.vue'
import NodeInformationComponent from '@/components/processingMap/NodeInformationComponent.vue'
import EdgeInformationComponent from '@/components/processingMap/EdgeInformationComponent.vue'
import PathInformationComponent from '@/components/processingMap/PathInformationComponent.vue'
import NodeListComponent from '@/components/processingMap/NodeListComponent.vue'
import roam from '@/components/processingMap/themes/roma.json'
import ToolComponent from '@/components/processingMap/ToolComponent.vue'
import GraphStateComponent from '@/components/processingMap/GraphStateComponent.vue'

const nodeType = new Map([[0, 'InteractionPoint'],
  [1, 'Option'],
  [2, 'Input'],
  [3, 'Fork'],
  [4, 'Constraints'],
  [5, 'End'],
  [6, 'Event'],
  [7, 'Feedback'],
  [8, 'Obsolete']])

const defaultCategory = [
  {
    name: '0',
    symbol: 'diamond',
  },
  {
    name: '1',
    symbol: 'circle',
    symbolSize: 5,
  },
  {
    name: '2',
    symbol: 'rect',
    symbolSize: 5,
  },
  {
    name: '3',
    symbol: 'roundRect',
    symbolSize: 5,
  },
  {
    name: '4',
    symbol: 'roundRect',
    symbolSize: 5,
  },
  {
    name: '5',
    symbol: 'circle',
    itemStyle: {
      color: '#364f6b'
    }
  },
  {
    name: '6',
    symbol: 'roundRect',
    symbolSize: 5,
  },
  {
    name: '7',
    symbol: 'roundRect',
    symbolSize: 5,
  },
]

const processingMapGraph = createGraph()

const $NetworkStoreUrl = 'https://baishe.obs.cn-north-4.myhuaweicloud.com/'
const $LogStoreUrl = 'https://baishelog.obs.cn-north-4.myhuaweicloud.com/'

let pointOption = new Map()
export default {
  provide: { [THEME_KEY]: 'roam' },
  data () {
    return {
      // 进度图结构图和数据
      graphMap: null,
      graphData: null,
      // 可视化选项
      option: mainOption,
      sOption: sankeyOption,
      userData: [],
      selectList: [],
      dargeGraph: null,
      // 数据
      overViewData: {
        logNum: 0
      },
      currentSelectedNode: null,
      currentSelectedEdge: null,
      input: '',
      // 状态
      sankeyMapState: false,
      isShowOverview: true,
      isShowNode: false,
      isShowEdge: false,
      isShowSelect: false,
      isShowPath: false,
      isClearSelected: false,
      isLoadingDag: true,
      isLoadingSankey: true,
      dagState: 'default',
      // 其他
      theme: roam
    }
  },
  components: {
    GraphStateComponent,
    ToolComponent,
    PathInformationComponent,
    EdgeInformationComponent,
    NodeInformationComponent,
    OverviewComponent,
    NodeListComponent,
    vchart: ECharts,
  },
  mounted () {
    ref(axios.get($NetworkStoreUrl + 'processingMapGraph.json').then((res) => {
      this.graphMap = res
      // console.log(res)
    }))
    ref(axios.get($NetworkStoreUrl + 'processingMapData.json').then((data) => {
      this.graphData = data
      // console.log(data)
    }))
  },
  computed: {

  },
  watch: {
    graphMap () {
      // // console.log('graphMap新值：', newVal)
      this.ReadJsonMakeProcessingGraph()
    },
    graphData () {
      this.ReadPathMakeProcessingData()
    },
    selectList: {
      handler (newVal) {
        // console.log(newVal)
        this.CheckSelectedList(0)
      },
      deep: true
    },
    async userData () {
      // // console.log(this.sOption.series[0].links)
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

              var sourceName = nodeType.get(temp1.nodeType) + ' ' + this.graphMap.data.nodes.indexOf(temp1)
              var targetName = nodeType.get(temp2.nodeType) + ' ' + this.graphMap.data.nodes.indexOf(temp2)
              var offset = pointOption.get(this.GetNodeArrayIndex(log.nodes[nextIndex].nodeType, log.nodes[nextIndex].nodeIndex)).findIndex(i => i === optionIndex)
              if (offset < 0) offset = 0
              // 边++
              if (this.sOption.series[0].links.findIndex(l => ((l.source === sourceName) && (l.target === targetName))) > -1) {
                this.sOption.series[0].links[this.sOption.series[0].links.findIndex(
                  l => ((l.source === sourceName) && (l.target === targetName)
                  )) + offset].value++
              }
              break
          }
        })
      })
      this.ChangeSankeyColor()
      this.isLoadingSankey = false
    },
    dagState () {
      // 切换缩放和中心点
      this.$refs.dagChart.setOption({
        series: [{
          zoom: 1,
        }]
      })
      switch (this.dagState) {
        case 'default':
          this.option.series[0].data.forEach(i => {
            i.itemStyle = {}
          })
          this.option.series[0].categories = defaultCategory
          this.option.series[0].data.forEach(i => {
            i.itemStyle = {}
          })
          break
        case 'remainPath':
          if (this.currentSelectedNode !== null) {
            this.ChangeRemainColor()
          }
          break
        case 'onePath':
          this.ChangeOnePathColor()
          break
      }
    },
    input () {
      console.log(this.input)
      switch (this.dagState) {
        case 'onePath':
          this.ChangeOnePathColor()
          break
        default: {
          break
        }
      }
    },
    currentSelectedNode () {
      // 处理显示
      console.log('this.dagState', this.dagState)
      console.log(this.userData)
      switch (this.dagState) {
        case 'default':
          this.option.series[0].data.forEach(i => {
            i.itemStyle = {}
          })
          this.option.series[0].categories = defaultCategory
          break
        case 'remainPath':
          this.ChangeRemainColor()
          break
        case 'onePath':
          this.ChangeOnePathColor()
          break
        default: {
          break
        }
      }
    }
  },
  methods: {
    ReadPathMakeProcessingData () {
      const userDataTemp = []
      const basePath = ''

      axios.get($LogStoreUrl + basePath)
        .then(async (response) => {
          const dom = new DOMParser()
          const res = dom.parseFromString(response.data, 'text/xml')
          const fileNames = res.getElementsByTagName('Contents')
          for (const fileName of fileNames) {
            if (fileName.getElementsByTagName('Key')[0].innerHTML.endsWith('.json')) {
              const name = fileName.getElementsByTagName('Key')[0].innerHTML
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
          y: this.dargeGraph.node(i).y,
          itemStyle: {}
        }
        switch (nodeType.get(this.graphMap.data.nodes[i].nodeType)) {
          case 'InteractionPoint':
            temp.category = 0
            // 在桑基图中添加节点
            this.sOption.series[0].data.push({
              name: nodeType.get(this.graphMap.data.nodes[i].nodeType) + ' ' + i.toString(),
              itemStyle: {}
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
              itemStyle: {}
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
            const tempOption = []
            currentResult = []
            FindNextInteractionNode(n.id)
            const nextNode = currentResult
            if (nextNode !== null) {
              nextNode.forEach(nextNode => {
                // 把边塞进桑基图
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
                  const array = point2OptionMap.get(nextNode.id)
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
      this.isLoadingDag = false
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
        // // console.log('current id:', id, 'result:', result)
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
      // console.log(e)
      // 切换展示状态
      switch (e.dataType) {
        case 'node':
          this.GraphNodeShowEvent(e)
          this.currentSelectedNode = this.$refs.dagChart.getOption().series[e.seriesIndex].data[e.dataIndexInside].name
          break
        case 'edge':
          this.EdgeShowEvent(e)
          this.currentSelectedEdge = this.$refs.dagChart.getOption().series[e.seriesIndex].links[e.dataIndexInside]
          break
        default:
          this.UnselectEvent(e)
      }
    },
    SankeySelectEvent (e) {
      // console.log(e)
      // 切换展示状态
      switch (e.dataType) {
        case 'node':
          this.SankeyNodeShowEvent(e)
          this.currentSelectedNode = this.$refs.sankeyChart.getOption().series[e.seriesIndex].data[e.dataIndexInside].name
          break
        case 'edge':
          this.EdgeShowEvent(e)
          // console.log(this.$refs.sankeyChart.getOption().series[e.seriesIndex].links[e.dataIndexInside])
          this.currentSelectedEdge = this.$refs.sankeyChart.getOption().series[e.seriesIndex].links[e.dataIndexInside]
          break
        default:
          this.UnselectEvent(e)
      }
    },
    UnselectEvent (e) {
      if (e.dataType === 'node') {
        if (this.selectList.find(x => x.dataIndexInside === e.dataIndexInside)) {
          this.selectList.splice(this.selectList.findIndex(x => x.dataIndexInside === e.dataIndexInside), 1)
        }
      }
      if (this.isShowPath === true) return
      if (e.target === undefined) {
        // 切换缩放和中心点
        // this.$refs.dagChart.setOption({
        //   series: [{
        //     zoom: 1,
        //   }]
        // })
        this.isShowOverview = true
        this.isShowNode = false
        this.isShowEdge = false
        this.isShowPath = false
      }
    },
    EdgeShowEvent (e) {
      if (this.isShowPath === true) return
      this.isShowEdge = true
      this.isShowOverview = false
      this.isShowNode = false
      this.isShowPath = false
    },
    GraphNodeShowEvent (e) {
      // console.log('e:', e)
      // 处理缩放
      // 设置选中状态
      this.$refs.dagChart.dispatchAction({
        type: 'toggleSelect',
        seriesIndex: e.seriesIndex,
        dataIndex: e.dataIndex
      })

      const nodeData = this.$refs.dagChart.getOption().series[e.seriesIndex].data[e.dataIndexInside]

      // 添加/移除选中列表
      // 判断是否在列表中
      // // console.log(e)
      if (this.selectList.find(x => x === e) === undefined && e.type === 'select') { // 如果不在，则添加进列表
        this.selectList.push(e)
      }

      // 处理缩放
      const selectedNodeX = nodeData.x
      const selectedNodeY = nodeData.y
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
      // // console.log(this.selectList)
      if (this.isShowPath === true) return
      this.isShowNode = true
      this.isShowOverview = false
      this.isShowEdge = false
      this.isShowPath = false
    },
    SankeyNodeShowEvent (e) {
      const split = this.$refs.sankeyChart.getOption().series[e.seriesIndex].data[e.dataIndexInside].name.split(' ')
      const nodeData = this.$refs.dagChart.getOption().series[e.seriesIndex].data[split[1]]
      // 处理缩放
      const selectedNodeX = nodeData.x
      const selectedNodeY = nodeData.y
      // 设置新的视图中心为选中节点的位置
      // this.$refs.dagChart.setOption({
      //   series: [{
      //     center: [selectedNodeX, selectedNodeY]
      //   }]
      // })
      // 进行放大缩放
      this.$refs.dagChart.setOption({
        series: [{
          zoom: 5
        }]
      })

      // // console.log(this.selectList)
      if (this.isShowPath === true) return
      this.isShowNode = true
      this.isShowOverview = false
      this.isShowEdge = false
      this.isShowPath = false
    },
    PathShowEvent () {
      // console.log('我触发了')
      this.isShowPath = true
      this.isShowNode = false
      this.isShowOverview = false
      this.isShowEdge = false
    },
    ClearSelectedEvent () {
      this.selectList.forEach(e => {
        this.$refs.dagChart.dispatchAction({
          type: 'unselect',
          seriesIndex: 0,
          dataIndex: e.dataIndexInside
        })
      })
      this.selectList = []
      this.isClearSelected = false
    },
    CheckSelectedList () {
      // console.log(this.selectList)
      // 如果合法，则在右侧展示路径信息
      if (this.CheckPath(0) === true) {
        this.PathShowEvent()
      } else {
        this.isShowPath = false
        if (!(this.isShowPath || this.isShowNode || this.isShowOverview || this.isShowEdge)) {
          this.isShowOverview = true
          // 切换缩放和中心点
          this.$refs.dagChart.setOption({
            series: [{
              zoom: 1,
            }]
          })
        }
      }
    },
    CheckPath (nodeId) {
      if (this.selectList.find(x => x.dataIndexInside === nodeId)) {
        if (this.$refs.dagChart.getOption().series[0].data[nodeId].category === 5) {
          // // console.log('this.$refs.dagChart.getOption().series[0].data[nodeId]', this.$refs.dagChart.getOption().series[0].data[nodeId])
          return true
        } else {
          let nextNode
          processingMapGraph.forEachLinkedNode(nodeId, n => {
            console.log(nodeId)
            if (this.selectList.find(x => x.dataIndexInside === n.id)) {
              nextNode = n.id
            }
          }, true)
          if (nextNode === undefined) return false
          // // console.log('currentNode:', nodeId, 'NextNode:', nextNode)
          return this.CheckPath(nextNode)
        }
      } else {
        return false
      }
    },
    ChangeSankeyColor () {
      // 流量映射
      // convert #hex notation to rgb array
      const parseColor = function (hexStr) {
        return hexStr.length === 4 ? hexStr.substr(1).split('').map(function (s) { return 0x11 * parseInt(s, 16) }) : [hexStr.substr(1, 2), hexStr.substr(3, 2), hexStr.substr(5, 2)].map(function (s) { return parseInt(s, 16) })
      }

      // zero-pad 1 digit to 2
      const pad = function (s) {
        return (s.length === 1) ? '0' + s : s
      }

      const gradientColors = function (start, end, steps, gamma) {
        let i; let j; let ms; let me; const output = []; const so = []
        gamma = gamma || 1
        const normalize = function (channel) {
          return Math.pow(channel / 255, gamma)
        }
        start = parseColor(start).map(normalize)
        end = parseColor(end).map(normalize)
        for (i = 0; i < steps; i++) {
          ms = i / (steps - 1)
          me = 1 - ms
          for (j = 0; j < 3; j++) {
            so[j] = pad(Math.round(Math.pow(start[j] * me + end[j] * ms, 1 / gamma) * 255).toString(16))
          }
          output.push('#' + so.join(''))
        }
        return output
      }
      // 正式内容
      const nodeCount = []
      const MinColor = '#364f6b'
      const MaxColor = '#fc5185'
      // 统计总数量
      this.sOption.series[0].data.forEach(node => {
        nodeCount.push([node.name, 0])
      })
      this.sOption.series[0].links.forEach(link => {
        const index = nodeCount.findIndex(x => x[0] === link.source)
        const endIndex = nodeCount.findIndex(x => x[0] === link.target && x[0].split(' ')[0] === 'End')
        if (index !== -1) {
          nodeCount[index][1] += link.value
        }
        if (endIndex !== -1) {
          nodeCount[endIndex][1] += link.value
        }
      })
      this.sOption.series[0].data.forEach(node => {
        let temp = nodeCount.find(x => x[0] === node.name)[1] / this.userData.length
        if (temp < 0)temp = 0
        node.itemStyle.color = gradientColors(MinColor, MaxColor, 100)[(temp * 100).toFixed(0) - 1]
      })
      this.sOption.series[0].links.forEach(link => {
        let temp = link.value / this.userData.length
        if (temp < 0)temp = 0
        link.lineStyle.color = gradientColors(MinColor, MaxColor, 100)[(temp * 100).toFixed(0) - 1]
      })
    },
    GraphStateChangedEvent (newState) {
      // console.log('newState', newState)
      this.dagState = newState
    },
    ChangeRemainColor () {
      if (this.currentSelectedNode !== null) {
        this.option.series[0].data.forEach(i => {
          i.itemStyle.color = '#f3d999'
        })
        // 获取所有之后的结点
        // console.log(this.currentSelectedNode)
        const remainNodes = this.GetRemainNodes(this.currentSelectedNode.split(' ')[1], [])
        // console.log('remainNodes', remainNodes)
        // 改变结点颜色为一个颜色
        remainNodes.forEach(i => {
          // console.log(this.option.series[0].data[i])
          this.option.series[0].data[i].itemStyle.color = '#8b4513'
        })
        this.$refs.dagChart.setOption(this.option)
      }
    },
    ChangeOnePathColor () {
      // 获取结点
      const remainNodes = []
      const log = this.userData.find(x => x.logID === this.input)
      // console.log(this.input)
      if (log !== undefined) {
        this.option.series[0].data.forEach(i => {
          i.itemStyle.color = '#f3d999'
        })
        log.nodes.forEach(n => {
          remainNodes.push(this.GetNodeArrayIndex(n.nodeType, n.nodeIndex))
          // console.log(this.GetNodeArrayObject(n.nodeType, n.nodeIndex))
        })
        // 改变结点颜色为一个颜色
        remainNodes.forEach(i => {
          this.option.series[0].data[i].itemStyle.color = '#8b4513'
        })
        this.$refs.dagChart.setOption(this.option)
      }
    },
    GetRemainNodes (nodeId, result) {
      // console.log(nodeId)
      // 到达结局结点
      if (this.$refs.dagChart.getOption().series[0].data[nodeId].category === 5) {
        // console.log(this.$refs.dagChart.getOption().series[0].data[nodeId].category)
        return result
      } else {
        // 否则，判断下一个结点
        let nextNode
        const nextNodes = []
        processingMapGraph.forEachLinkedNode(Number(nodeId), n => {
          nextNodes.push(n.id)
          if (result.find(x => x === n.id) === undefined) { result.push(n.id) }
        }, true)
        let temp = []
        // console.log(nextNodes)
        nextNodes.forEach(x => {
          temp = [...new Set(this.GetRemainNodes(x, result).concat(result))]
          // console.log(temp)
        })
        return temp
      }
    },
    InputCheckedEvent (input) {
      this.input = input
    }
  }

}
</script>

<template>
  <el-container style="height: 100%">
    <el-aside width="70%">
      <div style="height: 94%; width:98%">
        <el-row :gutter="20" style="height: 50%">
          <el-col  :span="6">
            <el-row>
              <ToolComponent class="tool"></ToolComponent>
            </el-row>
            <div style="height: 2vh"/>
            <el-row>
              <NodeListComponent  class="nodeList"
                                  :selectedList=" this.selectList"
                                  :nodes="option.series[0].data"
                                  :sankey-option="sOption"/>
            </el-row>
          </el-col>
          <el-col :span="18">
            <el-row>
              <graph-state-component class="graphState" @SelectChangedEvent="this.GraphStateChangedEvent"
              @InputCheckedEvent="this.InputCheckedEvent"/>
            </el-row>
            <div style="height: 2vh"/>
            <el-row>
              <vchart class="dgaChart" :option="option" :theme=theme :autoresize="true" ref="dagChart"
                      @select="GraphSelectEvent"
                      @unselect="UnselectEvent"
                      @zr:click="UnselectEvent"
                      @zr:dblclick="this.isClearSelected = true">
              </vchart>
            </el-row>
          </el-col>
        </el-row>
        <el-divider/>
        <el-col style="height: 50%" v-loading.fullscreen.lock="isLoadingSankey"
                element-loading-text="数据初始化..."
                element-loading-background="rgba(0, 0, 0, 0.7)">
          <vchart class="sankeyChart" :option="sOption" :theme=theme :autoresize="true" ref="sankeyChart"
                  @select="SankeySelectEvent"
                  @zr:click="UnselectEvent">
          </vchart>

        </el-col>
      </div>
    </el-aside>
    <el-main class="rightSide">
      <OverviewComponent v-if="isShowOverview" style="height: 100%;width: 100%"
                         :graph="graphMap"
                         :graph-data="graphData"
                         :user-data="userData"/>
      <NodeInformationComponent v-if="isShowNode" style="height: 100%;width: 100%"
                                :graph="graphMap"
                                :graph-data="graphData"
                                :user-data="userData"
                                :sankeyOption="sOption"
                                :node-info="currentSelectedNode"/>
      <EdgeInformationComponent v-if="isShowEdge" style="height: 100%;width: 100%"
                                :graph="graphMap"
                                :graph-data="graphData"
                                :user-data="userData"
                                :sankeyOption="sOption"
                                :edgeInfo="currentSelectedEdge"/>
      <PathInformationComponent v-if="isShowPath" style="height: 100%;width: 100%"
                                :graph="graphMap"
                                :graph-data="graphData"
                                :user-data="userData"
                                :sankeyOption="sOption"
                                :selectedList=" this.selectList"
                                :nodes="option.series[0].data"
                                :dag-option="option"/>
    </el-main>
  </el-container>
  <el-dialog
      v-model="isClearSelected"
      title="Tips"
      width="500"
  >
    <span>是否要清除所有选择的结点？</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="ClearSelectedEvent">
          确认
        </el-button>
        <el-button @click="isClearSelected = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.dgaChart {
  height: 32vh;
  border: gray solid 1px;
  border-radius: 10px;
}
.sankeyChart {
  height: 100%;
  width: 100%;
  border: gray solid 1px;
  border-radius: 10px;
}
.nodeList{
  border: gray solid 1px;
  border-radius: 10px;
}
.rightSide {
  border: gray solid 1px;
  border-radius: 10px;
  height: 870px;
}

.tool{
  height: 10%;
  border: gray solid 1px;
  border-radius: 10px;
}
.graphState{
  height: 10%;
  border: gray solid 1px;
  border-radius: 10px;
}
</style>
