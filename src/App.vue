<template>
  <div class="common-layout" id="app">
    <el-container style="height: 100%">
      <el-header>
        <BaseHeader/>
      </el-header>
      <el-container>
        <div class="aside">
          <!--          <el-aside>-->
          <!--            <BaseSide/>-->
          <!--          </el-aside>-->
        </div>
        <el-main class="main">
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import BaseHeader from '@/components/layouts/BaseHeader.vue'
import BaseSide from '@/components/layouts/BaseSide.vue'
import ECharts from 'vue-echarts' // 在 webpack 环境下指向 components/ECharts.vue

// 解决ERROR ResizeObserver loop completed with undelivered notifications.
//问题的
const debounce = (fn, delay) => {

  let timer = null

  return function () {

    let context = this

    let args = arguments

    clearTimeout(timer)

    timer = setTimeout(function () {

      fn.apply(context, args)

    }, delay)

  }

}

// 解决ERROR ResizeObserver loop completed with undelivered notifications.

//问题的

const _ResizeObserver = window.ResizeObserver

window.ResizeObserver = class ResizeObserver extends _ResizeObserver {

  constructor (callback) {

    callback = debounce(callback, 16)

    super(callback)

  }

}
export default {
  name: 'App',
  components: {
    // BaseSide,
    BaseHeader
  }
}
</script>

<style>
:deep(.el-container) {
  height: 100%;
  margin: 0;
  padding: 0;
}

.aside {
  //width: 160px;
  color: #dce6df;
  overflow: hidden;
}

:deep(.el-aside) {
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
}

.main {
  width: max-content;
  padding: 0;
}


</style>
