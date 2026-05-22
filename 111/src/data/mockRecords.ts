import { CyclingRecord } from '../types';

export const MOCK_RECORDS: CyclingRecord[] = [
  {
    id: 'rec-1',
    title: '崇明岛沿江风光耐力骑行 🚴‍♂️',
    date: '2026-05-18',
    startTime: '07:30',
    endTime: '11:30',
    durationSeconds: 14400, // 4 hours
    distanceKm: 88.5,
    avgSpeedKmh: 26.54,
    maxSpeedKmh: 41.2,
    caloriesBurnt: 1650,
    avgTemperature: 21.5,
    avgHumidity: 68,
    overspeedCount: 2,
    safetyScore: 92,
    elevationGainM: 85,
    difficulty: 'Hard',
    safetyDeductions: [
      { reason: '绿道限速段轻微超速 (实测 32.5km/h，限速 30km/h)', deduction: -5 },
      { reason: '下坡路段过弯振幅偏大', deduction: -3 }
    ],
    routePoints: [
      { x: 10, y: 70, speed: 18, elevation: 5, label: '出发点：新河码头' },
      { x: 18, y: 65, speed: 25, elevation: 6 },
      { x: 28, y: 55, speed: 28, elevation: 8, label: '东平国家森林公园' },
      { x: 42, y: 35, speed: 32, elevation: 12, isOverspeed: true }, // Speeding
      { x: 55, y: 25, speed: 26, elevation: 7, label: '中途补给站' },
      { x: 68, y: 30, speed: 29, elevation: 9 },
      { x: 78, y: 45, speed: 33, elevation: 10, isOverspeed: true }, // Speeding
      { x: 85, y: 58, speed: 24, elevation: 5, label: '西沙国家湿地公园' },
      { x: 70, y: 75, speed: 26, elevation: 5 },
      { x: 50, y: 80, speed: 27, elevation: 4 },
      { x: 30, y: 82, speed: 22, elevation: 5 },
      { x: 10, y: 70, speed: 12, elevation: 5, label: '终点：新河码头' }
    ]
  },
  {
    id: 'rec-2',
    title: '世纪公园夜骑夜空突围赛 🌃',
    date: '2026-05-20',
    startTime: '19:45',
    endTime: '21:15',
    durationSeconds: 5400, // 1.5 hours
    distanceKm: 34.2,
    avgSpeedKmh: 28.1,
    maxSpeedKmh: 44.5,
    caloriesBurnt: 820,
    avgTemperature: 19.2,
    avgHumidity: 80,
    overspeedCount: 4,
    safetyScore: 82,
    elevationGainM: 15,
    difficulty: 'Medium',
    safetyDeductions: [
      { reason: '多次在汇流闸口超速 (实测最高 44.5km/h)', deduction: -12 },
      { reason: '有一次高频点刹过猛 (重力加速度检测异常)', deduction: -6 }
    ],
    routePoints: [
      { x: 30, y: 20, speed: 20, elevation: 10, label: '一号门大广场' },
      { x: 55, y: 15, speed: 31, elevation: 11 },
      { x: 80, y: 25, speed: 38, elevation: 12, isOverspeed: true },
      { x: 90, y: 50, speed: 34, elevation: 10 },
      { x: 82, y: 75, speed: 44.5, elevation: 11, isOverspeed: true }, // Fast
      { x: 60, y: 85, speed: 29, elevation: 9, label: '芳花园水上长廊' },
      { x: 35, y: 80, speed: 36, elevation: 10, isOverspeed: true },
      { x: 15, y: 65, speed: 25, elevation: 12 },
      { x: 10, y: 40, speed: 41, elevation: 11, isOverspeed: true },
      { x: 30, y: 20, speed: 18, elevation: 10, label: '冲刺终点' }
    ]
  },
  {
    id: 'rec-3',
    title: '莫干山云端竹海爬坡挑战 ⛰️',
    date: '2026-05-21',
    startTime: '09:15',
    endTime: '12:45',
    durationSeconds: 12600, // 3.5 hours
    distanceKm: 45.0,
    avgSpeedKmh: 15.2,
    maxSpeedKmh: 52.8,
    caloriesBurnt: 1280,
    avgTemperature: 16.8,
    avgHumidity: 88,
    overspeedCount: 1,
    safetyScore: 95,
    elevationGainM: 720,
    difficulty: 'Hard',
    safetyDeductions: [
      { reason: '下坡路段偶发单弯配速略快 (52.8km/h)', deduction: -5 }
    ],
    routePoints: [
      { x: 15, y: 85, speed: 12, elevation: 120, label: '山脚景区正门' },
      { x: 22, y: 78, speed: 14, elevation: 190 },
      { x: 30, y: 75, speed: 10, elevation: 280, label: '剑池飞瀑补给站' },
      { x: 35, y: 62, speed: 8, elevation: 410 },
      { x: 45, y: 50, speed: 7, elevation: 550, label: '芦花荡公园' },
      { x: 60, y: 42, speed: 9, elevation: 690 },
      { x: 75, y: 30, speed: 11, elevation: 780, label: '大坑景区观景台 (顶峰)' },
      { x: 80, y: 48, speed: 52.8, elevation: 610, isOverspeed: true }, // Fast Descent
      { x: 85, y: 62, speed: 45, elevation: 420 },
      { x: 70, y: 78, speed: 36, elevation: 250, label: '后山竹海秘境' },
      { x: 45, y: 90, speed: 25, elevation: 150 },
      { x: 15, y: 85, speed: 15, elevation: 120, label: '返程终点' }
    ]
  }
];
