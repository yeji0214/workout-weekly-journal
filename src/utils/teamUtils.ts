
export const getTierEmoji = (tier: string): string => {
  if (tier.includes('Diamond')) return '💎';
  if (tier.includes('Platinum')) return '🏆';
  if (tier.includes('Gold')) return '🥇';
  if (tier.includes('Silver')) return '🥈';
  return '🥉';
};

export const getTierColor = (tier: string): string => {
  if (tier.includes('Diamond')) return 'text-cyan-500';
  if (tier.includes('Platinum')) return 'text-gray-400';
  if (tier.includes('Gold')) return 'text-yellow-500';
  if (tier.includes('Silver')) return 'text-gray-500';
  return 'text-amber-600';
};

export interface Team {
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

export interface UserProfile {
  name: string;
  profileImage: string;
  bankAccount: string;
  tier: string;
  totalWorkouts: number;
}

export const createMockTeams = (): Team[] => [
  {
    id: 'team-1',
    name: '아침 러닝 클럽',
    weeklyGoal: 5,
    members: [
      {
        id: 'user-1',
        name: '김철수',
        profileImage: '/placeholder.svg',
        tier: 'Gold 3',
        weeklyProgress: 3
      },
      {
        id: 'user-2',
        name: '박영희',
        profileImage: '/placeholder.svg',
        tier: 'Silver 1',
        weeklyProgress: 4
      }
    ]
  },
  {
    id: 'team-2',
    name: '헬스 매니아들',
    weeklyGoal: 4,
    members: [
      {
        id: 'user-3',
        name: '이민수',
        profileImage: '/placeholder.svg',
        tier: 'Platinum 2',
        weeklyProgress: 2
      },
      {
        id: 'user-4',
        name: '최지연',
        profileImage: '/placeholder.svg',
        tier: 'Diamond 1',
        weeklyProgress: 4
      },
      {
        id: 'user-5',
        name: '정우진',
        profileImage: '/placeholder.svg',
        tier: 'Gold 5',
        weeklyProgress: 1
      }
    ]
  },
  {
    id: 'team-3',
    name: '요가 & 필라테스',
    weeklyGoal: 3,
    members: [
      {
        id: 'user-6',
        name: '한소희',
        profileImage: '/placeholder.svg',
        tier: 'Silver 4',
        weeklyProgress: 2
      }
    ]
  }
];
