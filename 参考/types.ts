export interface BatteryRecord {
  id: string;
  timestamp: string; // ISO or simple time string e.g., "10:00"
  percentage: number; // 0 - 100
  status: 'discharging' | 'charging' | 'full' | 'standby';
  temperature: number; // °C
  voltage: number; // V
}

export interface RidingRecord {
  id: string;
  date: string; // "2026-05-23" or "05/23"
  distance: number; // km
  calories: number; // kcal
  duration: number; // minutes
  avgSpeed: number; // km/h
  elevationGain: number; // meters
}

export interface HeartRateRecord {
  hour: number; // 0 - 23
  bpm: number;
  speed: number; // km/h (showing correlation between speed and heart rate)
  zone: 'Resting' | 'Warm-up' | 'Fat Burn' | 'Cardio' | 'Peak';
}

export interface DayHeartRate {
  date: string;
  label: string; // e.g. "5月23日 (运动日)"
  data: HeartRateRecord[];
}

// Default battery lifecycle data (last 24 hours with an active charge-discharge cycles)
export const initialBatteryData: BatteryRecord[] = [
  { id: 'b1', timestamp: '04:00', percentage: 95, status: 'standby', temperature: 24, voltage: 4.2 },
  { id: 'b2', timestamp: '06:00', percentage: 94, status: 'standby', temperature: 24, voltage: 4.2 },
  { id: 'b3', timestamp: '07:00', percentage: 93, status: 'discharging', temperature: 25, voltage: 4.15 },
  { id: 'b4', timestamp: '08:00', percentage: 80, status: 'discharging', temperature: 32, voltage: 4.05 }, // active riding
  { id: 'b5', timestamp: '09:00', percentage: 60, status: 'discharging', temperature: 34, voltage: 3.92 }, // active riding
  { id: 'b6', timestamp: '10:00', percentage: 55, status: 'standby', temperature: 29, voltage: 3.90 },
  { id: 'b7', timestamp: '11:00', percentage: 52, status: 'standby', temperature: 27, voltage: 3.89 },
  { id: 'b8', timestamp: '12:00', percentage: 48, status: 'discharging', temperature: 26, voltage: 3.85 },
  { id: 'b9', timestamp: '13:00', percentage: 46, status: 'standby', temperature: 25, voltage: 3.84 },
  { id: 'b10', timestamp: '14:00', percentage: 42, status: 'discharging', temperature: 26, voltage: 3.81 },
  { id: 'b11', timestamp: '15:00', percentage: 38, status: 'standby', temperature: 25, voltage: 3.80 },
  { id: 'b12', timestamp: '16:00', percentage: 30, status: 'discharging', temperature: 31, voltage: 3.75 }, // general tracking
  { id: 'b13', timestamp: '16:30', percentage: 22, status: 'discharging', temperature: 32, voltage: 3.70 },
  { id: 'b14', timestamp: '17:00', percentage: 15, status: 'discharging', temperature: 30, voltage: 3.65 }, // low battery alert
  { id: 'b15', timestamp: '17:15', percentage: 14, status: 'charging', temperature: 31, voltage: 3.78 }, // charger plugged in
  { id: 'b16', timestamp: '17:45', percentage: 45, status: 'charging', temperature: 35, voltage: 3.95 },
  { id: 'b17', timestamp: '18:15', percentage: 75, status: 'charging', temperature: 36, voltage: 4.10 },
  { id: 'b18', timestamp: '18:45', percentage: 92, status: 'charging', temperature: 34, voltage: 4.18 },
  { id: 'b19', timestamp: '19:15', percentage: 100, status: 'full', temperature: 30, voltage: 4.20 },
  { id: 'b20', timestamp: '22:00', percentage: 99, status: 'standby', temperature: 26, voltage: 4.20 },
  { id: 'b21', timestamp: '24:00', percentage: 98, status: 'standby', temperature: 25, voltage: 4.19 },
];

