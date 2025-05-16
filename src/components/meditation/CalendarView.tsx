import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MeditationEntry } from '../../types';
import { formatDuration } from '../../utils/helpers';

interface CalendarViewProps {
  entries: MeditationEntry[];
  currentUserId: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ entries, currentUserId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const userEntries = entries.filter(entry => entry.userId === currentUserId);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEntryForDay = (day: Date) => {
    return userEntries.find(entry => isSameDay(new Date(entry.date), day));
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg"> {/* Changed shadow-md to shadow-lg */}
      <div className="flex items-center justify-between mb-6"> {/* Increased mb-4 to mb-6 */}
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition-colors duration-150" /* Enhanced button style */
          aria-label="Previous month"
        >
          <ChevronLeft className="w-6 h-6" /> {/* Increased icon size */}
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-700"> {/* Enhanced title style */}
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition-colors duration-150" /* Enhanced button style */
          aria-label="Next month"
        >
          <ChevronRight className="w-6 h-6" /> {/* Increased icon size */}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px sm:gap-1 bg-gray-200 border border-gray-200 rounded-md overflow-hidden"> {/* Added gap-px, border, rounded-md, overflow-hidden */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 text-xs py-2 bg-gray-50">{day}</div> /* Enhanced day of week style */
        ))}
        {days.map((day) => { // Removed index as it is not used
          const entry = getEntryForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          let cellClasses = "h-20 sm:h-24 lg:h-28 flex flex-col items-center justify-center p-1.5 text-xs sm:text-sm transition-all duration-150 ease-in-out transform hover:scale-105 relative "; /* Increased height, padding, added transition, hover effect, relative positioning */
          
          if (!isCurrentMonth) {
            cellClasses += "bg-gray-100 text-gray-400"; /* Softer color for non-current month days */
          } else if (entry) {
            cellClasses += "bg-green-100 text-green-800 font-semibold hover:bg-green-200"; /* Changed to green for entries, added hover */
          } else {
            cellClasses += "bg-white hover:bg-gray-50"; /* Default white, hover for empty days */
          }
          if (isToday && isCurrentMonth) {
            cellClasses += " ring-2 ring-offset-1 ring-indigo-500 z-10"; /* Enhanced today highlight, added z-index */
          }
          
          // Removed explicit borders, relying on gap-px and bg-gray-200 for grid lines

          return (
            <div key={day.toString()} className={cellClasses}>
              <span className={`absolute top-1.5 right-1.5 text-[10px] sm:text-xs ${isToday && isCurrentMonth ? 'text-indigo-600 font-bold' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </span>
              {entry && isCurrentMonth && (
                <div className="text-center mt-2"> {/* Centered text */}
                  <span className="block text-green-700 text-[10px] sm:text-xs font-medium"> {/* Enhanced entry text */}
                    {formatDuration(entry.totalMinutes)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
