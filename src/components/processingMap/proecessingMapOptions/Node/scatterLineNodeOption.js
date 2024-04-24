export const scatterLineNodeOption = {
  tooltip: {
    // trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  grid: {
    left: '5%',
    right: '5%',
    bottom: '5%',
    top: '5%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: [],
    splitLine: {
      lineStyle: {
        type: 'dashed',
        show: true
      }
    }
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        type: 'dashed',
      }
    }
  },
  series: [
    {
      name: 'scatter',
      type: 'scatter',
      data: [],
      symbolSize: 5,
    },
    {
      name: 'boxplot',
      type: 'boxplot',
      data: [],
      z: 0,
    },
    {
      name: 'line',
      type: 'line',
      data: [],
      showSymbol: false
    }
  ]
}
