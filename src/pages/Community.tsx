
import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Edit2, Trash2, ArrowLeft, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImage: string;
  authorTier: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImage: string;
  authorTier: string;
  createdAt: string;
}

interface UserProfile {
  name: string;
  profileImage: string;
  bankAccount: string;
  tier: string;
  totalWorkouts: number;
}

const Community = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    content: ''
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
    const savedPosts = localStorage.getItem('communityPosts');
    if (!savedPosts) {
      // 목 데이터 생성
      const mockPosts: Post[] = [
        {
          id: 'post-1',
          title: '오늘 10km 달렸습니다! 🏃‍♂️',
          content: '날씨가 좋아서 한강에서 러닝했는데 정말 기분이 좋네요. 다들 운동 화이팅!',
          authorId: 'user-1',
          authorName: '김철수',
          authorImage: '/placeholder.svg',
          authorTier: 'Gold 3',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: ['user-2', 'user-3'],
          comments: [
            {
              id: 'comment-1',
              content: '대단하세요! 저도 내일 달려야겠어요',
              authorId: 'user-2',
              authorName: '박영희',
              authorImage: '/placeholder.svg',
              authorTier: 'Silver 1',
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'post-2',
          title: '헬스장에서 새로운 PR 달성! 💪',
          content: '데드리프트 120kg 성공했습니다! 몇 달간 노력한 보람이 있네요. 꾸준함이 답인 것 같아요.',
          authorId: 'user-4',
          authorName: '최지연',
          authorImage: '/placeholder.svg',
          authorTier: 'Diamond 1',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          likes: ['user-1', 'user-3', 'user-5'],
          comments: [
            {
              id: 'comment-2',
              content: '와우 대단해요! 저는 아직 80kg도 힘든데...',
              authorId: 'user-3',
              authorName: '이민수',
              authorImage: '/placeholder.svg',
              authorTier: 'Platinum 2',
              createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'comment-3',
              content: '꾸준함이 정말 중요하죠! 축하드려요',
              authorId: 'user-5',
              authorName: '정우진',
              authorImage: '/placeholder.svg',
              authorTier: 'Gold 5',
              createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'post-3',
          title: '요가 첫 수업 후기',
          content: '처음 요가를 해봤는데 생각보다 어렵네요. 그래도 마음이 차분해지는 느낌이 좋았어요. 꾸준히 해보려고 합니다!',
          authorId: 'user-6',
          authorName: '한소희',
          authorImage: '/placeholder.svg',
          authorTier: 'Silver 4',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          likes: ['user-1'],
          comments: []
        }
      ];
      localStorage.setItem('communityPosts', JSON.stringify(mockPosts));
      setPosts(mockPosts);
    } else {
      setPosts(JSON.parse(savedPosts));
    }
  };

  const loadProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  };

  const savePosts = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const post: Post = {
      id: `post-${Date.now()}`,
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      authorId: 'current-user',
      authorName: profile.name,
      authorImage: profile.profileImage,
      authorTier: profile.tier,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };

    const updatedPosts = [post, ...posts];
    savePosts(updatedPosts);
    
    setNewPost({ title: '', content: '' });
    setShowCreateModal(false);
    toast({
      title: "게시글 작성 완료",
      description: "새로운 게시글이 작성되었습니다.",
    });
  };

  const handleEditPost = () => {
    if (!editingPost || !newPost.title.trim() || !newPost.content.trim()) return;

    const updatedPosts = posts.map(post => 
      post.id === editingPost.id 
        ? { ...post, title: newPost.title.trim(), content: newPost.content.trim() }
        : post
    );
    savePosts(updatedPosts);
    
    if (selectedPost && selectedPost.id === editingPost.id) {
      setSelectedPost({ ...selectedPost, title: newPost.title.trim(), content: newPost.content.trim() });
    }
    
    setNewPost({ title: '', content: '' });
    setEditingPost(null);
    setShowEditModal(false);
    toast({
      title: "게시글 수정 완료",
      description: "게시글이 수정되었습니다.",
    });
  };

  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    savePosts(updatedPosts);
    
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(null);
    }
    
    toast({
      title: "게시글 삭제 완료",
      description: "게시글이 삭제되었습니다.",
    });
  };

  const handleLike = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes('current-user');
        const newLikes = hasLiked 
          ? post.likes.filter(id => id !== 'current-user')
          : [...post.likes, 'current-user'];
        return { ...post, likes: newLikes };
      }
      return post;
    });
    savePosts(updatedPosts);
    
    if (selectedPost && selectedPost.id === postId) {
      const updatedPost = updatedPosts.find(p => p.id === postId);
      if (updatedPost) setSelectedPost(updatedPost);
    }
  };

  const handleAddComment = () => {
    if (!selectedPost || !newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      content: newComment.trim(),
      authorId: 'current-user',
      authorName: profile.name,
      authorImage: profile.profileImage,
      authorTier: profile.tier,
      createdAt: new Date().toISOString()
    };

    const updatedPosts = posts.map(post =>
      post.id === selectedPost.id
        ? { ...post, comments: [...post.comments, comment] }
        : post
    );
    savePosts(updatedPosts);
    
    const updatedPost = updatedPosts.find(p => p.id === selectedPost.id);
    if (updatedPost) setSelectedPost(updatedPost);
    
    setNewComment('');
    toast({
      title: "댓글 작성 완료",
      description: "댓글이 작성되었습니다.",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return '방금 전';
  };

  const getTierEmoji = (tier: string): string => {
    if (tier.includes('Diamond')) return '💎';
    if (tier.includes('Platinum')) return '🏆';
    if (tier.includes('Gold')) return '🥇';
    if (tier.includes('Silver')) return '🥈';
    return '🥉';
  };

  const getTierColor = (tier: string): string => {
    if (tier.includes('Diamond')) return 'text-cyan-500';
    if (tier.includes('Platinum')) return 'text-gray-400';
    if (tier.includes('Gold')) return 'text-yellow-500';
    if (tier.includes('Silver')) return 'text-gray-500';
    return 'text-amber-600';
  };

  if (selectedPost) {
    return (
      <div className="p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedPost(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPost.authorImage}
                    alt={selectedPost.authorName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{selectedPost.authorName}</span>
                      <span className="text-sm">{getTierEmoji(selectedPost.authorTier)}</span>
                      <span className={`text-xs font-medium ${getTierColor(selectedPost.authorTier)}`}>
                        {selectedPost.authorTier}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(selectedPost.createdAt)}</p>
                  </div>
                </div>
                {selectedPost.authorId === 'current-user' && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPost(selectedPost);
                        setNewPost({ title: selectedPost.title, content: selectedPost.content });
                        setShowEditModal(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(selectedPost.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-2">{selectedPost.title}</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
              
              <div className="flex items-center gap-4 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(selectedPost.id)}
                  className={`flex items-center gap-2 ${
                    selectedPost.likes.includes('current-user') 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      selectedPost.likes.includes('current-user') ? 'fill-current' : ''
                    }`} 
                  />
                  <span>{selectedPost.likes.length}</span>
                </Button>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageSquare className="h-4 w-4" />
                  <span>{selectedPost.comments.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 댓글 섹션 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">댓글 ({selectedPost.comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 댓글 작성 */}
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="댓글을 작성하세요..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment();
                    }
                  }}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* 댓글 목록 */}
              <div className="space-y-3">
                {selectedPost.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={comment.authorImage}
                      alt={comment.authorName}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.authorName}</span>
                        <span className="text-xs">{getTierEmoji(comment.authorTier)}</span>
                        <span className={`text-xs font-medium ${getTierColor(comment.authorTier)}`}>
                          {comment.authorTier}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {selectedPost.comments.length === 0 && (
                  <p className="text-center text-gray-500 py-4">아직 댓글이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">커뮤니티</h1>
          <p className="text-gray-600">운동 경험을 공유하고 소통해보세요!</p>
        </div>

        {/* 게시글 작성 버튼 */}
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        >
          새 게시글 작성
        </Button>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <CardContent 
                className="p-4"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorImage}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.authorName}</span>
                        <span className="text-sm">{getTierEmoji(post.authorTier)}</span>
                        <span className={`text-xs font-medium ${getTierColor(post.authorTier)}`}>
                          {post.authorTier}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-3 line-clamp-2">{post.content}</p>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(post.id);
                    }}
                    className={`flex items-center gap-2 ${
                      post.likes.includes('current-user') 
                        ? 'text-red-500 hover:text-red-600' 
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        post.likes.includes('current-user') ? 'fill-current' : ''
                      }`} 
                    />
                    <span>{post.likes.length}</span>
                  </Button>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
            <p className="text-center text-gray-500 py-8">아직 게시글이 없습니다.</p>
          )}
        </div>

        {/* 게시글 작성 모달 */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>새 게시글 작성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="게시글 제목을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="게시글 내용을 입력하세요"
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreatePost}
                  disabled={!newPost.title.trim() || !newPost.content.trim()}
                  className="flex-1"
                >
                  작성하기
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPost({ title: '', content: '' });
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 게시글 수정 모달 */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>게시글 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTitle">제목</Label>
                <Input
                  id="editTitle"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="게시글 제목을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="editContent">내용</Label>
                <Textarea
                  id="editContent"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="게시글 내용을 입력하세요"
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleEditPost}
                  disabled={!newPost.title.trim() || !newPost.content.trim()}
                  className="flex-1"
                >
                  수정하기
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPost(null);
                    setNewPost({ title: '', content: '' });
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

export default Community;
