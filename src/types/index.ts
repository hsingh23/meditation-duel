export interface User {
  id: string; // This can be 'harsh' or 'arta'
  uid: string; // Firebase auth UID
  email: string;
  name: string;
  color: string;
}

export interface MeditationEntry {
  id: string; // docId will be year-userId-dayOfYear
  userId: string;
  date: string; // YYYY-MM-DD
  totalMinutes: number;
}

export interface MeditationFormData extends MeditationEntry {
  hours: number;
  minutes: number;
}

export interface YearlyMeditationLog {
  [userId: string]: {
    [dayOfYear: number]: number; // dayOfYear: 1-366, value: hours (float)
  };
}

export interface MeditationStats {
  today: number;
  thisWeek: number;
  overall: number;
}

export interface UserWithStats extends User {
  stats: MeditationStats;
}