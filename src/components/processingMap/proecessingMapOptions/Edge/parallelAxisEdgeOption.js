export const parallelAxisEdgeOption = {
  parallel: {
    left: '8%',
    right: '8%',
    bottom: '5%',
    top: '5%',
    containLabel: true
  },
  parallelAxis: [
    { dim: 0, name: 'Price' },
    { dim: 1, name: 'Net Weight' },
  ],
  series: {
    type: 'parallel',
    lineStyle: {
      width: 4
    },
    data: []
  }
}
