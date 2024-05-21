<script>
export default {
  name: 'GraphStateComponent',
  data () {
    return {
      radio: 'default',
      input: ''
    }
  },
  methods: {
    SelectChangedEvent () {
      this.$emit('SelectChangedEvent', this.radio)
    },
    InputCheckedEvent () {
      if (this.input.length === 10) {
        this.$emit('InputCheckedEvent', this.input)
      } else {
        this.$emit('InputCheckedEvent', -1)
      }
    }
  }
}
</script>

<template>
  <div style="height: 8vh;width: 100%;padding: 10px">
    <el-text style="font-size: large;align-items: center;" tag="b">拓扑图状态</el-text>
    <div style="height: 1vh"></div>
    <el-row>
      <el-col :span="13">
        <el-radio-group v-model="radio" size="large" style="width: 100%" fill=#364f6b @change="this.SelectChangedEvent">
          <el-radio-button label="默认状态" value="default"/>
          <el-radio-button label="展示所选结点后所有可能的路径" value="remainPath"/>
          <el-radio-button label="展示指定记录的路径" value="onePath"/>
        </el-radio-group>
      </el-col>
      <el-col :span="8">
        <el-input  v-model="input"
                   style="width: 240px"
                   size="large"
                   maxlength="10"
                   show-word-limit
                   placeholder="请输入10位记录序号"
                   :clearable=true
                   @change="this.InputCheckedEvent"></el-input>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>

</style>
