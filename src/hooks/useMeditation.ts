import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  setDoc,
  getDoc 
} from 'firebase/firestore';
import { db, USER_IDS } from '../firebase/config';
import { MeditationEntry, User, UserWithStats, YearlyMeditationLog, MeditationFormData } from '../types'; // Import MeditationFormData
import { calculateMeditationStats, formatDate, getDayOfYear, getYear } from '../utils/helpers'; // Removed getTodayDate

export const useMeditation = (currentUser: User | null) => {
  const [entries, setEntries] = useState<MeditationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // New state for save operations
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);

  // Fetch all meditation entries
  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const currentYear = getYear(new Date());
      const yearlyLogDocRef = doc(db, 'meditationLogsByYear', String(currentYear));
      const docSnap = await getDoc(yearlyLogDocRef);

      let yearlyLog: YearlyMeditationLog = {};
      if (docSnap.exists()) {
        yearlyLog = docSnap.data() as YearlyMeditationLog;
      }

      const fetchedEntries: MeditationEntry[] = [];
      for (const userId in yearlyLog) {
        for (const dayOfYear in yearlyLog[userId]) {
          const date = new Date(currentYear, 0); // Start of the year
          date.setDate(parseInt(dayOfYear)); // Set day of year
          fetchedEntries.push({
            id: `${currentYear}-${userId}-${dayOfYear}`,
            userId,
            date: formatDate(date),
            totalMinutes: yearlyLog[userId][dayOfYear] * 60, // Convert hours to minutes
          });
        }
      }

      setEntries(fetchedEntries);

      // Fetch users and calculate their stats
      const harshUser: User = {
        id: 'harsh',
        uid: USER_IDS.HARSH,
        email: 'hisingh1@gmail.com',
        name: 'Harsh',
        color: 'red-500'
      };
      
      const artaUser: User = {
        id: 'arta',
        uid: USER_IDS.ARTA,
        email: 'karyahartasemesta@gmail.com',
        name: 'Arta',
        color: 'blue-500'
      };
      
      const harshStats = calculateMeditationStats(fetchedEntries, USER_IDS.HARSH);
      const artaStats = calculateMeditationStats(fetchedEntries, USER_IDS.ARTA);
      
      setUsers([
        { ...harshUser, stats: harshStats },
        { ...artaUser, stats: artaStats }
      ]);
      
    } catch (err) {
      console.error('Error fetching meditation entries: ', err);
      setError('Failed to load meditation data');
    } finally {
      setLoading(false);
    }
  };

  // Add or update a meditation entry
  const saveEntry = async (dateString: string, hoursInput: number, minutesInput: number) => {
    if (!currentUser || !currentUser.uid) return;
    
    const validHours = Number.isFinite(hoursInput) ? hoursInput : 0;
    const validMinutes = Number.isFinite(minutesInput) ? minutesInput : 0;

    if (validHours < 0 || validMinutes < 0) { // Allow zero for clearing entries
      setError("Meditation time cannot be negative.");
      return;
    }
    
    try {
      setSaving(true); // Use saving state
      setError(null);
      
      const date = new Date(dateString);
      const year = getYear(date);
      const dayOfYear = getDayOfYear(date);
      const totalHours = validHours + validMinutes / 60;
      const totalMinutesForOptimisticUpdate = validHours * 60 + validMinutes;

      // Optimistic update
      const optimisticEntry: MeditationEntry = {
        id: `${year}-${currentUser.uid}-${dayOfYear}`, // Temporary ID, might not be perfect but good for UI
        userId: currentUser.uid,
        date: formatDate(date),
        totalMinutes: totalMinutesForOptimisticUpdate,
      };

      setEntries(prevEntries => {
        const existingIndex = prevEntries.findIndex(
          e => e.userId === currentUser.uid && 
               getYear(new Date(e.date)) === year && 
               getDayOfYear(new Date(e.date)) === dayOfYear
        );
        if (existingIndex !== -1) {
          const updatedEntries = [...prevEntries];
          updatedEntries[existingIndex] = optimisticEntry;
          return updatedEntries;
        }
        return [...prevEntries, optimisticEntry];
      });
      
      // Recalculate stats optimistically
      const updatedUsers = users.map(u => {
        if (u.uid === currentUser.uid) {
          // This is a simplified optimistic update for stats. 
          // A more accurate one would re-run calculateMeditationStats with the new optimistic entries.
          // For now, we'll just update the local state and rely on fetchEntries for the final accurate state.
          const tempEntries = entries.filter(e => e.userId !== currentUser.uid);
          const currentUserEntries = entries.filter(e => e.userId === currentUser.uid);
          const existingOptimisticIndex = currentUserEntries.findIndex(
            e => getYear(new Date(e.date)) === year && getDayOfYear(new Date(e.date)) === dayOfYear
          );
          if (existingOptimisticIndex !== -1) {
            currentUserEntries[existingOptimisticIndex] = optimisticEntry;
          } else {
            currentUserEntries.push(optimisticEntry);
          }
          const newStats = calculateMeditationStats([...tempEntries, ...currentUserEntries], currentUser.uid);
          return { ...u, stats: newStats };
        }
        return u;
      });
      setUsers(updatedUsers);


      const yearlyLogDocRef = doc(db, 'meditationLogsByYear', String(year));
      
      const docSnap = await getDoc(yearlyLogDocRef);
      let yearlyLog: YearlyMeditationLog = {};
      if (docSnap.exists()) {
        yearlyLog = docSnap.data() as YearlyMeditationLog;
      }

      if (!yearlyLog[currentUser.uid]) {
        yearlyLog[currentUser.uid] = {};
      }
      yearlyLog[currentUser.uid][dayOfYear] = totalHours;

      await setDoc(yearlyLogDocRef, yearlyLog, { merge: true });
      
      // Refresh entries to get final consistent state
      await fetchEntries();
      
    } catch (err) {
      console.error('Error saving meditation entry: ', err);
      setError('Failed to save meditation data');
      // Optionally, revert optimistic update here if needed by re-fetching or restoring previous state
      await fetchEntries(); // Re-fetch to ensure UI consistency on error
    } finally {
      setSaving(false); // Use saving state
    }
  };

  // Get entry for a specific date
  const getEntryForDate = (dateString: string): MeditationFormData | null => {
    if (!currentUser || !currentUser.uid) return null;

    const date = new Date(dateString);
    const year = getYear(date);
    const dayOfYear = getDayOfYear(date);
    
    const foundEntry = entries.find(e => 
      e.userId === currentUser.uid && 
      getYear(new Date(e.date)) === year && 
      getDayOfYear(new Date(e.date)) === dayOfYear
    );

    if (foundEntry) {
      const totalMinutes = foundEntry.totalMinutes;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return { ...foundEntry, hours, minutes };
    }
    return null;
  };

  // Load entries when component mounts
  useEffect(() => {
    if (currentUser) { 
      fetchEntries();
    } else {
      setLoading(false); // If no user, stop loading
      setEntries([]);
      setUsers([]);
    }
  }, [currentUser]);

  return {
    entries,
    users,
    loading,
    saving, // Expose saving state
    error,
    saveEntry,
    getEntryForDate,
    refreshEntries: fetchEntries
  };
};

export default useMeditation;