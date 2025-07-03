
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Team {
  id: string;
  name: string;
  weeklyGoal: number;
  members: Array<{
    id: string;
    name: string;
    profileImage: string;
    tier: string;
    weeklyProgress: number;
  }>;
}

interface TeamCardProps {
  team: Team;
  onJoinTeam: (teamId: string) => void;
  canJoin: boolean;
  getTierEmoji: (tier: string) => string;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onJoinTeam, canJoin, getTierEmoji }) => {
  return (
    <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-800">{team.name}</h3>
          <p className="text-sm text-gray-600">주간 목표: {team.weeklyGoal}회</p>
          <p className="text-sm text-gray-500">멤버: {team.members.length}명</p>
        </div>
        {canJoin && (
          <Button
            size="sm"
            onClick={() => onJoinTeam(team.id)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            참여하기
          </Button>
        )}
      </div>
      <div className="mt-2">
        <div className="flex flex-wrap gap-1">
          {team.members.map((member) => (
            <div key={member.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
              <span className="text-xs">{getTierEmoji(member.tier)}</span>
              <span className="text-xs font-medium">{member.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
