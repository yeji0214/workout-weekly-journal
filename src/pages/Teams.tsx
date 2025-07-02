import React, { useState, useEffect } from 'react';
import { Users, Plus, ArrowLeft, Crown, UserMinus, Vote, Medal, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Team {
  id: string;
  name: string;
  description: string;
  weeklyGoal: number;
  members: TeamMember[];
  createdBy: string;
  createdAt: string;
  leaderId: string;
}

interface TeamMember {
  id: string;
  name: string;
  joinedAt: string;
  workoutCount: number;
}

interface Vote {
  id: string;
  teamId: string;
  targetUserId: string;
  targetUserName: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  endDate: string;
  votes: { userId: string; vote: 'agree' | 'disagree' }[];
  status: 'active' | 'completed';
}

interface WorkoutEntry {
  id: string;
  date: string;
  exerciseName: string;
  comment: string;
  duration?: number;
  imageUrl?: string;
  userId?: string;
  userName?: string;
}

const Teams = () => {
  const { toast } = useToast();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTeamDetail, setShowTeamDetail] = useState(false);
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [activeVotes, setActiveVotes] = useState<Vote[]>([]);
  
  // 팀 생성 폼
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState('');
  
  // 투표 폼
  const [voteTargetId, setVoteTargetId] = useState('');
  const [voteReason, setVoteReason] = useState('');

  // 현재 사용자 ID (실제로는 로그인 시스템에서 가져와야 함)
  const currentUserId = 'current-user';
  const currentUserName = '나';

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    // 목 데이터 로드
    loadMockData();
    
    // 저장된 데이터 로드
    const savedTeams = localStorage.getItem('teams');
    const savedCurrentTeam = localStorage.getItem('currentTeam');
    const savedVotes = localStorage.getItem('activeVotes');
    
    if (savedTeams) {
      const parsedTeams = JSON.parse(savedTeams);
      setTeams(parsedTeams);
      
      // 현재 사용자가 속한 팀 찾기
      const userTeam = parsedTeams.find((team: Team) => 
        team.members.some(member => member.id === currentUserId)
      );
      
      if (userTeam) {
        setCurrentTeam(userTeam);
        localStorage.setItem('currentTeam', JSON.stringify(userTeam));
      } else {
        localStorage.removeItem('currentTeam');
        setCurrentTeam(null);
      }
    }
    
    if (savedVotes) {
      setActiveVotes(JSON.parse(savedVotes));
    }
    
    // 만료된 투표 처리
    checkExpiredVotes();
  };

  const loadMockData = () => {
    const mockTeams: Team[] = [
      {
        id: 'team-1',
        name: '헬스 마니아들',
        description: '매일 헬스장에서 만나요! 목표는 주 5회 운동입니다.',
        weeklyGoal: 5,
        members: [
          { id: 'user-1', name: '김철수', joinedAt: '2024-01-01', workoutCount: 4 },
          { id: 'user-2', name: '이영희', joinedAt: '2024-01-02', workoutCount: 3 },
          { id: 'user-3', name: '박민수', joinedAt: '2024-01-03', workoutCount: 5 },
        ],
        createdBy: 'user-1',
        createdAt: '2024-01-01',
        leaderId: 'user-1'
      },
      {
        id: 'team-2',
        name: '홈트레이닝 팀',
        description: '집에서 함께 운동해요. 주 3회 목표로 시작해봐요.',
        weeklyGoal: 3,
        members: [
          { id: 'user-4', name: '최수연', joinedAt: '2024-01-05', workoutCount: 2 },
          { id: 'user-5', name: '정대호', joinedAt: '2024-01-06', workoutCount: 3 },
        ],
        createdBy: 'user-4',
        createdAt: '2024-01-05',
        leaderId: 'user-4'
      }
    ];
    
    if (!localStorage.getItem('teams')) {
      setTeams(mockTeams);
      localStorage.setItem('teams', JSON.stringify(mockTeams));
    }
  };

  // 이번 주 시작일 계산
  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  };

  // 사용자 운동 데이터 동기화
  const syncUserWorkoutData = () => {
    const savedEntries = localStorage.getItem('workoutEntries');
    if (!savedEntries) return 0;
    
    const entries: WorkoutEntry[] = JSON.parse(savedEntries);
    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // 현재 사용자의 이번주 운동 횟수 계산
    const currentUserWeeklyCount = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && 
             entryDate <= weekEnd && 
             (!entry.userId || entry.userId === currentUserId);
    }).length;
    
    return currentUserWeeklyCount;
  };

  // 팀과 현재 사용자 데이터 동기화
  useEffect(() => {
    if (currentTeam) {
      const currentUserWeeklyCount = syncUserWorkoutData();
      
      const updatedTeams = teams.map(team => {
        if (team.id === currentTeam.id) {
          const updatedMembers = team.members.map(member => {
            if (member.id === currentUserId) {
              return { ...member, workoutCount: currentUserWeeklyCount };
            }
            return member;
          });
          return { ...team, members: updatedMembers };
        }
        return team;
      });
      
      if (JSON.stringify(updatedTeams) !== JSON.stringify(teams)) {
        setTeams(updatedTeams);
        localStorage.setItem('teams', JSON.stringify(updatedTeams));
        
        const updatedCurrentTeam = updatedTeams.find(t => t.id === currentTeam.id);
        if (updatedCurrentTeam) {
          setCurrentTeam(updatedCurrentTeam);
          localStorage.setItem('currentTeam', JSON.stringify(updatedCurrentTeam));
        }
      }
    }
  }, []);

  const checkExpiredVotes = () => {
    const now = new Date();
    setActiveVotes(prev => {
      const updated = prev.map(vote => {
        if (new Date(vote.endDate) <= now && vote.status === 'active') {
          // 투표 결과 처리
          processVoteResult(vote);
          return { ...vote, status: 'completed' as const };
        }
        return vote;
      });
      localStorage.setItem('activeVotes', JSON.stringify(updated));
      return updated;
    });
  };

  const processVoteResult = (vote: Vote) => {
    const agreeVotes = vote.votes.filter(v => v.vote === 'agree').length;
    const disagreeVotes = vote.votes.filter(v => v.vote === 'disagree').length;
    const team = teams.find(t => t.id === vote.teamId);
    
    if (!team) return;
    
    // 50% 이상 참여 확인
    const participationRate = vote.votes.length / team.members.length;
    if (participationRate < 0.5) return;
    
    // 퇴출 처리 (동점이면 현상유지)
    if (agreeVotes > disagreeVotes) {
      const updatedTeams = teams.map(t => {
        if (t.id === vote.teamId) {
          const updatedMembers = t.members.filter(m => m.id !== vote.targetUserId);
          
          // 팀장이 퇴출된 경우 승계
          let newLeaderId = t.leaderId;
          if (t.leaderId === vote.targetUserId && updatedMembers.length > 0) {
            newLeaderId = updatedMembers.sort((a, b) => 
              new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
            )[0].id;
          }
          
          return {
            ...t,
            members: updatedMembers,
            leaderId: newLeaderId
          };
        }
        return t;
      });
      
      setTeams(updatedTeams);
      localStorage.setItem('teams', JSON.stringify(updatedTeams));
      
      // 팀이 비어있으면 삭제
      const updatedTeam = updatedTeams.find(t => t.id === vote.teamId);
      if (updatedTeam && updatedTeam.members.length === 0) {
        deleteEmptyTeam(vote.teamId);
      }
    }
  };

  const deleteEmptyTeam = (teamId: string) => {
    const updatedTeams = teams.filter(t => t.id !== teamId);
    setTeams(updatedTeams);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    
    if (currentTeam?.id === teamId) {
      setCurrentTeam(null);
      localStorage.removeItem('currentTeam');
    }
  };

  const handleCreateTeam = () => {
    if (teamName.trim() && teamDescription.trim() && weeklyGoal) {
      // 이미 팀에 속해있는지 확인
      if (currentTeam) {
        toast({
          title: "팀 생성 불가",
          description: "이미 팀에 속해있습니다. 현재 팀을 나가고 새 팀을 만들어주세요.",
          variant: "destructive",
        });
        return;
      }

      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: teamName.trim(),
        description: teamDescription.trim(),
        weeklyGoal: parseInt(weeklyGoal),
        members: [{ 
          id: currentUserId, 
          name: currentUserName, 
          joinedAt: new Date().toISOString(), 
          workoutCount: syncUserWorkoutData()
        }],
        createdBy: currentUserId,
        createdAt: new Date().toISOString(),
        leaderId: currentUserId
      };
      
      const updatedTeams = [...teams, newTeam];
      setTeams(updatedTeams);
      setCurrentTeam(newTeam);
      localStorage.setItem('teams', JSON.stringify(updatedTeams));
      localStorage.setItem('currentTeam', JSON.stringify(newTeam));
      
      // 알림 표시
      toast({
        title: "팀 생성 완료!",
        description: `${newTeam.name} 팀의 팀장이 되었습니다.`,
      });
      
      // 폼 리셋
      setTeamName('');
      setTeamDescription('');
      setWeeklyGoal('');
      setShowCreateForm(false);
    }
  };

  const handleJoinTeam = (team: Team) => {
    if (currentTeam) {
      toast({
        title: "참여 불가",
        description: "이미 팀에 속해있습니다. 팀을 나가고 다른 팀에 참여해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    // 이미 해당 팀의 멤버인지 확인
    if (team.members.some(member => member.id === currentUserId)) {
      toast({
        title: "이미 참여 중",
        description: "이미 해당 팀에 참여하고 있습니다.",
        variant: "destructive",
      });
      return;
    }
    
    const newMember: TeamMember = {
      id: currentUserId,
      name: currentUserName,
      joinedAt: new Date().toISOString(),
      workoutCount: syncUserWorkoutData()
    };
    
    const updatedTeams = teams.map(t => {
      if (t.id === team.id) {
        return { ...t, members: [...t.members, newMember] };
      }
      return t;
    });
    
    const joinedTeam = updatedTeams.find(t => t.id === team.id);
    
    setTeams(updatedTeams);
    setCurrentTeam(joinedTeam || null);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    localStorage.setItem('currentTeam', JSON.stringify(joinedTeam));
    
    // 알림 표시
    toast({
      title: "팀 참여 완료!",
      description: `${team.name} 팀에 참여했습니다.`,
    });
  };

  const handleLeaveTeam = () => {
    if (!currentTeam) return;
    
    const updatedTeams = teams.map(t => {
      if (t.id === currentTeam.id) {
        const updatedMembers = t.members.filter(m => m.id !== currentUserId);
        
        // 팀장이 나가는 경우 승계
        let newLeaderId = t.leaderId;
        if (t.leaderId === currentUserId && updatedMembers.length > 0) {
          newLeaderId = updatedMembers.sort((a, b) => 
            new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
          )[0].id;
        }
        
        return {
          ...t,
          members: updatedMembers,
          leaderId: newLeaderId
        };
      }
      return t;
    });
    
    setTeams(updatedTeams);
    setCurrentTeam(null);
    localStorage.setItem('teams', JSON.stringify(updatedTeams));
    localStorage.removeItem('currentTeam');
    
    // 알림 표시
    toast({
      title: "팀 탈퇴 완료",
      description: "팀에서 나왔습니다.",
    });
    
    // 팀이 비어있으면 삭제
    const updatedTeam = updatedTeams.find(t => t.id === currentTeam.id);
    if (updatedTeam && updatedTeam.members.length === 0) {
      deleteEmptyTeam(currentTeam.id);
    }
  };

  const handleCreateVote = () => {
    if (!currentTeam || !voteTargetId || !voteReason.trim()) return;
    
    // 이미 활성화된 투표가 있는지 확인
    const hasActiveVote = activeVotes.some(vote => 
      vote.teamId === currentTeam.id && vote.status === 'active'
    );
    
    if (hasActiveVote) {
      alert('이미 진행 중인 투표가 있습니다.');
      return;
    }
    
    const newVote: Vote = {
      id: `vote-${Date.now()}`,
      teamId: currentTeam.id,
      targetUserId: voteTargetId,
      targetUserName: currentTeam.members.find(m => m.id === voteTargetId)?.name || '',
      reason: voteReason.trim(),
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24시간 후
      votes: [],
      status: 'active'
    };
    
    const updatedVotes = [...activeVotes, newVote];
    setActiveVotes(updatedVotes);
    localStorage.setItem('activeVotes', JSON.stringify(updatedVotes));
    
    setVoteTargetId('');
    setVoteReason('');
    setShowVoteForm(false);
  };

  const handleVote = (voteId: string, vote: 'agree' | 'disagree') => {
    const updatedVotes = activeVotes.map(v => {
      if (v.id === voteId) {
        const existingVoteIndex = v.votes.findIndex(vote => vote.userId === currentUserId);
        let newVotes = [...v.votes];
        
        if (existingVoteIndex >= 0) {
          newVotes[existingVoteIndex] = { userId: currentUserId, vote };
        } else {
          newVotes.push({ userId: currentUserId, vote });
        }
        
        return { ...v, votes: newVotes };
      }
      return v;
    });
    
    setActiveVotes(updatedVotes);
    localStorage.setItem('activeVotes', JSON.stringify(updatedVotes));
  };

  const getMemberWorkoutEntries = (memberId: string): WorkoutEntry[] => {
    const savedEntries = localStorage.getItem('workoutEntries');
    let entries: WorkoutEntry[] = [];
    
    if (savedEntries) {
      entries = JSON.parse(savedEntries);
    }
    
    // 이번 주 날짜 계산
    const weekStart = getWeekStart();
    const getThisWeekDate = (daysBack: number) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + (6 - daysBack));
      return date.toISOString().split('T')[0];
    };
    
    // 목 데이터 추가 - 각 팀원별로 운동 횟수만큼의 기록 생성 (이번 주 날짜로)
    const mockEntriesMap: { [key: string]: WorkoutEntry[] } = {
      'user-1': [
        {
          id: 'mock-1-1',
          date: getThisWeekDate(0),
          exerciseName: '벤치프레스',
          comment: '오늘은 개인 기록 갱신! 100kg 달성했어요.',
          duration: 60,
          imageUrl: '/placeholder.svg',
          userId: 'user-1',
          userName: '김철수'
        },
        {
          id: 'mock-1-2',
          date: getThisWeekDate(1),
          exerciseName: '데드리프트',
          comment: '하체 운동 완료. 힘들었지만 뿌듯해요!',
          duration: 45,
          imageUrl: '/placeholder.svg',
          userId: 'user-1',
          userName: '김철수'
        },
        {
          id: 'mock-1-3',
          date: getThisWeekDate(2),
          exerciseName: '스쿼트',
          comment: '다리가 후들후들... 그래도 완주!',
          duration: 50,
          imageUrl: '/placeholder.svg',
          userId: 'user-1',
          userName: '김철수'
        },
        {
          id: 'mock-1-4',
          date: getThisWeekDate(3),
          exerciseName: '런닝머신',
          comment: '30분 달리기 완성! 땀이 뻘뻘',
          duration: 30,
          imageUrl: '/placeholder.svg',
          userId: 'user-1',
          userName: '김철수'
        }
      ],
      'user-2': [
        {
          id: 'mock-2-1',
          date: getThisWeekDate(0),
          exerciseName: '요가',
          comment: '아침 요가로 하루를 시작해요~',
          duration: 40,
          imageUrl: '/placeholder.svg',
          userId: 'user-2',
          userName: '이영희'
        },
        {
          id: 'mock-2-2',
          date: getThisWeekDate(1),
          exerciseName: '필라테스',
          comment: '코어 운동 집중! 속근육이 타는 느낌',
          duration: 50,
          imageUrl: '/placeholder.svg',
          userId: 'user-2',
          userName: '이영희'
        },
        {
          id: 'mock-2-3',
          date: getThisWeekDate(2),
          exerciseName: '홈트레이닝',
          comment: '집에서 간단하게 운동 완료',
          duration: 25,
          imageUrl: '/placeholder.svg',
          userId: 'user-2',
          userName: '이영희'
        }
      ],
      'user-3': [
        {
          id: 'mock-3-1',
          date: getThisWeekDate(0),
          exerciseName: '크로스핏',
          comment: '오늘 WOD 완료! 정말 힘들었어요',
          duration: 45,
          imageUrl: '/placeholder.svg',
          userId: 'user-3',
          userName: '박민수'
        },
        {
          id: 'mock-3-2',
          date: getThisWeekDate(1),
          exerciseName: '수영',
          comment: '1km 완주! 물놀이 아닌 진짜 수영',
          duration: 60,
          imageUrl: '/placeholder.svg',
          userId: 'user-3',
          userName: '박민수'
        },
        {
          id: 'mock-3-3',
          date: getThisWeekDate(2),
          exerciseName: '복싱',
          comment: '스트레스 해소용 복싱! 시원해요',
          duration: 55,
          imageUrl: '/placeholder.svg',
          userId: 'user-3',
          userName: '박민수'
        },
        {
          id: 'mock-3-4',
          date: getThisWeekDate(3),
          exerciseName: '클라이밍',
          comment: '실내 클라이밍 도전! 팔이 아파요',
          duration: 70,
          imageUrl: '/placeholder.svg',
          userId: 'user-3',
          userName: '박민수'
        },
        {
          id: 'mock-3-5',
          date: getThisWeekDate(4),
          exerciseName: '테니스',
          comment: '친구와 테니스 한 게임! 재밌어요',
          duration: 90,
          imageUrl: '/placeholder.svg',
          userId: 'user-3',
          userName: '박민수'
        }
      ],
      'user-4': [
        {
          id: 'mock-4-1',
          date: getThisWeekDate(0),
          exerciseName: '홈트레이닝',
          comment: '유튜브 보면서 홈트 완료!',
          duration: 30,
          imageUrl: '/placeholder.svg',
          userId: 'user-4',
          userName: '최수연'
        },
        {
          id: 'mock-4-2',
          date: getThisWeekDate(1),
          exerciseName: '스트레칭',
          comment: '몸이 많이 뻣뻣했는데 시원해요',
          duration: 20,
          imageUrl: '/placeholder.svg',
          userId: 'user-4',
          userName: '최수연'
        }
      ],
      'user-5': [
        {
          id: 'mock-5-1',
          date: getThisWeekDate(0),
          exerciseName: '조깅',
          comment: '아침 조깅 30분! 상쾌한 시작',
          duration: 30,
          imageUrl: '/placeholder.svg',
          userId: 'user-5',
          userName: '정대호'
        },
        {
          id: 'mock-5-2',
          date: getThisWeekDate(1),
          exerciseName: '푸시업',
          comment: '100개 도전! 50개까지만...',
          duration: 15,
          imageUrl: '/placeholder.svg',
          userId: 'user-5',
          userName: '정대호'
        },
        {
          id: 'mock-5-3',
          date: getThisWeekDate(2),
          exerciseName: '턱걸이',
          comment: '턱걸이 10개 완성! 팔이 떨려요',
          duration: 10,
          imageUrl: '/placeholder.svg',
          userId: 'user-5',
          userName: '정대호'
        }
      ]
    };
    
    const allEntries = [...entries];
    if (mockEntriesMap[memberId]) {
      allEntries.push(...mockEntriesMap[memberId]);
    }
    
    return allEntries.filter(entry => entry.userId === memberId);
  };

  const getRankedMembers = (members: TeamMember[]) => {
    return [...members].sort((a, b) => b.workoutCount - a.workoutCount);
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}위`;
    }
  };

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setShowMemberDetail(true);
  };

  const currentTeamActiveVote = activeVotes.find(vote => 
    vote.teamId === currentTeam?.id && vote.status === 'active'
  );

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-gray-800">팀 관리</h1>
        </div>

        {/* 현재 팀 정보 */}
        {currentTeam ? (
          <Card className="shadow-lg border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  내 팀
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowTeamDetail(true)}
                >
                  상세보기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-blue-800">{currentTeam.name}</h3>
                  <p className="text-sm text-gray-600">{currentTeam.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">주간 목표: {currentTeam.weeklyGoal}회</span>
                  <Badge variant="secondary">{currentTeam.members.length}명</Badge>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleLeaveTeam}
                  className="w-full"
                >
                  팀 나가기
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">팀에 참여해보세요!</h3>
              <p className="text-gray-500 mb-4">함께 운동 목표를 달성해보세요.</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 팀 만들기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 팀 목록 */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>모든 팀</span>
              {!currentTeam && (
                <Button 
                  size="sm" 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  팀 만들기
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{team.name}</h3>
                        {team.leaderId === currentUserId && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{team.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>목표: {team.weeklyGoal}회/주</span>
                        <span>멤버: {team.members.length}명</span>
                      </div>
                    </div>
                    {!currentTeam && (
                      <Button 
                        size="sm" 
                        onClick={() => handleJoinTeam(team)}
                        disabled={team.members.some(m => m.id === currentUserId)}
                      >
                        참여하기
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {teams.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  아직 생성된 팀이 없습니다.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 팀 생성 모달 */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 팀 만들기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="팀 이름"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <Textarea
                placeholder="팀 설명"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                rows={3}
              />
              <Input
                type="number"
                placeholder="주간 운동 목표 (회)"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(e.target.value)}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateTeam}
                  disabled={!teamName.trim() || !teamDescription.trim() || !weeklyGoal}
                  className="flex-1"
                >
                  팀 만들기
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showTeamDetail} onOpenChange={setShowTeamDetail}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {currentTeam?.name}
              </DialogTitle>
            </DialogHeader>
            {currentTeam && (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 mb-4">{currentTeam.description}</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">주간 목표: {currentTeam.weeklyGoal}회</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Medal className="h-4 w-4 text-yellow-500" />
                    팀원 랭킹 ({currentTeam.members.length}명)
                  </h4>
                  <div className="space-y-2">
                    {getRankedMembers(currentTeam.members).map((member, index) => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => handleMemberClick(member)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-yellow-600 min-w-[40px]">
                            {getRankEmoji(index + 1)}
                          </span>
                          <span className="font-medium">{member.name}</span>
                          {currentTeam.leaderId === member.id && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <Badge variant="outline">{member.workoutCount}회</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 투표 섹션 */}
                {currentTeamActiveVote ? (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Vote className="h-4 w-4" />
                      진행 중인 투표
                    </h4>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="font-medium text-red-800">
                        {currentTeamActiveVote.targetUserName} 퇴출 투표
                      </p>
                      <p className="text-sm text-red-600 mb-2">{currentTeamActiveVote.reason}</p>
                      <div className="flex gap-2 mb-2">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleVote(currentTeamActiveVote.id, 'agree')}
                          disabled={currentTeamActiveVote.votes.some(v => v.userId === currentUserId)}
                        >
                          찬성
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleVote(currentTeamActiveVote.id, 'disagree')}
                          disabled={currentTeamActiveVote.votes.some(v => v.userId === currentUserId)}
                        >
                          반대
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        투표 현황: {currentTeamActiveVote.votes.length}/{currentTeam.members.length}명 참여
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowVoteForm(true)}
                      className="w-full"
                      disabled={currentTeam.members.length <= 1}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      {currentTeam.members.length <= 1 ? '퇴출할 팀원이 없습니다' : '퇴출 투표 열기'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showVoteForm} onOpenChange={setShowVoteForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>퇴출 투표 열기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">퇴출 대상</label>
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={voteTargetId}
                  onChange={(e) => setVoteTargetId(e.target.value)}
                >
                  <option value="">선택해주세요</option>
                  {currentTeam?.members
                    .filter(member => member.id !== currentUserId)
                    .map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                </select>
              </div>
              <Textarea
                placeholder="퇴출 사유를 입력해주세요"
                value={voteReason}
                onChange={(e) => setVoteReason(e.target.value)}
                rows={3}
              />
              <div className="text-xs text-gray-500">
                <p>• 투표는 24시간 동안 진행됩니다</p>
                <p>• 팀원 50% 이상 참여 시 유효합니다</p>
                <p>• 동점 시 현상유지됩니다</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateVote}
                  disabled={!voteTargetId || !voteReason.trim()}
                  className="flex-1"
                  variant="destructive"
                >
                  투표 시작
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowVoteForm(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showMemberDetail} onOpenChange={setShowMemberDetail}>
          <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedMember?.name}의 운동 기록
              </DialogTitle>
            </DialogHeader>
            {selectedMember && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {selectedMember.workoutCount}회
                  </div>
                  <p className="text-sm text-gray-600">이번 주 운동 횟수</p>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-3 pr-4">
                    <h4 className="font-semibold">최근 운동 기록</h4>
                    {getMemberWorkoutEntries(selectedMember.id).slice(0, 10).map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{entry.exerciseName}</h5>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        {entry.duration && (
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm text-blue-600">{entry.duration}분</span>
                          </div>
                        )}
                        {entry.comment && (
                          <p className="text-sm text-gray-600 mb-2">{entry.comment}</p>
                        )}
                        {entry.imageUrl && (
                          <img 
                            src={entry.imageUrl} 
                            alt="운동 인증" 
                            className="w-full h-32 object-cover rounded"
                          />
                        )}
                      </div>
                    ))}
                    
                    {getMemberWorkoutEntries(selectedMember.id).length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        아직 운동 기록이 없습니다.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Teams;
