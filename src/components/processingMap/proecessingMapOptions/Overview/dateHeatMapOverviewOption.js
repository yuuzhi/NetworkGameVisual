import * as echarts from 'echarts'

export const dateHeatMapOverviewOption = {
  tooltip: {},
  visualMap: {
    min: 0,
    max: 100,
    type: 'piecewise',
    orient: 'horizontal',
    left: 'center',
  },
  calendar: {
    left: '10%',
    right: '10%',
    top: '20%',
    bottom: '20%',
    cellSize: ['auto', 'auto'],
    range: '2024',
    yearLabel: { show: false }
  },
  series: {
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: []
  }
}
