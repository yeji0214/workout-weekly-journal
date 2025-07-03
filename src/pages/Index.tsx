import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Trophy, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';

interface WorkoutEntry {
  id: string;
  date: string;
  exerciseName: string;
  comment: string;
  duration?: number;
  imageUrl?: string;
}

const Index = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [exerciseName, setExerciseName] = useState('');
  const [comment, setComment] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const savedEntries = localStorage.getItem('workoutEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  };

  const resetForm = () => {
    setExerciseName('');
    setComment('');
    setDuration('');
    setSelectedDate(undefined);
  };

  const handleSubmit = () => {
    if (!exerciseName.trim()) return;

    const newEntry: WorkoutEntry = {
      id: `entry-${Date.now()}`,
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      exerciseName: exerciseName.trim(),
      comment: comment.trim(),
      duration: duration ? parseInt(duration) : undefined,
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('workoutEntries', JSON.stringify(updatedEntries));
    resetForm();
    setShowDialog(false);
    toast({
      title: "운동 기록 추가",
      description: "새로운 운동 기록이 추가되었습니다.",
    });
  };

  const calculateTier = (totalWorkouts: number): string => {
    if (totalWorkouts >= 100) return 'Diamond';
    if (totalWorkouts >= 75) return 'Platinum';
    if (totalWorkouts >= 50) return 'Gold';
    if (totalWorkouts >= 25) return 'Silver';
    return 'Bronze';
  };

  const getTierColor = (tier: string): string => {
    switch (tier) {
      case 'Diamond': return 'text-cyan-500';
      case 'Platinum': return 'text-gray-400';
      case 'Gold': return 'text-yellow-500';
      case 'Silver': return 'text-gray-500';
      default: return 'text-amber-600';
    }
  };

  const getTierEmoji = (tier: string): string => {
    switch (tier) {
      case 'Diamond': return '💎';
      case 'Platinum': return '🏆';
      case 'Gold': return '🥇';  
      case 'Silver': return '🥈';
      default: return '🥉';
    }
  };

  const handleEditEntry = (entry: WorkoutEntry) => {
    setEditingEntry(entry);
    setExerciseName(entry.exerciseName);
    setComment(entry.comment);
    setDuration(entry.duration?.toString() || '');
    setSelectedDate(new Date(entry.date));
    setShowEditDialog(true);
  };

  const handleUpdateEntry = () => {
    if (!editingEntry || !exerciseName.trim()) return;

    const updatedEntries = entries.map(entry => {
      if (entry.id === editingEntry.id) {
        return {
          ...entry,
          exerciseName: exerciseName.trim(),
          comment: comment.trim(),
          duration: duration ? parseInt(duration) : undefined,
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        };
      }
      return entry;
    });

    setEntries(updatedEntries);
    localStorage.setItem('workoutEntries', JSON.stringify(updatedEntries));
    
    resetForm();
    setShowEditDialog(false);
    setEditingEntry(null);
    
    toast({
      title: "운동 기록 수정",
      description: "운동 기록이 성공적으로 수정되었습니다.",
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    setEntries(updatedEntries);
    localStorage.setItem('workoutEntries', JSON.stringify(updatedEntries));
    
    toast({
      title: "운동 기록 삭제",
      description: "운동 기록이 삭제되었습니다.",
    });
  };

  const getWeeklyData = () => {
    const weeklyData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short' });
      const count = entries.filter(entry => entry.date === dateStr).length;
      
      weeklyData.push({
        day: dayName,
        count: count,
        date: dateStr
      });
    }
    
    return weeklyData;
  };

  const getMonthlyData = () => {
    const monthlyData = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('ko-KR', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const count = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
      }).length;
      
      monthlyData.push({
        month: monthName,
        count: count
      });
    }
    
    return monthlyData;
  };

  const currentTier = calculateTier(entries.length);

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 티어 헤더 */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-3xl">{getTierEmoji(currentTier)}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">운동 기록</h1>
              <div className={`text-lg font-bold ${getTierColor(currentTier)}`}>
                {currentTier} 티어
              </div>
            </div>
          </div>
          <p className="text-gray-600">총 {entries.length}회 운동 완료</p>
        </div>

        {/* 통계 차트 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              주간 운동 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getWeeklyData()}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>월간 운동 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getMonthlyData()}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 운동 기록 추가 폼 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>오늘의 운동 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="운동 종목"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
              />
              <Textarea
                placeholder="메모 (선택사항)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Input
                type="number"
                placeholder="운동 시간 (분, 선택사항)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? selectedDate.toLocaleDateString('ko-KR') : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={() => setShowDialog(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 최근 운동 기록 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>최근 운동 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{entry.exerciseName}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.date).toLocaleDateString('ko-KR')}
                        {entry.duration && ` • ${entry.duration}분`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                        className="p-1"
                      >
                        <Edit2 className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
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
              
              {entries.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  아직 운동 기록이 없습니다. 첫 번째 운동을 기록해보세요!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 운동 기록 추가 모달 */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 운동 기록 추가</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="운동 종목"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
              />
              <Textarea
                placeholder="메모 (선택사항)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Input
                type="number"
                placeholder="운동 시간 (분, 선택사항)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? selectedDate.toLocaleDateString('ko-KR') : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmit}
                  disabled={!exerciseName.trim()}
                  className="flex-1"
                >
                  추가
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDialog(false)}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 운동 기록 수정 모달 */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>운동 기록 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="운동 종목"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
              />
              <Textarea
                placeholder="메모 (선택사항)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <Input
                type="number"
                placeholder="운동 시간 (분, 선택사항)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? selectedDate.toLocaleDateString('ko-KR') : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdateEntry}
                  disabled={!exerciseName.trim()}
                  className="flex-1"
                >
                  수정하기
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditDialog(false)}
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
