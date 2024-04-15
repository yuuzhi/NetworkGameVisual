export const mainOption = {
  title: {},
  tooltip: {},
  dataZoom: {
    type: 'inside',
    id: 0,
    disabled: false,
  },
  toolbox: {
    show: true,
    feature: {
      dataView: true
    }
  },
  animationDurationUpdate: 1500,
  animationEasingUpdate:
    'quinticInOut',
  series:
    [
      {
        type: 'graph',
        layout: 'none',
        symbolSize: 20,
        selectedMode: 'multiple',
        select: {
          itemStyle: {
            color: '#fc5185'
          }
        },
        roam: true,
        lineStyle: {
          color: 'source'
        },
        scaleLimit: {
          min: 1
        },
        categories: [
          {
            name: '0',
            symbol: 'diamond',
          },
          {
            name: '1',
            symbol: 'circle',
            symbolSize: 0,
          },
          {
            name: '2',
            symbol: 'rect',
            symbolSize: 0,
          },
          {
            name: '3',
            symbol: 'roundRect',
            symbolSize: 0,
          },
          {
            name: '4',
            symbol: 'roundRect',
            symbolSize: 0,
          },
          {
            name: '5',
            symbol: 'circle',
          },
          {
            name: '6',
            symbol: 'roundRect',
            symbolSize: 0,
          },
          {
            name: '7',
            symbol: 'roundRect',
            symbolSize: 0,
          },
        ],
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [5, 5],
        edgeLabel: {
          fontSize: 100
        },
        data: [],
        links: [],
      }
    ]
}