// Default 14-day riding and calorie burn data
export const initialRidingData: RidingRecord[] = [
  { id: 'r1', date: '05-10', distance: 12.5, calories: 340, duration: 35, avgSpeed: 21.4, elevationGain: 120 },
  { id: 'r2', date: '05-11', distance: 18.0, calories: 490, duration: 52, avgSpeed: 20.8, elevationGain: 185 },
  { id: 'r3', date: '05-12', distance: 0, calories: 0, duration: 0, avgSpeed: 0, elevationGain: 0 }, // Rest Day
  { id: 'r4', date: '05-13', distance: 15.2, calories: 410, duration: 45, avgSpeed: 20.3, elevationGain: 140 },
  { id: 'r5', date: '05-14', distance: 22.4, calories: 610, duration: 65, avgSpeed: 20.7, elevationGain: 210 },
  { id: 'r6', date: '05-15', distance: 8.5, calories: 220, duration: 25, avgSpeed: 20.4, elevationGain: 75 },
  { id: 'r7', date: '05-16', distance: 30.1, calories: 850, duration: 90, avgSpeed: 20.1, elevationGain: 340 }, // Weekend workout
  { id: 'r8', date: '05-17', distance: 35.8, calories: 980, duration: 110, avgSpeed: 19.5, elevationGain: 410 }, // Weekend long ride
  { id: 'r9', date: '05-18', distance: 0, calories: 0, duration: 0, avgSpeed: 0, elevationGain: 0 }, // Rest Day
  { id: 'r10', date: '05-19', distance: 14.2, calories: 380, duration: 40, avgSpeed: 21.3, elevationGain: 110 },
  { id: 'r11', date: '05-20', distance: 16.5, calories: 450, duration: 48, avgSpeed: 20.6, elevationGain: 150 },
  { id: 'r12', date: '05-21', distance: 25.0, calories: 720, duration: 72, avgSpeed: 20.8, elevationGain: 280 },
  { id: 'r13', date: '05-22', distance: 15.0, calories: 400, duration: 42, avgSpeed: 21.4, elevationGain: 130 },
  { id: 'r14', date: '05-23', distance: 28.5, calories: 780, duration: 80, avgSpeed: 21.3, elevationGain: 260 }, // Today's ride
];

// Helper to calculate heart rate zone based on bpm
export function getHrZone(bpm: number): HeartRateRecord['zone'] {
  if (bpm < 100) return 'Resting';
  if (bpm < 120) return 'Warm-up';
  if (bpm < 140) return 'Fat Burn';
  if (bpm < 165) return 'Cardio';
  return 'Peak';
}

// Generate complete 24-hour heart rate profiles for demonstration
export const workoutDayHeartRate: HeartRateRecord[] = [
  { hour: 0, bpm: 58, speed: 0, zone: 'Resting' },
  { hour: 1, bpm: 56, speed: 0, zone: 'Resting' },
  { hour: 2, bpm: 55, speed: 0, zone: 'Resting' },
  { hour: 3, bpm: 54, speed: 0, zone: 'Resting' },
  { hour: 4, bpm: 55, speed: 0, zone: 'Resting' },
  { hour: 5, bpm: 57, speed: 0, zone: 'Resting' },
  { hour: 6, bpm: 60, speed: 0, zone: 'Resting' },
  { hour: 7, bpm: 72, speed: 0, zone: 'Resting' },
  { hour: 8, bpm: 115, speed: 18, zone: 'Warm-up' }, // Morning climb/commute started
  { hour: 9, bpm: 152, speed: 28, zone: 'Cardio' },   // High speed cycling
  { hour: 10, bpm: 135, speed: 22, zone: 'Fat Burn' }, // Cycling moderate
  { hour: 11, bpm: 82, speed: 0, zone: 'Resting' },   // Resting at desk
  { hour: 12, bpm: 78, speed: 0, zone: 'Resting' },
  { hour: 13, bpm: 75, speed: 0, zone: 'Resting' },
  { hour: 14, bpm: 72, speed: 0, zone: 'Resting' },
  { hour: 15, bpm: 80, speed: 0, zone: 'Resting' },
  { hour: 16, bpm: 145, speed: 24, zone: 'Cardio' },   // Afternoon intense workout
  { hour: 17, bpm: 172, speed: 32, zone: 'Peak' },     // Sprint challenge peak
  { hour: 18, bpm: 95, speed: 5, zone: 'Resting' },    // Cooldown
  { hour: 19, bpm: 85, speed: 0, zone: 'Resting' },
  { hour: 20, bpm: 78, speed: 0, zone: 'Resting' },
  { hour: 21, bpm: 72, speed: 0, zone: 'Resting' },
  { hour: 22, bpm: 68, speed: 0, zone: 'Resting' },
  { hour: 23, bpm: 62, speed: 0, zone: 'Resting' },
];

