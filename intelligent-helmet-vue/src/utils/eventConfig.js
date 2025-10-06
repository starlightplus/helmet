export const eventDefinitions = [
  { key: 'fallFlag', type: 'fall', name: '摔倒事件', symbol: '⚠', css: 'fall' },
  { key: 'slowFlag', type: 'slow', name: '减速事件', symbol: '🐌', css: 'slow' },
  { key: 'turnLeftFlag', type: 'turn-left', name: '左转事件', symbol: '←', css: 'turn-left' },
  { key: 'turnRightFlag', type: 'turn-right', name: '右转事件', symbol: '→', css: 'turn-right' }
]

export const eventMapByType = eventDefinitions.reduce((m, e) => {
  m[e.type] = e
  return m
}, {})