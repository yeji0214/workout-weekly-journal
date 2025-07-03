import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, TrendingUp, Award, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateEntries, setSelectedDateEntries] = useState<WorkoutEntry[]>([]);
  const [showDateDetails, setShowDateDetails] = useState(false);

  useEffect(() => {
    const savedEntries = localStorage.getItem('workoutEntries');
    if (savedEntries) {
      setWorkoutEntries(JSON.parse(savedEntries));
    }
  }, []);

  // 현재 월의 첫째 날과 마지막 날 계산
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // 이전/다음 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 특정 날짜에 운동 기록이 있는지 확인
  const getWorkoutEntriesForDate = (date: string) => {
    return workoutEntries.filter(entry => entry.date === date);
  };

  // 날짜 클릭 처리
  const handleDateClick = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateEntries = getWorkoutEntriesForDate(dateString);
    
    if (dateEntries.length > 0) {
      setSelectedDate(dateString);
      setSelectedDateEntries(dateEntries);
      setShowDateDetails(true);
    }
  };

  // 달력 날짜 생성
  const generateCalendarDays = () => {
    const days = [];
    
    // 이전 달의 빈 칸들
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12"></div>);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entriesForDate = getWorkoutEntriesForDate(dateString);
      const hasWorkout = entriesForDate.length > 0;
      const isToday = new Date().toDateString() === new Date(dateString).toDateString();
      
      days.push(
        <div
          key={day}
          className={`h-12 flex items-center justify-center relative cursor-pointer transition-colors
            ${hasWorkout ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-700 hover:bg-gray-100'}
            ${isToday ? 'ring-2 ring-blue-500' : ''}
            rounded-lg
          `}
          onClick={() => handleDateClick(day)}
        >
          <span>{day}</span>
          {hasWorkout && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
          )}
          {entriesForDate.length > 1 && (
            <div className="absolute bottom-1 left-1 text-xs bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
              {entriesForDate.length}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getWeeklyStats = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weeklyData = [];
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const dayEntries = workoutEntries.filter(entry => entry.date === dateString);
      
      weeklyData.push({
        day: days[i],
        count: dayEntries.length,
        duration: dayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
      });
    }
    
    return weeklyData;
  };

  const getMonthlyTrend = () => {
    const monthlyData = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthEntries = workoutEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });
      
      monthlyData.push({
        month: `${date.getMonth() + 1}월`,
        count: monthEntries.length,
        days: new Set(monthEntries.map(entry => entry.date)).size
      });
    }
    
    return monthlyData;
  };

  const getWeeklyTotal = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    return workoutEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    }).length;
  };

  const getWeeklyGoalProgress = () => {
    const weeklyTotal = getWeeklyTotal();
    const goal = 5; // 주간 목표 5회
    return Math.min((weeklyTotal / goal) * 100, 100);
  };

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center py-6">
          <h1 className="text-2xl font-bold text-gray-800">월간 히스토리</h1>
        </div>

        {/* 달력 헤더 */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                <span className="text-lg font-semibold">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div key={day} className={`h-8 flex items-center justify-center text-sm font-medium
                  ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'}
                `}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* 달력 본체 */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays()}
            </div>
            
            {/* 범례 */}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 rounded border"></div>
                <span>운동한 날</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>운동 기록</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 월간 통계 */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">이번 달 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {workoutEntries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate.getMonth() === currentDate.getMonth() && 
                           entryDate.getFullYear() === currentDate.getFullYear();
                  }).length}
                </div>
                <div className="text-sm text-gray-600">총 운동 횟수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(workoutEntries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate.getMonth() === currentDate.getMonth() && 
                           entryDate.getFullYear() === currentDate.getFullYear();
                  }).map(entry => entry.date)).size}
                </div>
                <div className="text-sm text-gray-600">운동한 날</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 주간 운동 통계 */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              주간 운동 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getWeeklyStats()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{getWeeklyTotal()}</div>
                <div className="text-sm text-gray-600">이번 주 총 운동</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(getWeeklyGoalProgress())}%
                </div>
                <div className="text-sm text-gray-600">목표 달성률</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 월간 운동 추이 */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              월간 운동 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getMonthlyTrend()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 날짜별 상세 정보 모달 */}
        <Dialog open={showDateDetails} onOpenChange={setShowDateDetails}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {formatDate(selectedDate)}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                {selectedDateEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{entry.exerciseName}</h3>
                    
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
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      작성자: {entry.userName || '나'}
                    </div>
                  </div>
                ))}
                
                {selectedDateEntries.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    해당 날짜에 운동 기록이 없습니다.
                  </p>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Calendar;
