import { useState } from 'react';
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

export default function CreatePost() {
  const router = useRouter();
  const { addPost } = useBlogContext();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Handle form submission
  const handleSave = async (postData, isAutoSave = false) => {
    // Don't show messages or redirect for auto-saves
    if (isAutoSave) return;
    
    try {
      setLoading(true);
      await addPost(postData);
      
      setSnackbar({
        open: true,
        message: 'Post saved successfully',
        severity: 'success'
      });
      
      // Navigate back to posts list after successful save
      setTimeout(() => {
        router.push('/posts');
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error saving post: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
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
              Create New Post
            </Typography>
          </Box>
          <Button 
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={() => document.getElementById('post-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
            disabled={loading}
          >
            Save Post
          </Button>
        </Box>

        {/* Editor Form */}
        <Box id="post-form">
          <PostEditor 
            post={{}} // Empty post for new creation
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