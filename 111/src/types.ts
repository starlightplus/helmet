export interface RoutePoint {
  x: number;          // Relative X on maps (0-100)
  y: number;          // Relative Y on maps (0-100)
  speed: number;      // Speed at this point (km/h)
  elevation: number;  // Elevation in meters
  isOverspeed?: boolean;
  label?: string;     // Checkpoint name
}

export interface SafetyDeduction {
  reason: string;
  deduction: number;
}

export interface CyclingRecord {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  durationSeconds: number; // Total seconds of riding
  distanceKm: number;      // Distance in kilometers
  avgSpeedKmh: number;     // Average speed
  maxSpeedKmh: number;     // Maximum speed
  caloriesBurnt: number;   // Calories burned
  avgTemperature: number;  // Average temperature in celsius
  avgHumidity: number;     // Average humidity in %
  overspeedCount: number;  // Count of speeding incidents
  safetyScore: number;     // 0-100 score
  safetyDeductions: SafetyDeduction[];
  routePoints: RoutePoint[];
  elevationGainM: number;  // Accumulated elevation gain in meters
  difficulty: 'Easy' | 'Medium' | 'Hard';
}
