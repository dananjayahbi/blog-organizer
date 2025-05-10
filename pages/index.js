import { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  Fab,
  CssBaseline,
  ThemeProvider,
  createTheme,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PostList from '../components/PostList';
import PostEditor from '../components/PostEditor';
import { BlogProvider, useBlogContext } from '../components/BlogContext';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function MainContent() {
  const { posts, loading, error, addPost, updatePost, deletePost } = useBlogContext();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Open editor for creating a new post
  const handleCreatePost = () => {
    setCurrentPost(null);
    setIsEditorOpen(true);
  };

  // Open editor for editing an existing post
  const handleEditPost = (post) => {
    setCurrentPost(post);
    setIsEditorOpen(true);
  };

  // Open confirmation dialog for deleting a post
  const handleDeletePrompt = (postId) => {
    setPostToDelete(postId);
    setIsDeleteDialogOpen(true);
  };

  // Handle post save action
  const handleSavePost = async (postData) => {
    try {
      if (currentPost) {
        // Updating an existing post
        await updatePost(currentPost.id, postData);
        setSnackbar({ 
          open: true, 
          message: 'Post updated successfully', 
          severity: 'success' 
        });
      } else {
        // Creating a new post
        await addPost(postData);
        setSnackbar({ 
          open: true, 
          message: 'New post created successfully', 
          severity: 'success' 
        });
      }
      setIsEditorOpen(false);
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: 'Error saving post: ' + err.message, 
        severity: 'error' 
      });
    }
  };

  // Handle post delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      await deletePost(postToDelete);
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
      setSnackbar({ 
        open: true, 
        message: 'Post deleted successfully', 
        severity: 'success' 
      });
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: 'Error deleting post: ' + err.message, 
        severity: 'error' 
      });
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Blog Post Draft Manager
        </Typography>
        
        {/* Show error if there's any */}
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Show loading indicator */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Display list of posts */}
            <PostList
              posts={posts}
              onEdit={handleEditPost}
              onDelete={handleDeletePrompt}
            />
            
            {/* Floating action button for creating new posts */}
            <Fab
              color="primary"
              aria-label="add"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
              }}
              onClick={handleCreatePost}
            >
              <AddIcon />
            </Fab>
          </>
        )}
      </Box>
      
      {/* Post Editor Dialog */}
      <Dialog
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentPost ? 'Edit Post' : 'Create New Post'}
        </DialogTitle>
        <DialogContent>
          <PostEditor
            post={currentPost}
            onSave={handleSavePost}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this post? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
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
    </Container>
  );
}

// Main page component wrapped with providers
export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BlogProvider>
        <MainContent />
      </BlogProvider>
    </ThemeProvider>
  );
}