import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Link } from 'react-router-dom';
import { Edit2, Heart, MessageSquare, Plus, Trash2 } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  authorImage: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  authorImage: string;
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
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    name: '나',
    profileImage: '/placeholder.svg',
    bankAccount: '',
    tier: 'Bronze 5',
    totalWorkouts: 0
  });

  useEffect(() => {
    loadPosts();
    loadProfile();
  }, []);

  const loadProfile = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
    }
  };

  const loadPosts = () => {
    const savedPosts = localStorage.getItem('communityPosts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  };

  const handleSubmit = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    const post: Post = {
      id: editingPost?.id || `post-${Date.now()}`,
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      author: profile.name, // 동기화된 프로필 이름 사용
      authorId: 'current-user',
      authorImage: profile.profileImage, // 동기화된 프로필 이미지 사용
      createdAt: editingPost?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: editingPost?.likes || 0,
      comments: editingPost?.comments || []
    };

    let updatedPosts;
    if (editingPost) {
      updatedPosts = posts.map(p => p.id === editingPost.id ? post : p);
      toast({
        title: "게시글 수정 완료",
        description: "게시글이 성공적으로 수정되었습니다.",
      });
    } else {
      updatedPosts = [post, ...posts];
      toast({
        title: "게시글 작성 완료",
        description: "새 게시글이 작성되었습니다.",
      });
    }

    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
    
    setNewPost({ title: '', content: '' });
    setEditingPost(null);
    setShowModal(false);
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setNewPost({ title: post.title, content: post.content });
    setShowModal(true);
  };

  const handleDelete = (postId: string) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
    toast({
      title: "게시글 삭제 완료",
      description: "게시글이 성공적으로 삭제되었습니다.",
    });
  };

  const handleLike = (postId: string) => {
    const updatedPosts = posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    );
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !selectedPost) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      content: newComment.trim(),
      author: profile.name, // 동기화된 프로필 이름 사용
      authorId: 'current-user',
      authorImage: profile.profileImage, // 동기화된 프로필 이미지 사용
      createdAt: new Date().toISOString()
    };

    const updatedPost = {
      ...selectedPost,
      comments: [...selectedPost.comments, comment]
    };

    const updatedPosts = posts.map(p => p.id === selectedPost.id ? updatedPost : p);
    localStorage.setItem('communityPosts', JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
    setSelectedPost(updatedPost);
    setNewComment('');
    
    toast({
      title: "댓글 작성 완료",
      description: "댓글이 추가되었습니다.",
    });
  };

  return (
    <div className="p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">커뮤니티</h1>
          <p className="text-gray-600">자유롭게 소통하고 정보를 공유하세요!</p>
        </div>

        {/* 글쓰기 버튼 */}
        <Button onClick={() => {
            setEditingPost(null);
            setNewPost({ title: '', content: '' });
            setShowModal(true);
          }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
          <Plus className="h-5 w-5 mr-2" />
          새 게시글 작성
        </Button>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.authorImage} alt={post.author} />
                      <AvatarFallback>{post.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <div className="text-sm text-gray-500">
                        {post.author}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(post)}
                      className="p-1 h-6 w-6"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{post.content}</p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className="p-2"
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      좋아요 {post.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPost(post)}
                      className="p-2"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      댓글 {post.comments.length}
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* 댓글 목록 */}
                {selectedPost?.id === post.id && (
                  <div className="mt-4 space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.authorImage} alt={comment.author} />
                          <AvatarFallback>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{comment.author}</div>
                          <div className="text-gray-700">{comment.content}</div>
                          <div className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}

                    {/* 댓글 입력 */}
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile.profileImage} alt={profile.name} />
                        <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <Input
                        type="text"
                        placeholder="댓글을 입력하세요"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleCommentSubmit} disabled={!newComment.trim()}>
                        작성
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 글쓰기 모달 */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPost ? '게시글 수정' : '새 게시글 작성'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="제목을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="내용을 입력하세요"
                  rows={5}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} disabled={!newPost.title.trim() || !newPost.content.trim()} className="flex-1">
                  {editingPost ? '수정하기' : '작성하기'}
                </Button>
                <Button variant="outline" onClick={() => {
                    setShowModal(false);
                    setEditingPost(null);
                    setNewPost({ title: '', content: '' });
                  }} className="flex-1">
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
