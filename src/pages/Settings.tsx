
import React, { useState, useEffect } from 'react';
import { User, Camera, CreditCard, Save, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface UserProfile {
  name: string;
  profileImage: string;
  bankAccount: string;
  tier: string;
  totalWorkouts: number;
}

const Settings = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    name: '나',
    profileImage: '/placeholder.svg',
    bankAccount: '',
    tier: 'Bronze 5',
    totalWorkouts: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedEntries = localStorage.getItem('workoutEntries');
    
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
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

  const handleSave = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    setIsEditing(false);
    toast({
      title: "프로필 저장 완료",
      description: "설정이 성공적으로 저장되었습니다.",
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, profileImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-800">설정</h1>
          <div className="w-16"></div>
        </div>

        {/* 프로필 카드 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              프로필
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 프로필 이미지 */}
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={profile.profileImage}
                  alt="프로필"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 티어 정보 */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">{getTierEmoji(profile.tier)}</span>
                <span className={`text-lg font-bold ${getTierColor(profile.tier)}`}>
                  {profile.tier}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                총 운동 횟수: {profile.totalWorkouts}회
              </p>
            </div>

            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
              />
            </div>

            {/* 계좌 정보 */}
            <div className="space-y-2">
              <Label htmlFor="bankAccount" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                계좌번호 (선택사항)
              </Label>
              <Input
                id="bankAccount"
                value={profile.bankAccount}
                onChange={(e) => setProfile(prev => ({ ...prev, bankAccount: e.target.value }))}
                placeholder="예: 110-123-456789"
                disabled={!isEditing}
              />
              <p className="text-xs text-gray-500">
                팀 참여를 위해서는 계좌 등록이 필요합니다.
              </p>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    취소
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  프로필 수정
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
