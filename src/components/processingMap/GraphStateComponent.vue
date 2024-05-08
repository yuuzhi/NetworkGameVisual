<script>
export default {
  name: 'GraphStateComponent',
  data () {
    return {
      radio: 'default'
    }
  }
}
</script>

<template>
  <div  style="height: 8vh;width: 100%;padding: 10px" >
    <el-text style="font-size: large;align-items: center;" tag="b">拓扑图状态</el-text>
    <div style="height: 1vh"></div>
    <el-radio-group v-model="radio" size="large" style="width: 100%" fill=#364f6b>
      <el-radio-button label="默认状态" value="default"/>
      <el-radio-button label="展示所选结点后所有可能的路径" value="remainPath" />
      <el-radio-button label="展示当前记录的路径" value="onePath" />
    </el-radio-group>
  </div>
</template>

<style scoped>

</style>
