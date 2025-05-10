import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Chip,
  Divider,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { marked } from 'marked';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { useBlogContext } from '../../../components/BlogContext';

export default function ViewPost() {
  const router = useRouter();
  const { id } = router.query;
  const { posts, loading, error } = useBlogContext();
  const [post, setPost] = useState(null);
  const [nextPostId, setNextPostId] = useState(null);
  const [prevPostId, setPrevPostId] = useState(null);

  // Load post data when id is available
  useEffect(() => {
    if (id && posts && posts.length > 0) {
      // Find the current post
      const currentPost = posts.find(p => p.id === id);
      if (currentPost) {
        setPost(currentPost);
        
        // Sort posts by updated date for navigation
        const sortedPosts = [...posts].sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt));
        
        // Find the index of the current post in sorted array
        const currentIndex = sortedPosts.findIndex(p => p.id === id);
        
        // Set next and previous post IDs
        if (currentIndex > 0) {
          setPrevPostId(sortedPosts[currentIndex - 1].id);
        } else {
          setPrevPostId(null);
        }
        
        if (currentIndex < sortedPosts.length - 1) {
          setNextPostId(sortedPosts[currentIndex + 1].id);
        } else {
          setNextPostId(null);
        }
      } else {
        // Post not found, redirect to posts page
        router.push('/posts');
      }
    }
  }, [id, posts, router]);
  
  // Parse markdown to HTML
  const renderMarkdown = (text) => {
    if (!text) return '';
    return { __html: marked.parse(text) };
  };
  
  // Format date to readable string
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle navigation back to posts list
  const handleBackToList = () => {
    router.push('/posts');
  };
  
  // Handle edit post
  const handleEditPost = () => {
    router.push(`/posts/editor/${id}`);
  };
  
  // Handle navigation to previous post
  const handlePrevPost = () => {
    if (prevPostId) {
      router.push(`/posts/view/${prevPostId}`);
    }
  };
  
  // Handle navigation to next post
  const handleNextPost = () => {
    if (nextPostId) {
      router.push(`/posts/view/${nextPostId}`);
    }
  };
  
  // Display loading while fetching post data
  if (loading || !post) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  // Display error if any
  if (error) {
    return (
      <Layout>
        <Alert severity="error" sx={{ my: 4 }}>
          {error}
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Top navigation bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
          >
            Back to Posts
          </Button>
          <Stack direction="row" spacing={2}>
            <Button 
              startIcon={<ArrowBackIcon />}
              disabled={!prevPostId}
              onClick={handlePrevPost}
            >
              Previous Post
            </Button>
            <Button 
              endIcon={<ArrowForwardIcon />}
              disabled={!nextPostId}
              onClick={handleNextPost}
            >
              Next Post
            </Button>
          </Stack>
        </Box>
        
        {/* Post Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              {post.tags && post.tags.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {post.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </Box>
              )}
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={handleEditPost}
            >
              Edit Post
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
            <Typography variant="body2">
              Status: <Chip 
                label={post.status || 'draft'} 
                size="small" 
                color={post.status === 'published' ? 'success' : 'default'} 
              />
            </Typography>
            <Typography variant="body2">
              Last updated: {formatDate(post.updatedAt)}
            </Typography>
          </Box>
        </Paper>
        
        {/* Post Content */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <div 
              dangerouslySetInnerHTML={renderMarkdown(post.content)} 
              className="markdown-preview"
            />
          </Box>
        </Paper>
        
        {/* Bottom navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
          >
            Back to Posts
          </Button>
          <Stack direction="row" spacing={2}>
            <Button 
              startIcon={<ArrowBackIcon />}
              disabled={!prevPostId}
              onClick={handlePrevPost}
            >
              Previous Post
            </Button>
            <Button 
              endIcon={<ArrowForwardIcon />}
              disabled={!nextPostId}
              onClick={handleNextPost}
            >
              Next Post
            </Button>
          </Stack>
        </Box>
      </Box>
    </Layout>
  );
}