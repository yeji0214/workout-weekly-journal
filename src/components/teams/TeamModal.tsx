
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface TeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTeam: Team | null;
  newTeam: {
    name: string;
    weeklyGoal: string;
  };
  onTeamChange: (team: { name: string; weeklyGoal: string }) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const TeamModal: React.FC<TeamModalProps> = ({
  open,
  onOpenChange,
  editingTeam,
  newTeam,
  onTeamChange,
  onSubmit,
  onCancel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTeam ? '팀 수정' : '새 팀 만들기'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="teamName">팀 이름</Label>
            <Input
              id="teamName"
              value={newTeam.name}
              onChange={(e) => onTeamChange({ ...newTeam, name: e.target.value })}
              placeholder="예: 아침 러닝 클럽"
            />
          </div>

          <div>
            <Label htmlFor="weeklyGoal">주간 목표 (1-50회)</Label>
            <Input
              id="weeklyGoal"
              type="number"
              min="1"
              max="50"
              value={newTeam.weeklyGoal}
              onChange={(e) => onTeamChange({ ...newTeam, weeklyGoal: e.target.value })}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ 주간 목표를 달성하지 못하면 자동으로 벌금이 부과됩니다.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={onSubmit}
              disabled={!newTeam.name.trim()}
              className="flex-1"
            >
              {editingTeam ? '수정하기' : '만들기'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamModal;
