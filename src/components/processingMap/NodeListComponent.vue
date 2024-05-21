<script>
import NodeElementComponent from '@/components/processingMap/NodeElementComponent.vue'
import { ref } from 'vue'
export default {
  name: 'NodeListComponent',
  components: {
    NodeElementComponent: NodeElementComponent
  },
  props: {
    nodes: Object,
    selectedList: Array,
    sankeyOption: Object
  },
  watch: {
    selectedList: {
      handler () {
        // console.log('selectedList，', this.selectedList)
        this.$refs.NodeList.forEach(x => {
          x.isChecked = false
        })
        this.selectedList.forEach(x => {
          this.$refs.NodeList[x.dataIndexInside].isChecked = true
          // console.log(this.$refs.NodeList[x.dataIndexInside].isChecked)
        })
      },
      deep: true
    }
  }
}
</script>

<template>
  <div style="height: 32vh;width: 100%">
    <div style="height: 2vh;width: 100%;padding: 10px">
      <el-text style="font-size: large;align-items: center;" tag="b">结点列表</el-text>
    </div>
    <div style="height: 1vh"></div>
    <el-scrollbar height="26vh" >
      <div>
        <NodeElementComponent v-for="(nodes,index) in nodes"
                              :key="index"
                              :name="nodes.name"
                              :index="index" ref="NodeList"/>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped>
</style>
