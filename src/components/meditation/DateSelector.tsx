import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  dates,
  selectedDate,
  onSelectDate
}) => {
  // Find the index of the selected date
  const selectedIndex = dates.findIndex(date => date === selectedDate);
  
  // Check if we can navigate previous/next
  const canGoBack = selectedIndex < dates.length - 1;
  const canGoForward = selectedIndex > 0;
  
  const handlePrevious = () => {
    if (canGoBack) {
      onSelectDate(dates[selectedIndex + 1]);
    }
  };
  
  const handleNext = () => {
    if (canGoForward) {
      onSelectDate(dates[selectedIndex - 1]);
    }
  };
  
  // Function to format the date for display
  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={handlePrevious}
        disabled={!canGoBack}
        className={`p-2 rounded-full ${
          canGoBack
            ? 'text-gray-700 hover:bg-gray-100'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Previous date"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-800">
          {formatDateDisplay(selectedDate)}
        </h2>
        {selectedIndex === 0 && <span className="text-sm text-indigo-600">Today</span>}
      </div>
      
      <button
        onClick={handleNext}
        disabled={!canGoForward}
        className={`p-2 rounded-full ${
          canGoForward
            ? 'text-gray-700 hover:bg-gray-100'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        aria-label="Next date"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default DateSelector;