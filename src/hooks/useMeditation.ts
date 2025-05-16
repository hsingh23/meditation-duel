import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp, 
  getDoc 
} from 'firebase/firestore';
import { db, USER_IDS } from '../firebase/config'; // Import USER_IDS
import { MeditationEntry, User, UserWithStats } from '../types';
import { calculateMeditationStats, calculateTotalMinutes, formatDate } from '../utils/helpers';

export const useMeditation = (currentUser: User | null) => {
  const [entries, setEntries] = useState<MeditationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);

  // Fetch all meditation entries
  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const entriesRef = collection(db, 'meditationEntries');
      const q = query(entriesRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedEntries: MeditationEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEntries.push({
          id: doc.id,
          userId: data.userId,
          date: data.date,
          hours: data.hours,
          minutes: data.minutes,
          totalMinutes: data.totalMinutes,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });
      
      setEntries(fetchedEntries);
      
      // Fetch users and calculate their stats
      const harshUser: User = {
        id: 'harsh',
        uid: USER_IDS.HARSH, // Add Firebase UID
        email: 'hisingh1@gmail.com',
        name: 'Harsh',
        color: 'red-500'
      };
      
      const artaUser: User = {
        id: 'arta',
        uid: USER_IDS.ARTA, // Add Firebase UID
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
  const saveEntry = async (date: string, hours: number, minutes: number) => {
    if (!currentUser || !currentUser.uid) return; // Check for uid
    
    try {
      setLoading(true);
      setError(null);
      
      const totalMinutes = calculateTotalMinutes(hours, minutes);
      const entriesRef = collection(db, 'meditationEntries');
      const q = query(
        entriesRef, 
        where('userId', '==', currentUser.uid), // Use currentUser.uid
        where('date', '==', date)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Create new entry
        await addDoc(entriesRef, {
          userId: currentUser.uid, // Use currentUser.uid
          date,
          hours,
          minutes,
          totalMinutes,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      } else {
        // Update existing entry
        const docRef = doc(db, 'meditationEntries', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          hours,
          minutes,
          totalMinutes,
          updatedAt: Timestamp.now()
        });
      }
      
      // Refresh entries
      await fetchEntries();
      
    } catch (err) {
      console.error('Error saving meditation entry: ', err);
      setError('Failed to save meditation data');
    } finally {
      setLoading(false);
    }
  };

  // Get entry for a specific date
  const getEntryForDate = (date: string): MeditationEntry | null => {
    if (!currentUser || !currentUser.uid) return null; // Check for uid
    
    return entries.find(entry => 
      entry.userId === currentUser.uid && entry.date === date // Use currentUser.uid
    ) || null;
  };

  // Load entries when component mounts
  useEffect(() => {
    fetchEntries();
  }, [currentUser]);

  return {
    entries,
    users,
    loading,
    error,
    saveEntry,
    getEntryForDate,
    refreshEntries: fetchEntries
  };
};

export default useMeditation;