
import React, { useState, useEffect } from 'react';
import { Plus, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MyTeamCard from '@/components/teams/MyTeamCard';
import TeamCard from '@/components/teams/TeamCard';
import TeamModal from '@/components/teams/TeamModal';
import { getTierEmoji, getTierColor, createMockTeams, Team, UserProfile } from '@/utils/teamUtils';

const Teams = () => {
  const { toast } = useToast();
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    weeklyGoal: '3'
  });
  const [profile, setProfile] = useState<UserProfile>({
    name: '나',
    profileImage: '/placeholder.svg',
    bankAccount: '',
    tier: 'Bronze 5',
    totalWorkouts: 0
  });

  useEffect(() => {
    loadOrCreateMockData();
    loadProfile();
  }, []);

  const loadOrCreateMockData = () => {
    const savedTeams = localStorage.getItem('teams');
    if (!savedTeams) {
      const mockTeams = createMockTeams();
      localStorage.setItem('teams', JSON.stringify(mockTeams));
      setAvailableTeams(mockTeams);
      setMyTeam(null);
    } else {
      const teams = JSON.parse(savedTeams);
      const myTeam = teams.find((team: Team) => 
        team.members.some(member => member.id === 'current-user')
      );
      setMyTeam(myTeam || null);
      setAvailableTeams(teams.filter((team: Team) => team.id !== myTeam?.id));
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
    if (!newTeam.name.trim()) return;

    const team: Team = {
      id: editingTeam?.id || `team-${Date.now()}`,
      name: newTeam.name.trim(),
      weeklyGoal: parseInt(newTeam.weeklyGoal),
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
    loadOrCreateMockData();
    
    setNewTeam({ name: '', weeklyGoal: '3' });
    setEditingTeam(null);
    setShowModal(false);
    toast({
      title: editingTeam ? "팀 정보 수정 완료" : "새 팀 생성 완료",
      description: editingTeam ? "팀 정보가 수정되었습니다." : "새로운 팀이 생성되었습니다.",
    });
  };

  const handleJoinTeam = (teamId: string) => {
    const teamToJoin = availableTeams.find(team => team.id === teamId);
    if (!teamToJoin) return;

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

    const updatedTeams = availableTeams.map(team => team.id === teamId ? updatedTeam : team);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    loadOrCreateMockData();
    
    toast({
      title: "팀 참여 완료",
      description: `${teamToJoin.name} 팀에 참여하였습니다.`,
    });
  };

  const handleLeaveTeam = () => {
    if (!myTeam) return;

    const updatedTeam = {
      ...myTeam,
      members: myTeam.members.filter(member => member.id !== 'current-user')
    };

    const allTeams = [updatedTeam, ...availableTeams];
    localStorage.setItem('teams', JSON.stringify(allTeams));
    loadOrCreateMockData();
    
    toast({
      title: "팀 탈퇴 완료",
      description: `${myTeam.name} 팀에서 탈퇴하였습니다.`,
    });
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setNewTeam({
      name: team.name,
      weeklyGoal: team.weeklyGoal.toString()
    });
    setShowModal(true);
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setEditingTeam(null);
    setNewTeam({ name: '', weeklyGoal: '3' });
  };

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">팀</h1>
          <p className="text-gray-600">함께 운동하며 목표를 달성하세요!</p>
        </div>

        {/* 팀 생성 버튼 - 팀에 속하지 않을 때만 표시 */}
        {!myTeam && (
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
              setNewTeam({ name: '', weeklyGoal: '3' });
              setShowModal(true);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
          >
            <Plus className="h-5 w-5 mr-2" />
            새 팀 만들기
          </Button>
        )}

        {/* 내 팀 */}
        {myTeam && (
          <MyTeamCard
            team={myTeam}
            onEditTeam={handleEditTeam}
            onLeaveTeam={handleLeaveTeam}
            getTierEmoji={getTierEmoji}
            getTierColor={getTierColor}
          />
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
                  <TeamCard
                    key={team.id}
                    team={team}
                    onJoinTeam={handleJoinTeam}
                    canJoin={!myTeam && !!profile.bankAccount}
                    getTierEmoji={getTierEmoji}
                  />
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
        <TeamModal
          open={showModal}
          onOpenChange={setShowModal}
          editingTeam={editingTeam}
          newTeam={newTeam}
          onTeamChange={setNewTeam}
          onSubmit={handleSubmit}
          onCancel={handleModalCancel}
        />
      </div>
    </div>
  );
};

export default Teams;
