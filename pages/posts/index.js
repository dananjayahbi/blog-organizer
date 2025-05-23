import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import PostList from '../../components/PostList';
import { useBlogContext } from '../../components/BlogContext';
import { useRouter } from 'next/router';

export default function Posts() {
  const { posts, loading, error, deletePost, updatePost, archivePost } = useBlogContext();
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Handle create new post
  const handleCreatePost = () => {
    router.push('/posts/editor');
  };

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

  // Handle archive post
  const handleArchivePost = async (postId) => {
    try {
      await archivePost(postId);
      setSnackbar({
        open: true,
        message: 'Post archived successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error archiving post: ${err.message}`,
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
            Posts
          </Typography>
          <Button 
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreatePost}
          >
            Create New Post
          </Button>
        </Box>

        {/* Show error if there's any */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Posts list with filters, sorting, and archive functionality */}
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
            onArchive={handleArchivePost}
            defaultStatusFilter="draft"
            hideArchived={true}
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