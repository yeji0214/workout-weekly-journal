
import React, { useState, useEffect } from 'react';
import { Plus, Dumbbell, Camera, Trash2, Edit2, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

interface UserProfile {
  name: string;
  profileImage: string;
  bankAccount: string;
  tier: string;
  totalWorkouts: number;
  weeklyGoal: number;
}

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

const Index = () => {
  const { toast } = useToast();
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: '나',
    profileImage: '/placeholder.svg',
    bankAccount: '',
    tier: 'Bronze 5',
    totalWorkouts: 0,
    weeklyGoal: 3
  });
  const [newGoal, setNewGoal] = useState('3');
  const [newEntry, setNewEntry] = useState({
    exerciseName: '',
    comment: '',
    duration: '',
    image: null as File | null
  });

  useEffect(() => {
    loadEntries();
    loadProfile();
  }, []);

  const loadEntries = () => {
    const savedEntries = localStorage.getItem('workoutEntries');
    if (savedEntries) {
      setWorkoutEntries(JSON.parse(savedEntries));
    }
  };

  const loadProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedEntries = localStorage.getItem('workoutEntries');
    const savedTeams = localStorage.getItem('teams');
    
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
    }
    
    // 팀에 속해있다면 팀의 목표를 가져오기
    if (savedTeams) {
      const teams = JSON.parse(savedTeams);
      const myTeam = teams.find((team: Team) => 
        team.members.some(member => member.id === 'current-user')
      );
      if (myTeam) {
        setProfile(prev => ({ ...prev, weeklyGoal: myTeam.weeklyGoal }));
      }
    }
    
    // 총 운동 횟수 계산하여 티어 업데이트
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      const totalWorkouts = entries.length;
      const tier = calculateTier(totalWorkouts);
      setProfile(prev => ({ ...prev, totalWorkouts, tier }));
    }
  };

  const calculateTier = (totalWorkouts: number): string => {
    if (totalWorkouts >= 500) return 'Diamond 1';
    if (totalWorkouts >= 450) return 'Diamond 2';
    if (totalWorkouts >= 400) return 'Diamond 3';
    if (totalWorkouts >= 350) return 'Diamond 4';
    if (totalWorkouts >= 300) return 'Diamond 5';
    if (totalWorkouts >= 250) return 'Platinum 1';
    if (totalWorkouts >= 200) return 'Platinum 2';
    if (totalWorkouts >= 175) return 'Platinum 3';
    if (totalWorkouts >= 150) return 'Platinum 4';
    if (totalWorkouts >= 125) return 'Platinum 5';
    if (totalWorkouts >= 100) return 'Gold 1';
    if (totalWorkouts >= 85) return 'Gold 2';
    if (totalWorkouts >= 70) return 'Gold 3';
    if (totalWorkouts >= 55) return 'Gold 4';
    if (totalWorkouts >= 40) return 'Gold 5';
    if (totalWorkouts >= 35) return 'Silver 1';
    if (totalWorkouts >= 30) return 'Silver 2';
    if (totalWorkouts >= 25) return 'Silver 3';
    if (totalWorkouts >= 20) return 'Silver 4';
    if (totalWorkouts >= 15) return 'Silver 5';
    if (totalWorkouts >= 12) return 'Bronze 1';
    if (totalWorkouts >= 9) return 'Bronze 2';
    if (totalWorkouts >= 6) return 'Bronze 3';
    if (totalWorkouts >= 3) return 'Bronze 4';
    return 'Bronze 5';
  };

  const getTierColor = (tier: string): string => {
    if (tier.includes('Diamond')) return 'text-cyan-500';
    if (tier.includes('Platinum')) return 'text-gray-400';
    if (tier.includes('Gold')) return 'text-yellow-500';
    if (tier.includes('Silver')) return 'text-gray-500';
    return 'text-amber-600';
  };

  const getTierEmoji = (tier: string): string => {
    if (tier.includes('Diamond')) return '💎';
    if (tier.includes('Platinum')) return '🏆';
    if (tier.includes('Gold')) return '🥇';
    if (tier.includes('Silver')) return '🥈';
    return '🥉';
  };

  const getWeekStart = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    return startOfWeek.toISOString().split('T')[0];
  };

  const getWeekEnd = () => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() - now.getDay() + 6);
    return endOfWeek.toISOString().split('T')[0];
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewEntry(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async () => {
    if (!newEntry.exerciseName.trim()) {
      toast({
        title: "운동 종목을 입력해주세요",
        description: "운동 종목은 필수 항목입니다.",
        variant: "destructive"
      });
      return;
    }

    if (!newEntry.image && !editingEntry?.imageUrl) {
      toast({
        title: "인증 사진을 첨부해주세요",
        description: "인증 사진은 필수 항목입니다.",
        variant: "destructive"
      });
      return;
    }

    let imageUrl = '';
    if (newEntry.image) {
      const reader = new FileReader();
      imageUrl = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(newEntry.image!);
      });
    }

    const entry: WorkoutEntry = {
      id: editingEntry?.id || `entry-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      exerciseName: newEntry.exerciseName.trim(),
      comment: newEntry.comment.trim(),
      duration: newEntry.duration ? parseInt(newEntry.duration) : undefined,
      imageUrl: imageUrl || editingEntry?.imageUrl,
      userId: 'current-user',
      userName: profile.name
    };

    let updatedEntries;
    if (editingEntry) {
      updatedEntries = workoutEntries.map(e => e.id === editingEntry.id ? entry : e);
      toast({
        title: "운동 기록 수정 완료",
        description: `${entry.exerciseName} 기록이 수정되었습니다.`,
      });
    } else {
      updatedEntries = [entry, ...workoutEntries];
      toast({
        title: "운동 기록 추가 완료",
        description: `${entry.exerciseName} 기록이 추가되었습니다.`,
      });
    }

    localStorage.setItem('workoutEntries', JSON.stringify(updatedEntries));
    setWorkoutEntries(updatedEntries);
    
    setNewEntry({ exerciseName: '', comment: '', duration: '', image: null });
    setEditingEntry(null);
    setShowModal(false);
    
    // 프로필 업데이트
    loadProfile();
  };

  const handleEdit = (entry: WorkoutEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      exerciseName: entry.exerciseName,
      comment: entry.comment || '',
      duration: entry.duration?.toString() || '',
      image: null
    });
    setShowModal(true);
  };

  const handleDelete = (entryId: string) => {
    const updatedEntries = workoutEntries.filter(entry => entry.id !== entryId);
    localStorage.setItem('workoutEntries', JSON.stringify(updatedEntries));
    setWorkoutEntries(updatedEntries);
    toast({
      title: "운동 기록 삭제",
      description: "운동 기록이 삭제되었습니다.",
    });
    loadProfile();
  };

  const handleGoalSave = () => {
    const goalValue = parseInt(newGoal);
    if (goalValue < 1 || goalValue > 50) {
      toast({
        title: "목표 횟수 오류",
        description: "목표 횟수는 1회 이상 50회 이하로 설정해주세요.",
        variant: "destructive"
      });
      return;
    }

    const updatedProfile = { ...profile, weeklyGoal: goalValue };
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setShowGoalModal(false);
    toast({
      title: "목표 설정 완료",
      description: `주간 목표가 ${goalValue}회로 설정되었습니다.`,
    });
  };

  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  const thisWeekEntries = workoutEntries.filter(entry => 
    entry.date >= weekStart && entry.date <= weekEnd
  );

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 환영 메시지 */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">{getTierEmoji(profile.tier)}</span>
            <span className={`text-lg font-bold ${getTierColor(profile.tier)}`}>
              {profile.tier}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">운동 기록</h1>
          <p className="text-gray-600">오늘도 열심히 운동해보세요!</p>
        </div>

        {/* 주간 목표 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                주간 목표
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setNewGoal(profile.weeklyGoal.toString());
                  setShowGoalModal(true);
                }}
              >
                설정
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {thisWeekEntries.length} / {profile.weeklyGoal}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((thisWeekEntries.length / profile.weeklyGoal) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {thisWeekEntries.length >= profile.weeklyGoal ? '🎉 목표 달성!' : `${profile.weeklyGoal - thisWeekEntries.length}회 더 필요`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 운동 추가 버튼 */}
        <Button 
          onClick={() => {
            setEditingEntry(null);
            setNewEntry({ exerciseName: '', comment: '', duration: '', image: null });
            setShowModal(true);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        >
          <Plus className="h-5 w-5 mr-2" />
          운동 기록 추가
        </Button>

        {/* 이번 주 운동 기록 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-blue-600" />
              이번 주 운동 ({thisWeekEntries.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {thisWeekEntries.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {thisWeekEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{entry.exerciseName}</h3>
                        <p className="text-xs text-gray-500">{entry.date}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                          className="p-1 h-6 w-6"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {entry.duration && (
                      <p className="text-sm text-blue-600 mb-1">{entry.duration}분</p>
                    )}
                    
                    {entry.comment && (
                      <p className="text-gray-600 text-sm mb-2">{entry.comment}</p>
                    )}
                    
                    {entry.imageUrl && (
                      <img 
                        src={entry.imageUrl} 
                        alt="운동 인증" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                이번 주 운동 기록이 없습니다.<br />
                첫 번째 운동을 기록해보세요!
              </p>
            )}
          </CardContent>
        </Card>

        {/* 목표 설정 모달 */}
        <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>주간 목표 설정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="weeklyGoal">주간 운동 목표 (1-50회)</Label>
                <Input
                  id="weeklyGoal"
                  type="number"
                  min="1"
                  max="50"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleGoalSave} className="flex-1">
                  저장
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 운동 기록 추가/수정 모달 */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEntry ? '운동 기록 수정' : '운동 기록 추가'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="exerciseName">운동 종목 *</Label>
                <Input
                  id="exerciseName"
                  value={newEntry.exerciseName}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, exerciseName: e.target.value }))}
                  placeholder="예: 런닝, 헬스, 요가 등"
                />
              </div>

              <div>
                <Label htmlFor="duration">운동 시간 (분, 선택사항)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newEntry.duration}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="예: 30"
                />
              </div>

              <div>
                <Label htmlFor="comment">메모 (선택사항)</Label>
                <Textarea
                  id="comment"
                  value={newEntry.comment}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="운동에 대한 간단한 메모를 남겨보세요"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">인증 사진 *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  <Camera className="h-5 w-5 text-gray-400" />
                </div>
                {editingEntry?.imageUrl && !newEntry.image && (
                  <p className="text-sm text-gray-500 mt-1">현재 이미지가 등록되어 있습니다.</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={!newEntry.exerciseName.trim()}
                  className="flex-1"
                >
                  {editingEntry ? '수정하기' : '추가하기'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingEntry(null);
                    setNewEntry({ exerciseName: '', comment: '', duration: '', image: null });
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

export default Index;
