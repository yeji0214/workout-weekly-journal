
import React, { useState, useEffect } from 'react';
import { Plus, Dumbbell, Camera, Trash2, Edit2 } from 'lucide-react';
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

const Index = () => {
  const { toast } = useToast();
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkoutEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    exerciseName: '',
    comment: '',
    duration: '',
    image: null as File | null
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const savedEntries = localStorage.getItem('workoutEntries');
    if (savedEntries) {
      setWorkoutEntries(JSON.parse(savedEntries));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewEntry(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async () => {
    if (!newEntry.exerciseName.trim()) return;

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
      userName: '나'
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
  };

  const todayEntries = workoutEntries.filter(entry => entry.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 환영 메시지 */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">운동 기록</h1>
          <p className="text-gray-600">오늘도 열심히 운동해보세요!</p>
        </div>

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

        {/* 오늘의 운동 기록 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-blue-600" />
              오늘의 운동 ({todayEntries.length}개)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayEntries.length > 0 ? (
              <div className="space-y-3">
                {todayEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800">{entry.exerciseName}</h3>
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
                오늘 운동 기록이 없습니다.<br />
                첫 번째 운동을 기록해보세요!
              </p>
            )}
          </CardContent>
        </Card>

        {/* 운동 기록 추가/수정 모달 */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEntry ? '운동 기록 수정' : '운동 기록 추가'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="exerciseName">운동 종목</Label>
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
                <Label htmlFor="image">인증 사진 (선택사항)</Label>
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
