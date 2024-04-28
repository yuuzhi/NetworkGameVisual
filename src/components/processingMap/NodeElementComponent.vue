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
  methods: {
    SelectedChangedEvent () {
      // console.log(this.name)
    },
    Checked () {
      this.isChecked = true
    }
  }
}
</script>

<template>
    <el-checkbox class="checkButton"  size="large" border @change="SelectedChangedEvent" :checked="isChecked">
      {{name}}
    </el-checkbox>
</template>

<style scoped>
.checkButton{
  width: 100%;
  text-align: right;
}

</style>
