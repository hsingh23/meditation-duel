import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { formatDisplayDate } from '../../utils/helpers';
import { MeditationFormData } from '../../types'; // Import MeditationFormData
import { Clock, Save, Loader } from 'lucide-react';

interface LogMeditationFormProps {
  date: string;
  existingEntry: MeditationFormData | null; // Use MeditationFormData
  onSave: (date: string, hours: number, minutes: number) => Promise<void>;
  isSaving: boolean; // Changed from loading to isSaving
  simplified?: boolean; // Add simplified prop
}

const LogMeditationForm: React.FC<LogMeditationFormProps> = ({
  date,
  existingEntry,
  onSave,
  isSaving, // Changed from loading to isSaving
  simplified = false, // Default to false
}) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Set initial values if there's an existing entry
  useEffect(() => {
    if (existingEntry) {
      setHours(existingEntry.hours || 0); // Ensure fallback to 0 if undefined
      setMinutes(existingEntry.minutes || 0); // Ensure fallback to 0 if undefined
    } else {
      setHours(0);
      setMinutes(0);
    }
  }, [existingEntry, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure hours and minutes are numbers and not NaN
    const validHours = Number.isFinite(hours) ? hours : 0;
    const validMinutes = Number.isFinite(minutes) ? minutes : 0;
    await onSave(date, validHours, validMinutes);
  };

  if (simplified) {
    return (
      <Card className="py-4 px-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              id="hours"
              min="0"
              max="24"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value) || 0)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2"
              placeholder="Hours"
            />
            <input
              type="number"
              id="minutes"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2"
              placeholder="Minutes"
            />
            <Button
              type="submit"
              disabled={isSaving} // Use isSaving
              size="sm" // Smaller button for simplified view
              className="flex items-center gap-1.5 whitespace-nowrap"
            >
              {isSaving ? ( // Use isSaving
                <Loader className="animate-spin h-4 w-4" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Log
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-800 mb-1">Log Meditation</h2>
      <p className="text-gray-600 mb-4">{formatDisplayDate(date)}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <div className="w-full">
            <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
              Hours
            </label>
            <input
              type="number"
              id="hours"
              min="0"
              max="24"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div className="w-full">
            <label htmlFor="minutes" className="block text-sm font-medium text-gray-700 mb-1">
              Minutes
            </label>
            <input
              type="number"
              id="minutes"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center text-gray-700">
            <Clock className="w-5 h-5 mr-1" />
            <span>
              {hours > 0 && `${hours} ${hours === 1 ? 'hour' : 'hours'}`}
              {hours > 0 && minutes > 0 && ' and '}
              {minutes > 0 && `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`}
              {hours === 0 && minutes === 0 && 'No time logged'}
            </span>
          </div>
          
          <Button
            type="submit"
            disabled={isSaving} // Use isSaving
            className="flex items-center gap-2"
          >
            {isSaving ? ( // Use isSaving
              <>
                <Loader className="animate-spin h-4 w-4" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default LogMeditationForm;