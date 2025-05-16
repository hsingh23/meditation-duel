export interface User {
  id: string;
  email: string;
  name: string;
  color: string;
}

export interface MeditationEntry {
  id: string;
  userId: string;
  date: string;
  hours: number;
  minutes: number;
  totalMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeditationStats {
  today: number;
  thisWeek: number;
  overall: number;
}

export interface UserWithStats extends User {
  stats: MeditationStats;
}