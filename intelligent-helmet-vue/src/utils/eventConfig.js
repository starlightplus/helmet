export const eventDefinitions = [
  { key: 'fallFlag', type: 'fall', name: '摔倒事件', symbol: '⚠', css: 'fall' }
]

export const eventMapByType = eventDefinitions.reduce((m, e) => {
  m[e.type] = e
  return m
}, {})