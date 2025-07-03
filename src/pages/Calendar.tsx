
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  useEffect(() => {
    loadEntries();
    setWeekStart();
  }, []);

  const loadEntries = () => {
    const savedEntries = localStorage.getItem('workoutEntries');
    if (savedEntries) {
      setWorkoutEntries(JSON.parse(savedEntries));
    }
  };

  const setWeekStart = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    setCurrentWeekStart(startOfWeek);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDayName = (date: Date) => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return days[date.getDay()];
  };

  const getWeeklyData = () => {
    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      const dateStr = formatDate(date);
      const workoutsOnDate = workoutEntries.filter(entry => entry.date === dateStr);
      
      weekData.push({
        day: getDayName(date),
        date: date.getDate(),
        workouts: workoutsOnDate.length,
        fullDate: dateStr
      });
    }
    return weekData;
  };

  const getMonthlyData = () => {
    const monthlyData: { [key: string]: number } = {};
    
    workoutEntries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .map(([month, count]) => ({
        month: month.split('-')[1] + '월',
        workouts: count
      }))
      .slice(-6);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  };

  const selectedDateEntries = selectedDate 
    ? workoutEntries.filter(entry => entry.date === formatDate(selectedDate))
    : [];

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">운동 달력</h1>
        
        {/* 달력 */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-0"
              modifiers={{
                workout: workoutEntries.map(entry => new Date(entry.date))
              }}
              modifiersStyles={{
                workout: { 
                  backgroundColor: '#3b82f6', 
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* 선택된 날짜의 운동 기록 */}
        {selectedDate && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일의 운동
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEntries.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEntries.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <h3 className="font-semibold text-gray-800">{entry.exerciseName}</h3>
                      {entry.duration && (
                        <p className="text-sm text-blue-600">{entry.duration}분</p>
                      )}
                      {entry.comment && (
                        <p className="text-gray-600 text-sm mt-1">{entry.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  이 날에는 운동 기록이 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 주간 운동 통계 */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                주간 운동 통계
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateWeek('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateWeek('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyData.map((day, index) => (
                <div key={day.fullDate} className="flex items-center gap-3">
                  <div className="w-8 text-center text-sm font-medium text-gray-600">
                    {day.day}
                  </div>
                  <div className="flex-1 relative">
                    <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-6 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          day.workouts > 0 
                            ? 'bg-gradient-to-r from-blue-400 to-blue-600 shadow-sm' 
                            : ''
                        }`}
                        style={{ 
                          width: `${Math.max((day.workouts / Math.max(...weeklyData.map(d => d.workouts), 1)) * 100, day.workouts > 0 ? 20 : 0)}%`,
                          animation: `scale-in 0.6s ease-out ${index * 0.1}s both`
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between px-2">
                      <span className="text-xs font-medium text-gray-700">
                        {day.date}일
                      </span>
                      {day.workouts > 0 && (
                        <span className="text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full">
                          {day.workouts}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                이번 주 총 운동: <span className="font-bold text-blue-600">{weeklyData.reduce((sum, day) => sum + day.workouts, 0)}회</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 월간 운동 추이 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              월간 운동 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="workouts" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
