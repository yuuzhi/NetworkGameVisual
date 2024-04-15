import * as echarts from 'echarts'

function getVirtualData (year) {
  const date = +echarts.time.parse(year + '-01-01')
  const end = +echarts.time.parse(+year + 1 + '-01-01')
  const dayTime = 3600 * 24 * 1000
  const data = []
  for (let time = date; time < end; time += dayTime) {
    data.push([
      echarts.time.format(time, '{yyyy}-{MM}-{dd}', false),
      Math.floor(Math.random() * 10000)
    ])
  }
  return data
}

export const dateHeatMapOverviewOption = {
  tooltip: {},
  visualMap: {
    min: 0,
    max: 10000,
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
    data: getVirtualData('2024')
  }
}
