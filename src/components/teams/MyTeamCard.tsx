
import React from 'react';
import { Users, Edit2, LogOut, Crown } from 'lucide-react';
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

interface MyTeamCardProps {
  team: Team;
  onEditTeam: (team: Team) => void;
  onLeaveTeam: () => void;
  getTierEmoji: (tier: string) => string;
  getTierColor: (tier: string) => string;
}

const MyTeamCard: React.FC<MyTeamCardProps> = ({ 
  team, 
  onEditTeam, 
  onLeaveTeam, 
  getTierEmoji, 
  getTierColor 
}) => {
  return (
    <Card className="shadow-lg border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            내 팀: {team.name}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditTeam(team)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLeaveTeam}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">주간 목표</p>
          <p className="text-2xl font-bold text-blue-600">{team.weeklyGoal}회</p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            팀원 ({team.members.length}명)
          </h4>
          <div className="space-y-2">
            {team.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={member.profileImage}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm">{getTierEmoji(member.tier)}</span>
                    <span className={`text-xs font-medium ${getTierColor(member.tier)}`}>
                      {member.tier}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">
                    {member.weeklyProgress}/{team.weeklyGoal}
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${Math.min((member.weeklyProgress / team.weeklyGoal) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <p className="text-sm text-yellow-800">
            💰 목표 미달성 시 벌금: <strong>10,000원</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyTeamCard;
