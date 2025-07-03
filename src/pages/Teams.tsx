import React, { useState, useEffect } from 'react';
import { Plus, Users, Globe, Edit2, LogOut, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  weeklyGoal: number;
  password?: string;
  members: Array<{
    id: string;
    name: string;
    profileImage: string;
    tier: string;
    weeklyProgress: number;
  }>;
}

interface UserProfile {
  name: string;
  profileImage: string;
  bankAccount: string;
  tier: string;
  totalWorkouts: number;
}

const Teams = () => {
  const { toast } = useToast();
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [newTeam, setNewTeam] = useState({
    name: '',
    weeklyGoal: '3',
    password: ''
  });
  const [profile, setProfile] = useState<UserProfile>({
    name: '나',
    profileImage: '/placeholder.svg',
    bankAccount: '',
    tier: 'Bronze 5',
    totalWorkouts: 0
  });

  useEffect(() => {
    loadTeams();
    loadProfile();
  }, []);

  const loadTeams = () => {
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      const teams = JSON.parse(savedTeams);
      const myTeam = teams.find((team: Team) => 
        team.members.some(member => member.id === 'current-user')
      );
      setMyTeam(myTeam || null);
      setAvailableTeams(teams.filter((team: Team) => team.id !== myTeam?.id));
    } else {
      setAvailableTeams([]);
      setMyTeam(null);
    }
  };

  const loadProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
    }
  };

  const handleSubmit = () => {
    if (!newTeam.name.trim() || !newTeam.password?.trim()) return;

    const team: Team = {
      id: editingTeam?.id || `team-${Date.now()}`,
      name: newTeam.name.trim(),
      weeklyGoal: parseInt(newTeam.weeklyGoal),
      password: newTeam.password,
      members: editingTeam?.members || [{
        id: 'current-user',
        name: profile.name,
        profileImage: profile.profileImage,
        tier: profile.tier,
        weeklyProgress: 0
      }]
    };

    let updatedTeams;
    if (editingTeam) {
      updatedTeams = availableTeams.map(t => t.id === editingTeam.id ? team : t);
    } else {
      updatedTeams = [team, ...availableTeams];
    }

    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    loadTeams();
    
    setNewTeam({ name: '', weeklyGoal: '3', password: '' });
    setEditingTeam(null);
    setShowModal(false);
    toast({
      title: editingTeam ? "팀 정보 수정 완료" : "새 팀 생성 완료",
      description: editingTeam ? "팀 정보가 수정되었습니다." : "새로운 팀이 생성되었습니다.",
    });
  };

  const handleJoinTeam = (teamId: string) => {
    setJoiningTeamId(teamId);
    setShowJoinModal(true);
  };

  const handleJoinSubmit = () => {
    if (!joiningTeamId || !joinPassword.trim()) return;

    const teamToJoin = availableTeams.find(team => team.id === joiningTeamId);
    if (!teamToJoin || teamToJoin.password !== joinPassword.trim()) {
      toast({
        title: "팀 참여 실패",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive"
      });
      return;
    }

    const updatedTeam = {
      ...teamToJoin,
      members: [
        ...teamToJoin.members,
        {
          id: 'current-user',
          name: profile.name,
          profileImage: profile.profileImage,
          tier: profile.tier,
          weeklyProgress: 0
        }
      ]
    };

    const updatedTeams = availableTeams.map(team => team.id === joiningTeamId ? updatedTeam : team);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    loadTeams();
    
    setShowJoinModal(false);
    setJoiningTeamId(null);
    setJoinPassword('');
    toast({
      title: "팀 참여 완료",
      description: `${teamToJoin.name} 팀에 참여하였습니다.`,
    });
  };

  const handleLeaveTeam = (teamId: string) => {
    const teamToLeave = availableTeams.find(team => team.id === teamId);
    if (!teamToLeave) return;

    const updatedTeam = {
      ...teamToLeave,
      members: teamToLeave.members.filter(member => member.id !== 'current-user')
    };

    const updatedTeams = availableTeams.map(team => team.id === teamId ? updatedTeam : team);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    loadTeams();
    toast({
      title: "팀 탈퇴 완료",
      description: `${teamToLeave.name} 팀에서 탈퇴하였습니다.`,
    });
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setNewTeam({
      name: team.name,
      weeklyGoal: team.weeklyGoal.toString(),
      password: team.password || ''
    });
    setShowModal(true);
  };

  const getTierEmoji = (tier: string): string => {
    if (tier.includes('Diamond')) return '💎';
    if (tier.includes('Platinum')) return '🏆';
    if (tier.includes('Gold')) return '🥇';
    if (tier.includes('Silver')) return '🥈';
    return '🥉';
  };

  const getTierColor = (tier: string): string => {
    if (tier.includes('Diamond')) return 'text-cyan-500';
    if (tier.includes('Platinum')) return 'text-gray-400';
    if (tier.includes('Gold')) return 'text-yellow-500';
    if (tier.includes('Silver')) return 'text-gray-500';
    return 'text-amber-600';
  };

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">팀</h1>
          <p className="text-gray-600">함께 운동하며 목표를 달성하세요!</p>
        </div>

        {/* 팀 생성 버튼 */}
        <Button 
          onClick={() => {
            if (!profile.bankAccount) {
              toast({
                title: "계좌 등록 필요",
                description: "팀 활동을 위해서는 설정에서 계좌를 먼저 등록해주세요.",
                variant: "destructive"
              });
              return;
            }
            setEditingTeam(null);
            setNewTeam({ name: '', weeklyGoal: '3', password: '' });
            setShowModal(true);
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
        >
          <Plus className="h-5 w-5 mr-2" />
          새 팀 만들기
        </Button>

        {/* 내 팀 */}
        {myTeam && (
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  내 팀: {myTeam.name}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTeam(myTeam)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLeaveTeam(myTeam.id)}
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
                <p className="text-2xl font-bold text-blue-600">{myTeam.weeklyGoal}회</p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  팀원 ({myTeam.members.length}명)
                </h4>
                <div className="space-y-2">
                  {myTeam.members.map((member) => (
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
                          {member.weeklyProgress}/{myTeam.weeklyGoal}
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${Math.min((member.weeklyProgress / myTeam.weeklyGoal) * 100, 100)}%` }}
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
        )}

        {/* 모든 팀 목록 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-600" />
              모든 팀
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableTeams.length > 0 ? (
              <div className="space-y-3">
                {availableTeams.map((team) => (
                  <div key={team.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{team.name}</h3>
                        <p className="text-sm text-gray-600">주간 목표: {team.weeklyGoal}회</p>
                        <p className="text-sm text-gray-500">멤버: {team.members.length}명</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleJoinTeam(team.id)}
                        disabled={!profile.bankAccount}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        참여하기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                참여 가능한 팀이 없습니다.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 팀 생성/수정 모달 */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
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
                  onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
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
                  onChange={(e) => setNewTeam(prev => ({ ...prev, weeklyGoal: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="password">팀 비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={newTeam.password}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="팀 참여시 필요한 비밀번호"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 주간 목표를 달성하지 못하면 자동으로 벌금이 부과됩니다.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={!newTeam.name.trim() || !newTeam.password.trim()}
                  className="flex-1"
                >
                  {editingTeam ? '수정하기' : '만들기'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingTeam(null);
                    setNewTeam({ name: '', weeklyGoal: '3', password: '' });
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 팀 참여 모달 */}
        <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>팀 참여</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="joinPassword">팀 비밀번호</Label>
                <Input
                  id="joinPassword"
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  placeholder="팀 비밀번호를 입력하세요"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleJoinSubmit}
                  disabled={!joinPassword.trim()}
                  className="flex-1"
                >
                  참여하기
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoiningTeamId(null);
                    setJoinPassword('');
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Teams;
