
import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, User, Plus, Edit2, Trash2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorTier: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

const Community = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const currentUser = '나';

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      // 목 데이터
      const mockPosts: Post[] = [
        {
          id: 'post-1',
          title: '오늘 처음으로 5km 달리기 성공!',
          content: '드디어 5km를 쉬지 않고 뛸 수 있게 되었어요! 정말 뿌듯합니다. 다음 목표는 10km입니다!',
          author: '김철수',
          authorTier: 'Gold 3',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 12,
          likedBy: ['이영희', '박민수'],
          comments: [
            {
              id: 'comment-1',
              postId: 'post-1',
              author: '이영희',
              content: '축하드려요! 저도 도전해봐야겠어요.',
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: 'post-2',
          title: '홈트레이닝 루틴 공유합니다',
          content: '집에서 할 수 있는 효과적인 운동 루틴을 공유해요!\n1. 버피 10회\n2. 스쿼트 20회\n3. 푸시업 15회\n4. 플랭크 1분\n\n3세트 반복하면 정말 좋아요!',
          author: '최수연',
          authorTier: 'Silver 2',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          likes: 8,
          likedBy: ['김철수'],
          comments: []
        }
      ];
      setPosts(mockPosts);
      localStorage.setItem('communityPosts', JSON.stringify(mockPosts));
    }
  };

  const getUserTier = (): string => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      return profile.tier || 'Bronze 5';
    }
    return 'Bronze 5';
  };

  const getTierEmoji = (tier: string): string => {
    if (tier.includes('Diamond')) return '💎';
    if (tier.includes('Platinum')) return '🏆';
    if (tier.includes('Gold')) return '🥇';
    if (tier.includes('Silver')) return '🥈';
    return '🥉';
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const post: Post = {
      id: `post-${Date.now()}`,
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      author: currentUser,
      authorTier: getUserTier(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: []
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));

    setNewPost({ title: '', content: '' });
    setShowCreatePost(false);
    toast({
      title: "게시글 작성 완료",
      description: "게시글이 성공적으로 작성되었습니다.",
    });
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setNewPost({ title: post.title, content: post.content });
    setShowCreatePost(true);
  };

  const handleUpdatePost = () => {
    if (!editingPost || !newPost.title.trim() || !newPost.content.trim()) return;

    const updatedPosts = posts.map(post => 
      post.id === editingPost.id 
        ? { ...post, title: newPost.title.trim(), content: newPost.content.trim() }
        : post
    );

    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    
    setNewPost({ title: '', content: '' });
    setEditingPost(null);
    setShowCreatePost(false);
    setShowPostDetail(false);
    
    toast({
      title: "게시글 수정 완료",
      description: "게시글이 성공적으로 수정되었습니다.",
    });
  };

  const handleLikePost = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes(currentUser);
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedBy: isLiked 
            ? post.likedBy.filter(user => user !== currentUser)
            : [...post.likedBy, currentUser]
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    
    // 선택된 게시글도 업데이트
    if (selectedPost) {
      const updatedSelectedPost = updatedPosts.find(p => p.id === selectedPost.id);
      setSelectedPost(updatedSelectedPost || null);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      postId,
      author: currentUser,
      content: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, comment] };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    setNewComment('');

    if (selectedPost) {
      setSelectedPost(updatedPosts.find(p => p.id === postId) || null);
    }
  };

  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    setShowPostDetail(false);
    toast({
      title: "게시글 삭제",
      description: "게시글이 삭제되었습니다.",
    });
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    return '방금 전';
  };

  const handleCreateOrUpdate = () => {
    if (editingPost) {
      handleUpdatePost();
    } else {
      handleCreatePost();
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold text-gray-800">커뮤니티</h1>
          <Button 
            onClick={() => {
              setEditingPost(null);
              setNewPost({ title: '', content: '' });
              setShowCreatePost(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            글쓰기
          </Button>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{post.author}</span>
                    <span className="text-sm">{getTierEmoji(post.authorTier)}</span>
                    <span className="text-xs text-gray-500">{post.authorTier}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(post.createdAt)}
                  </span>
                </div>
                
                <h3 
                  className="font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600"
                  onClick={() => {
                    setSelectedPost(post);
                    setShowPostDetail(true);
                  }}
                >
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikePost(post.id)}
                      className={`p-1 ${post.likedBy.includes(currentUser) ? 'text-red-500' : 'text-gray-500'}`}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${post.likedBy.includes(currentUser) ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPost(post);
                        setShowPostDetail(true);
                      }}
                      className="p-1 text-gray-500"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {post.comments.length}
                    </Button>
                  </div>
                  
                  {post.author === currentUser && (
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1 text-red-500"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {posts.length === 0 && (
            <Card className="shadow-lg">
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">아직 게시글이 없습니다.</p>
                <p className="text-gray-400 text-sm">첫 번째 글을 작성해보세요!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 글쓰기/수정 모달 */}
        <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPost ? '게시글 수정' : '새 게시글 작성'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="제목을 입력하세요"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="내용을 입력하세요"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={5}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateOrUpdate}
                  disabled={!newPost.title.trim() || !newPost.content.trim()}
                  className="flex-1"
                >
                  {editingPost ? '수정하기' : '작성하기'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreatePost(false);
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

        {/* 게시글 상세 모달 */}
        <Dialog open={showPostDetail} onOpenChange={setShowPostDetail}>
          <DialogContent className="max-w-md">
            {selectedPost && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-left">{selectedPost.title}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-96">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{selectedPost.author}</span>
                      <span>{getTierEmoji(selectedPost.authorTier)}</span>
                      <span>{selectedPost.authorTier}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(selectedPost.createdAt)}</span>
                    </div>
                    
                    <div className="whitespace-pre-wrap text-gray-700">
                      {selectedPost.content}
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikePost(selectedPost.id)}
                        className={selectedPost.likedBy.includes(currentUser) ? 'text-red-500' : 'text-gray-500'}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${selectedPost.likedBy.includes(currentUser) ? 'fill-current' : ''}`} />
                        {selectedPost.likes}
                      </Button>
                    </div>

                    {/* 댓글 섹션 */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">댓글 {selectedPost.comments.length}개</h4>
                      
                      <div className="space-y-3 mb-4">
                        {selectedPost.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Input
                          placeholder="댓글을 입력하세요"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleAddComment(selectedPost.id)}
                          disabled={!newComment.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Community;
