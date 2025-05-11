import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import Layout from '../../components/Layout';
import PostList from '../../components/PostList';
import { useBlogContext } from '../../components/BlogContext';
import { useRouter } from 'next/router';

export default function Archives() {
  const { posts, loading, error, deletePost, updatePost, unarchivePost } = useBlogContext();
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Handle edit post
  const handleEditPost = (post) => {
    router.push(`/posts/editor/${post.id}`);
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setSnackbar({
        open: true,
        message: 'Post deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error deleting post: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Handle update post status
  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      await updatePost(postId, { status: newStatus });
      setSnackbar({
        open: true,
        message: `Post status updated to ${newStatus}`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error updating post status: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Handle unarchive post
  const handleUnarchivePost = async (postId) => {
    try {
      await unarchivePost(postId);
      setSnackbar({
        open: true,
        message: 'Post restored to drafts successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error restoring post: ${err.message}`,
        severity: 'error'
      });
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Archives
          </Typography>
        </Box>

        {/* Show error if there's any */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Archived posts list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <PostList 
            posts={posts} 
            onEdit={handleEditPost} 
            onDelete={handleDeletePost}
            onUpdateStatus={handleUpdateStatus}
            onUnarchive={handleUnarchivePost}
            archivesMode={true}
          />
        )}
        
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