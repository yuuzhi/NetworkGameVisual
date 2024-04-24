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
    top: '0%',
    bottom: '30%',
    cellSize: ['auto', 'auto'],
    range: '2024',
    yearLabel: { show: false },
    dayLabel: {
      fontSize: 8
    }
  },
  series: {
    type: 'heatmap',
    coordinateSystem: 'calendar',
    data: []
  }
}
