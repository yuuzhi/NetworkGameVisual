export const sankeyOption = {
  series: [{
    type: 'sankey',
    layout: 'none',
    selectedMode: 'multiple',
    lineStyle: {
      color: 'gradient',
      curveness: 0.8,
      opacity: 0.2
    },
    emphasis: {
      focus: 'adjacency'
    },
    data: [],
    links: []
  }]
}