export const restDayHeartRate: HeartRateRecord[] = [
  { hour: 0, bpm: 55, speed: 0, zone: 'Resting' },
  { hour: 1, bpm: 54, speed: 0, zone: 'Resting' },
  { hour: 2, bpm: 53, speed: 0, zone: 'Resting' },
  { hour: 3, bpm: 52, speed: 0, zone: 'Resting' },
  { hour: 4, bpm: 51, speed: 0, zone: 'Resting' },
  { hour: 5, bpm: 52, speed: 0, zone: 'Resting' },
  { hour: 6, bpm: 55, speed: 0, zone: 'Resting' },
  { hour: 7, bpm: 62, speed: 0, zone: 'Resting' },
  { hour: 8, bpm: 68, speed: 0, zone: 'Resting' }, // Wake up
  { hour: 9, bpm: 75, speed: 0, zone: 'Resting' }, // Easy walking
  { hour: 10, bpm: 78, speed: 0, zone: 'Resting' },
  { hour: 11, bpm: 72, speed: 0, zone: 'Resting' },
  { hour: 12, bpm: 85, speed: 0, zone: 'Resting' }, // Casual stair climb
  { hour: 13, bpm: 74, speed: 0, zone: 'Resting' },
  { hour: 14, bpm: 70, speed: 0, zone: 'Resting' },
  { hour: 15, bpm: 68, speed: 0, zone: 'Resting' },
  { hour: 16, bpm: 72, speed: 0, zone: 'Resting' },
  { hour: 17, bpm: 76, speed: 0, zone: 'Resting' },
  { hour: 18, bpm: 82, speed: 0, zone: 'Resting' },
  { hour: 19, bpm: 88, speed: 0, zone: 'Resting' }, // Cooking/standing
  { hour: 20, bpm: 74, speed: 0, zone: 'Resting' },
  { hour: 21, bpm: 68, speed: 0, zone: 'Resting' },
  { hour: 22, bpm: 62, speed: 0, zone: 'Resting' },
  { hour: 23, bpm: 58, speed: 0, zone: 'Resting' },
];

export const enduranceRideHeartRate: HeartRateRecord[] = [
  { hour: 0, bpm: 59, speed: 0, zone: 'Resting' },
  { hour: 1, bpm: 58, speed: 0, zone: 'Resting' },
  { hour: 2, bpm: 57, speed: 0, zone: 'Resting' },
  { hour: 3, bpm: 56, speed: 0, zone: 'Resting' },
  { hour: 4, bpm: 55, speed: 0, zone: 'Resting' },
  { hour: 5, bpm: 58, speed: 0, zone: 'Resting' },
  { hour: 6, bpm: 65, speed: 0, zone: 'Resting' },
  { hour: 7, bpm: 85, speed: 5, zone: 'Resting' }, // Commute start
  { hour: 8, bpm: 125, speed: 20, zone: 'Fat Burn' }, // Multi-hour steady ride session
  { hour: 9, bpm: 128, speed: 21, zone: 'Fat Burn' },
  { hour: 10, bpm: 132, speed: 22, zone: 'Fat Burn' },
  { hour: 11, bpm: 130, speed: 21, zone: 'Fat Burn' },
  { hour: 12, bpm: 135, speed: 23, zone: 'Fat Burn' },
  { hour: 13, bpm: 120, speed: 18, zone: 'Warm-up' },
  { hour: 14, bpm: 90, speed: 0, zone: 'Resting' },  // Rest stop & lunch
  { hour: 15, bpm: 82, speed: 0, zone: 'Resting' },
  { hour: 16, bpm: 78, speed: 0, zone: 'Resting' },
  { hour: 17, bpm: 75, speed: 0, zone: 'Resting' },
  { hour: 18, bpm: 72, speed: 0, zone: 'Resting' },
  { hour: 19, bpm: 70, speed: 0, zone: 'Resting' },
  { hour: 20, bpm: 68, speed: 0, zone: 'Resting' },
  { hour: 21, bpm: 66, speed: 0, zone: 'Resting' },
  { hour: 22, bpm: 62, speed: 0, zone: 'Resting' },
  { hour: 23, bpm: 58, speed: 0, zone: 'Resting' },
];

export const initialHeartRateDays: DayHeartRate[] = [
  { date: '2026-05-23', label: '5月23日 (高强度运动日)', data: workoutDayHeartRate },
  { date: '2026-05-22', label: '5月22日 (有氧耐力骑行)', data: enduranceRideHeartRate },
  { date: '2026-05-21', label: '5月21日 (常规休息日)', data: restDayHeartRate },
];
