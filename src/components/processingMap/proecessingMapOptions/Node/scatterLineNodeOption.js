export const scatterLineNodeOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    splitLine: {
      lineStyle: {
        type: 'dashed'
      }
    }
  },
  yAxis: {
    splitLine: {
      lineStyle: {
        type: 'dashed'
      }
    }
  },
  series: [
    {
      name: 'scatter',
      type: 'scatter',
      data: [],
      symbolSize: 5
    },
    {
      name: 'boxplot',
      type: 'boxplot',
      data: []
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
