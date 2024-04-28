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
        this.$refs.NodeList.forEach(x => {
          if (this.selectedList.find(selected => x.name === this.sankeyOption.series[0].data[selected.dataIndexInside].name) !== undefined) {
            console.log(x)
          }
        })
      },
      deep: true
    }
  }
}
</script>

<template>
  <el-scrollbar height="45vh" >
    <div>
      <NodeElementComponent v-for="(nodes,index) in nodes"
                            :key="index"
                            :name="nodes.name"
                            :index="index" ref="NodeList"/>
    </div>

  </el-scrollbar>

</template>

<style scoped>
.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  margin: 10px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
:deep(.el-scrollbar__wrap ){
  overflow-x: hidden !important;
}
:deep(.el-scrollbar__bar.is-horizontal) {
  height: 0 !important;
}

</style>
