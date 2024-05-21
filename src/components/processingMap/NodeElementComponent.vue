<script>
export default {
  name: 'NodeElementComponent',
  props: {
    name: String,
    index: Number,
  },
  data () {
    return {
      isChecked: false
    }
  },
  watch: {
    isChecked () {
      // console.log(this.isChecked)
      this.$refs.checkbox.$forceUpdate()
    }
  },
  methods: {
    SelectedChangedEvent () {
      // console.log(this.name)
    }
  }
}
</script>

<template>
    <el-checkbox class="checkButton"  size="large" border v-model="this.isChecked" ref="checkbox">
      {{name}}
    </el-checkbox>
</template>

<style scoped>
.checkButton{
  width: 100%;
  text-align: right;
}

</style>
