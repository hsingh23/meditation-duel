import React from 'react';
import { format, eachDayOfInterval, isSameDay, subDays, startOfDay } from 'date-fns';
import { MeditationEntry, UserWithStats } from '../../types'; // Updated to UserWithStats
import { formatDuration } from '../../utils/helpers';

interface MiniCalendarViewProps {
  allEntries: MeditationEntry[];
  displayUser: UserWithStats; // Renamed from currentUser/otherUser logic
  opponentUser?: UserWithStats; // Renamed and made optional
}

const MiniCalendarView: React.FC<MiniCalendarViewProps> = ({ allEntries, displayUser, opponentUser }) => {
  if (!displayUser || !displayUser.uid) {
    // Robust skeleton state
    return (
      <div className="mt-3 mb-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-xs font-medium text-gray-600 mb-2 text-center">Last 7 Days</h4>
        <div className="grid grid-cols-7 gap-1.5 animate-pulse">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-16 sm:h-18 rounded-md bg-gray-200 flex flex-col items-center justify-center">
              <div className="h-2.5 bg-gray-300 rounded w-1/2 mb-1"></div>
              <div className="h-2.5 bg-gray-300 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const today = startOfDay(new Date());
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  const getDailyMeditationData = (day: Date) => {
    const displayUserEntry = allEntries.find(
      (entry) => entry.userId === displayUser.uid && isSameDay(new Date(entry.date), day)
    );
    const displayUserMinutes = displayUserEntry?.totalMinutes || 0;
    
    let didDisplayUserWin = false;
    if (opponentUser && opponentUser.uid) {
      const opponentUserEntry = allEntries.find(
        (entry) => entry.userId === opponentUser.uid && isSameDay(new Date(entry.date), day)
      );
      const opponentUserMinutes = opponentUserEntry?.totalMinutes || 0;
      didDisplayUserWin =  displayUserMinutes >= opponentUserMinutes;
    }

    return {
      minutesToDisplay: displayUserMinutes,
      didWin: didDisplayUserWin,
    };
  };

  return (
    <div className="mt-3 mb-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-xs font-medium text-gray-600 mb-2 text-center">Last 7 Days</h4>
      <div className="grid grid-cols-7 gap-1.5">
        {last7Days.map(day => {
          const { minutesToDisplay, didWin } = getDailyMeditationData(day);
          const isToday = isSameDay(day, today);

          let cellClasses = "h-16 sm:h-18 rounded-md flex flex-col items-center justify-center text-[10px] sm:text-xs leading-tight p-0.5 ";
          
          if (didWin) {
            cellClasses += "bg-yellow-100 border border-yellow-300"; 
          } else if (minutesToDisplay > 0) {
            cellClasses += "bg-indigo-100 text-indigo-700"; 
          } else {
            cellClasses += "bg-white"; 
          }
          
          if (isToday) {
            cellClasses += " ring-2 ring-indigo-500 ring-offset-1";
          }

          return (
            <div key={day.toString()} className={cellClasses}>
              <span className={`text-gray-500 ${isToday ? 'font-bold': ''} ${didWin ? 'text-yellow-700' : ''}`}>{format(day, 'EEE')}</span>
              <span className={`mt-0.5 ${isToday ? 'font-bold': ''} ${didWin ? 'text-yellow-700' : ''}`}>{format(day, 'd')}</span>
              {minutesToDisplay > 0 && (
                <span className={`mt-0.5 text-[9px] sm:text-[10px] ${didWin ? 'text-yellow-800 font-medium' : 'text-indigo-500'}`}>
                  {formatDuration(minutesToDisplay)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendarView;
