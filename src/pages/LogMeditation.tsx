import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import useMeditation from '../hooks/useMeditation';
import DateSelector from '../components/meditation/DateSelector';
import LogMeditationForm from '../components/meditation/LogMeditationForm';
import { getPreviousDays, formatDuration } from '../utils/helpers';
import CalendarView from '../components/meditation/CalendarView'; // Import CalendarView

const LogMeditation: React.FC = () => {
  // Get the available dates (today and previous 3 days)
  const availableDates = getPreviousDays(4);
  
  // Set the initial selected date to today
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  
  const { user } = useAuth();
  const { loading, getEntryForDate, saveEntry, users, entries } = useMeditation(user); // Add entries here
  
  // Get the existing entry for the selected date
  const existingEntry = getEntryForDate(selectedDate);

  // Find current user's stats
  const currentUserStats = users.find(u => u.id === user?.id)?.stats;
  
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Log Your Meditation</h1>
      
      {currentUserStats && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
          <h2 className="text-lg font-medium text-indigo-700 mb-2">Your Progress</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-gray-600">Today</p>
              <p className="font-bold text-indigo-600 text-lg">{formatDuration(currentUserStats.today)}</p>
            </div>
            <div>
              <p className="text-gray-600">This Week</p>
              <p className="font-bold text-indigo-600 text-lg">{formatDuration(currentUserStats.thisWeek)}</p>
            </div>
            <div>
              <p className="text-gray-600">Overall</p>
              <p className="font-bold text-indigo-600 text-lg">{formatDuration(currentUserStats.overall)}</p>
            </div>
          </div>
        </div>
      )}

      <DateSelector
        dates={availableDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      
      <LogMeditationForm
        date={selectedDate}
        existingEntry={existingEntry}
        onSave={saveEntry}
        loading={loading}
      />

      {user && entries && (
        <div className="mt-8">
          <CalendarView entries={entries} currentUserId={user.uid} />
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Tips for Meditation</h3>
        <ul className="space-y-2 text-gray-600">
          <li>• Start with just 5 minutes if you're new to meditation</li>
          <li>• Find a quiet place where you won't be disturbed</li>
          <li>• Focus on your breath and observe your thoughts without judgment</li>
          <li>• Be consistent - even short daily sessions are beneficial</li>
          <li>• Log your practice immediately after completing it</li>
        </ul>
      </div>
    </div>
  );
};

export default LogMeditation;