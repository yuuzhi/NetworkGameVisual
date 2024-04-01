export const mainOption = {
  title: {},
  tooltip: {},
  dataZoom: {
    type: 'inside',
    id: 0,
    disabled: false,
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
        select: {},
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
            itemStyle: {
              color: '#5470c6'
            }
          },
          {
            name: '1',
            symbol: 'circle',
            itemStyle: {
              color: '#91cc75'
            }
          },
          {
            name: '2',
            symbol: 'rect',
            itemStyle: {
              color: '#fac858'
            }
          },
          {
            name: '3',
            symbol: 'roundRect',
            itemStyle: {
              color: '#ee6666'
            }
          },
          {
            name: '4',
            symbol: 'roundRect',
            itemStyle: {
              color: '#73c0de'
            }
          },
          {
            name: '5',
            symbol: 'circle',
            itemStyle: {
              color: '#3ba272'
            }
          },
          {
            name: '6',
            symbol: 'roundRect',
            itemStyle: {
              color: '#fc8452'
            }
          },
          {
            name: '7',
            symbol: 'roundRect',
            itemStyle: {
              color: '#9a60b4'
            }
          },
        ],
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [10, 10],
        edgeLabel: {
          fontSize: 100
        },
        data: [],
        links: [],
      }
    ]
}
