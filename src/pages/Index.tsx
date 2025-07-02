
import React, { useState, useEffect } from 'react';
import { Camera, Target, Calendar, Trophy, Plus, Eye, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkoutEntry {
  id: string;
  date: string;
  exerciseName: string;
  comment: string;
  duration?: number; // 운동 시간 (분) - 선택사항
  imageUrl?: string;
  userId?: string;
  userName?: string;
}

interface WeeklyGoal {
  count: number;
  startDate: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  weeklyGoal: number;
  members: string[];
  createdBy: string;
  createdAt: string;
}

const Index = () => {
  // 상태 관리
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal>({ count: 0, startDate: '' });
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  
  // 운동 인증 폼 상태
  const [exerciseName, setExerciseName] = useState('');
  const [comment, setComment] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // 개별 게시글 모달 상태
  const [selectedEntry, setSelectedEntry] = useState<WorkoutEntry | null>(null);
  const [showEntryDetails, setShowEntryDetails] = useState(false);

  // 로컬스토리지에서 데이터 불러오기
  useEffect(() => {
    const savedGoal = localStorage.getItem('weeklyGoal');
    const savedEntries = localStorage.getItem('workoutEntries');
    const savedTeam = localStorage.getItem('currentTeam');
    
    if (savedGoal) {
      setWeeklyGoal(JSON.parse(savedGoal));
    }
    if (savedEntries) {
      setWorkoutEntries(JSON.parse(savedEntries));
    }
    if (savedTeam) {
      const team = JSON.parse(savedTeam);
      setCurrentTeam(team);
      // 팀에 속해있으면 팀 목표를 개인 목표로 설정
      if (team && team.weeklyGoal) {
        setWeeklyGoal(prev => ({ ...prev, count: team.weeklyGoal }));
      }
    }
  }, []);

  // 데이터가 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    if (weeklyGoal.count > 0) {
      localStorage.setItem('weeklyGoal', JSON.stringify(weeklyGoal));
    }
  }, [weeklyGoal]);

  useEffect(() => {
    localStorage.setItem('workoutEntries', JSON.stringify(workoutEntries));
  }, [workoutEntries]);

  // 이번 주 시작일 계산
  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff)).toISOString().split('T')[0];
  };

  // 주간 목표 설정
  const handleSetGoal = () => {
    if (newGoal && parseInt(newGoal) > 0) {
      setWeeklyGoal({
        count: parseInt(newGoal),
        startDate: getWeekStart()
      });
      setNewGoal('');
    }
  };

  // 이미지 선택 처리
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 운동 인증 추가 (사진 필수, 시간 선택사항)
  const handleAddWorkout = () => {
    if (exerciseName.trim() && selectedImage && imagePreview) {
      const newEntry: WorkoutEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        exerciseName: exerciseName.trim(),
        comment: comment.trim(),
        imageUrl: imagePreview,
        userId: 'current-user',
        userName: '나'
      };
      
      // 운동 시간이 입력된 경우에만 추가
      if (duration && parseInt(duration) > 0) {
        newEntry.duration = parseInt(duration);
      }
      
      setWorkoutEntries(prev => [newEntry, ...prev]);
      
      // 폼 리셋
      setExerciseName('');
      setComment('');
      setDuration('');
      setSelectedImage(null);
      setImagePreview('');
      setShowAddForm(false);
    }
  };

  // 개별 게시글 클릭 처리
  const handleEntryClick = (entry: WorkoutEntry) => {
    setSelectedEntry(entry);
    setShowEntryDetails(true);
  };

  // 이번 주 인증 개수 계산
  const getCurrentWeekEntries = () => {
    const weekStart = weeklyGoal.startDate || getWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    return workoutEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= new Date(weekStart) && entryDate <= weekEnd;
    });
  };

  const currentWeekEntries = getCurrentWeekEntries();
  const currentCount = currentWeekEntries.length;
  const progressPercentage = weeklyGoal.count > 0 ? Math.min((currentCount / weeklyGoal.count) * 100, 100) : 0;

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏋️‍♀️ Fit Diary</h1>
          <p className="text-gray-600">주간 운동 챌린지</p>
        </div>

        {/* 현재 팀 정보 */}
        {currentTeam && (
          <Card className="shadow-lg border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800">{currentTeam.name}</h3>
                  <p className="text-sm text-blue-600">팀 목표: {currentTeam.weeklyGoal}회/주</p>
                </div>
                <Badge variant="secondary">팀 멤버</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 주간 목표 설정 카드 */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-blue-600" />
              이번 주 목표
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyGoal.count > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{weeklyGoal.count}회</span>
                  <Badge variant={currentCount >= weeklyGoal.count ? "default" : "secondary"}>
                    {currentCount}/{weeklyGoal.count}
                  </Badge>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                {currentCount >= weeklyGoal.count && (
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <Trophy className="h-4 w-4" />
                    목표 달성! 🎉
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="목표 횟수 입력"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="flex-1"
                    disabled={!!currentTeam}
                  />
                  <Button onClick={handleSetGoal} className="bg-blue-600 hover:bg-blue-700" disabled={!!currentTeam}>
                    설정
                  </Button>
                </div>
                {currentTeam ? (
                  <p className="text-sm text-blue-500">팀에 속해있어 팀 목표가 자동으로 설정됩니다.</p>
                ) : (
                  <p className="text-sm text-gray-500">이번 주 운동 목표를 설정해보세요!</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 운동 인증 버튼 */}
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-6 text-lg font-semibold shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          운동 인증하기
        </Button>

        {/* 운동 인증 폼 */}
        {showAddForm && (
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Camera className="h-5 w-5 text-green-600" />
                운동 인증
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="운동 이름 (예: 헬스장, 홈트레이닝, 러닝 등)"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
              />
              
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="운동 시간 (분, 선택사항)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center px-3 text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  분
                </div>
              </div>
              
              <Textarea
                placeholder="오늘 운동은 어땠나요? (선택사항)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인증 사진 <span className="text-red-500">*필수</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img 
                      src={imagePreview} 
                      alt="미리보기" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                {!selectedImage && (
                  <p className="text-sm text-red-500 mt-1">운동 인증을 위해 사진을 반드시 첨부해주세요.</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddWorkout}
                  disabled={!exerciseName.trim() || !selectedImage}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  인증 완료
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 히스토리 */}
        {workoutEntries.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
                운동 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                  {workoutEntries.slice(0, 10).map((entry) => (
                    <div 
                      key={entry.id} 
                      className="border rounded-lg p-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleEntryClick(entry)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{entry.exerciseName}</h3>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                        </div>
                      </div>
                      
                      {entry.duration && (
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-600">{entry.duration}분</span>
                        </div>
                      )}
                      
                      {entry.comment && (
                        <p className="text-gray-600 text-sm mb-3">{entry.comment}</p>
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
                  
                  {workoutEntries.length > 10 && (
                    <p className="text-center text-gray-500 text-sm">
                      총 {workoutEntries.length}개의 기록이 있습니다
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* 빈 상태 메시지 */}
        {workoutEntries.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">💪</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">첫 운동을 인증해보세요!</h3>
              <p className="text-gray-500">목표를 달성하기 위한 첫 걸음을 내딛어보세요.</p>
            </CardContent>
          </Card>
        )}

        {/* 개별 게시글 상세 모달 */}
        <Dialog open={showEntryDetails} onOpenChange={setShowEntryDetails}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                운동 기록 상세
              </DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedEntry.exerciseName}</h3>
                  <p className="text-sm text-gray-500">{formatDate(selectedEntry.date)}</p>
                </div>
                
                {selectedEntry.duration && (
                  <div className="flex items-center justify-center gap-2 bg-blue-50 p-3 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">{selectedEntry.duration}분</span>
                  </div>
                )}
                
                {selectedEntry.comment && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedEntry.comment}</p>
                  </div>
                )}
                
                {selectedEntry.imageUrl && (
                  <div className="text-center">
                    <img 
                      src={selectedEntry.imageUrl} 
                      alt="운동 인증" 
                      className="w-full max-h-96 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className="text-center text-sm text-gray-500">
                  작성자: {selectedEntry.userName || '나'}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
