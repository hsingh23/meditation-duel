import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import useMeditation from '../hooks/useMeditation';
import LeaderboardCard from '../components/meditation/LeaderboardCard';
import LogMeditationForm from '../components/meditation/LogMeditationForm';
import { formatDuration, getPreviousDays } from '../utils/helpers';
import { Medal } from 'lucide-react';
import MiniCalendarView from '../components/meditation/MiniCalendarView';

const Leaderboard: React.FC = () => {
  const { user: currentUser } = useAuth(); // Renamed to currentUser for clarity
  const { users, loading, refreshEntries, saveEntry, getEntryForDate, entries } = useMeditation(currentUser); 

  // Get today's date for the simplified log form
  const todayDate = getPreviousDays(1)[0];

  useEffect(() => {
    // Refresh entries when component mounts
    refreshEntries();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate total meditation time for all users
  const totalMeditationMinutes = users.reduce((sum, user) => sum + user.stats.overall, 0);
  
  // Sort users by overall meditation time
  const sortedUsers = [...users].sort((a, b) => b.stats.overall - a.stats.overall);
  
  // Get existing entry for today for the current user for the simplified form
  const existingEntryForToday = currentUser ? getEntryForDate(todayDate) : null;

  return (
    <div className="space-y-8">
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Meditation Challenge</h1>
        <p className="text-gray-600">
          Total meditation time: <span className="font-medium">{formatDuration(totalMeditationMinutes)}</span>
        </p>
      </motion.div>

      {/* Log Meditation Form (Simplified for today) */} 
      {currentUser && (
        <div className="mb-8 px-4 py-3 bg-white shadow rounded-lg">
          <h2 className="text-md font-semibold text-gray-700 mb-2 text-left">Log Today's Meditation</h2>
          <LogMeditationForm 
            date={todayDate} 
            existingEntry={existingEntryForToday} 
            onSave={saveEntry} 
            loading={loading} 
            simplified={true} // Use simplified version
          />
        </div>
      )}
      
      {users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LeaderboardCard 
            title="Today" 
            users={users} 
            statKey="today" 
          />
          <LeaderboardCard 
            title="This Week" 
            users={users} 
            statKey="thisWeek" 
          />
          <LeaderboardCard 
            title="Overall" 
            users={users} 
            statKey="overall" 
          />
        </div>
      )}
      
      <motion.div
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Medal className="w-5 h-5 mr-2 text-yellow-500" />
          Meditation Champions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sortedUsers.map((u, index) => {
            const bgColor = u.color === 'red-500' ? 'bg-red-100' : 'bg-blue-100';
            const borderColor = u.color === 'red-500' ? 'border-red-300' : 'border-blue-300';
            const textColor = u.color === 'red-500' ? 'text-red-700' : 'text-blue-700';
            
            // Determine the opponent user for the MiniCalendarView
            let opponent: UserWithStats | undefined = undefined;
            if (currentUser && u.uid !== currentUser.uid) { // if the displayed user (u) is not the logged-in user
              opponent = currentUser as UserWithStats; // The logged-in user is the opponent
            } else if (currentUser && u.uid === currentUser.uid) { // if the displayed user (u) IS the logged-in user
              // Find the other user from sortedUsers who is not the currentUser
              opponent = sortedUsers.find(su => su.uid !== currentUser.uid);
            }
            // If there's only one user in total, or currentUser is null, opponent will remain undefined, which is handled by MiniCalendarView

            return (
              <motion.div
                key={u.id}
                className={`p-6 rounded-xl border ${borderColor} ${bgColor}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * (index + 1), duration: 0.4 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full bg-${u.color} flex items-center justify-center mr-4`}>
                      <span className="text-white font-bold text-xl">{u.name[0]}</span>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold">{u.name}</h3>
                      <p className={`${textColor} font-medium`}>
                        {formatDuration(u.stats.overall)} total
                      </p>
                    </div>
                  </div>
                  
                  {index === 0 && u.stats.overall > 0 && (
                    <div className="bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-yellow-800 font-bold">1</span>
                    </div>
                  )}
                </div>
                
                {/* Mini Calendar View */}
                {entries && (
                  <MiniCalendarView 
                    allEntries={entries} 
                    displayUser={u} 
                    opponentUser={opponent} 
                  />
                )}

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Today</p>
                    <p className="font-medium">{formatDuration(u.stats.today)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">This Week</p>
                    <p className="font-medium">{formatDuration(u.stats.thisWeek)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;