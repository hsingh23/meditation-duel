import { format, subDays, startOfWeek, endOfWeek, parseISO, isWithinInterval, getDayOfYear as dateFnsGetDayOfYear, getYear as dateFnsGetYear } from 'date-fns';
import { MeditationEntry, User } from '../types'; // Ensure User is imported
import { USER_IDS } from '../firebase/config';

export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (dateString: string): string => {
  return format(parseISO(dateString), 'MMMM d, yyyy');
};

export const getPreviousDays = (count: number): string[] => {
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = subDays(today, i);
    days.push(formatDate(date));
  }
  
  return days;
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

export const getDayOfYear = (date: Date): number => {
  return dateFnsGetDayOfYear(date);
};

export const getYear = (date: Date): number => {
  return dateFnsGetYear(date);
};

export const calculateTotalMinutes = (hours: number, minutes: number): number => {
  return hours * 60 + minutes;
};

export const formatDuration = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} min`;
  } else if (minutes === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${minutes} min`;
  }
};

export const calculateMeditationStats = (entries: MeditationEntry[], userId: string): { today: number, thisWeek: number, overall: number } => {
  const userEntries = entries.filter(entry => entry.userId === userId); // Corrected filter syntax
  
  // Today's total
  const todayDate = getTodayDate();
  const todayEntry = userEntries.find(entry => entry.date === todayDate);
  const todayTotal = todayEntry ? todayEntry.totalMinutes : 0;
  
  // This week's total
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  
  const thisWeekEntries = userEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
  });
  
  const weeklyTotal = thisWeekEntries.reduce((sum, entry) => sum + entry.totalMinutes, 0);
  
  // Overall total
  const overallTotal = userEntries.reduce((sum, entry) => sum + entry.totalMinutes, 0);
  
  return {
    today: todayTotal,
    thisWeek: weeklyTotal,
    overall: overallTotal
  };
};

export const getUserInfo = (email: string | null, uid: string | null): User | null => { // Add uid parameter
  if (!email || !uid) return null; // Check for uid
  
  if (email === 'hisingh1@gmail.com') {
    return {
      id: USER_IDS.HARSH, // This should be the string 'harsh' to match useMeditation
      uid, // Add uid
      email: 'hisingh1@gmail.com',
      name: 'Harsh',
      color: 'red-500'
    };
  } else if (email === 'karyahartasemesta@gmail.com') {
    return {
      id: USER_IDS.ARTA, // This should be the string 'arta' to match useMeditation
      uid, // Add uid
      email: 'karyahartasemesta@gmail.com',
      name: 'Arta',
      color: 'blue-500'
    };
  }
  
  return null;
};