import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { 
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { useBlogContext } from '../../../components/BlogContext';
import PostEditor from '../../../components/PostEditor';

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  const { posts, loading: postsLoading, error: postsError, savePost } = useBlogContext();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [post, setPost] = useState(null);
  const editorRef = useRef(null);

  // Load post data when id is available
  useEffect(() => {
    if (id && posts) {
      const existingPost = posts.find(p => p.id === id);
      if (existingPost) {
        setPost(existingPost);
      } else {
        // Post not found, redirect to posts page
        router.push('/posts');
      }
    }
  }, [id, posts, router]);

  // Handle form submission
  const handleSave = async (updatedPost, isAutoSave = false) => {
    // Don't show messages or redirect for auto-saves
    if (isAutoSave) return;
    
    try {
      setLoading(true);
      // Ensure we maintain the post ID when updating
      updatedPost.id = id;
      await savePost(updatedPost);
      
      setSnackbar({
        open: true,
        message: 'Post updated successfully',
        severity: 'success'
      });
      
      // Navigate back to posts list after successful save
      setTimeout(() => {
        router.push('/posts');
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating post: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Update Post button click at the top
  const handleUpdatePost = () => {
    if (editorRef.current && editorRef.current.savePost) {
      // Use the exposed savePost method directly
      editorRef.current.savePost();
    }
  };

  // Handle navigation back
  const handleGoBack = () => {
    router.push('/posts');
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Display loading while fetching post data
  if (postsLoading || !post) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  // Display error if any
  if (postsError) {
    return (
      <Layout>
        <Alert severity="error" sx={{ my: 4 }}>
          {postsError}
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header with navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              startIcon={<ArrowBackIcon />}
              onClick={handleGoBack}
              sx={{ mr: 2 }}
            >
              Back to Posts
            </Button>
            <Typography variant="h4" component="h1">
              Edit Post
            </Typography>
          </Box>
          <Button 
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleUpdatePost}
            disabled={loading}
          >
            Update Post
          </Button>
        </Box>

        {/* Editor Form */}
        <Box id="post-form">
          <PostEditor 
            ref={editorRef}
            post={post}
            onSave={handleSave}
            onCancel={handleGoBack}
          />
        </Box>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}