import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import Card from '../common/Card';
import { UserWithStats } from '../../types';
import { formatDuration } from '../../utils/helpers';

interface LeaderboardCardProps {
  title: string;
  users: UserWithStats[];
  statKey: 'today' | 'thisWeek' | 'overall';
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ 
  title, 
  users, 
  statKey 
}) => {
  // Sort users by the specified stat in descending order
  const sortedUsers = [...users].sort((a, b) => b.stats[statKey] - a.stats[statKey]);
  
  // Determine if there's a winner (first place has more minutes than second place)
  const hasWinner = sortedUsers.length > 1 && sortedUsers[0].stats[statKey] > sortedUsers[1].stats[statKey];
  
  // Determine max value for progress bars
  const maxValue = Math.max(...sortedUsers.map(user => user.stats[statKey]), 1);

  return (
    <Card className="h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
      
      <div className="space-y-6">
        {sortedUsers.map((user, index) => {
          const minutes = user.stats[statKey];
          const percent = Math.min((minutes / maxValue) * 100, 100);
          const bgColor = user.color === 'red-500' ? 'bg-red-500' : 'bg-blue-500';
          const textColor = user.color === 'red-500' ? 'text-red-600' : 'text-blue-600';
          
          return (
            <div key={user.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}>
                    <span className="text-white font-medium text-sm">{user.name[0]}</span>
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
                
                <div className="flex items-center">
                  {hasWinner && index === 0 && (
                    <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                  )}
                  <span className={`font-bold ${textColor}`}>
                    {formatDuration(minutes)}
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-3">
                <motion.div
                  className={`h-3 rounded-full ${bgColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default LeaderboardCard;