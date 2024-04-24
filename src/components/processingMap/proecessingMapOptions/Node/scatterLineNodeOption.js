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
        show: true
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
      borderColor: '#5470c6'
    },
    {
      name: 'line',
      type: 'line',
      smooth: true,
      symbolSize: 0.1,
      symbol: 'circle',
      label: {
        show: true,
        fontSize: 16
      },
      labelLayout: { dx: -20 },
      encode: {
        label: 2,
        tooltip: 1
      }
    }
  ]
}
