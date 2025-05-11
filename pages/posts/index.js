import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TablePagination,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel,
  FormGroup,
  Checkbox
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { useBlogContext } from '../../components/BlogContext';
import { useRouter } from 'next/router';

export default function Posts() {
  const { posts, loading, error, deletePost, deleteMultiplePosts, updatePost } = useBlogContext();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  // New state for bulk selection
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle create new post
  const handleCreatePost = () => {
    router.push('/posts/editor');
  };

  // Handle edit post
  const handleEditPost = (postId) => {
    router.push(`/posts/editor/${postId}`);
  };

  // Handle view post details
  const handleViewPost = (postId) => {
    router.push(`/posts/view/${postId}`);
  };

  // Open delete confirmation dialog for a single post
  const handleDeletePrompt = (postId) => {
    setPostToDelete(postId);
    setIsBulkDelete(false);
    setIsDeleteDialogOpen(true);
  };

  // Open delete confirmation dialog for multiple posts
  const handleBulkDeletePrompt = () => {
    setIsBulkDelete(true);
    setIsDeleteDialogOpen(true);
  };

  // Handle post delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      if (isBulkDelete) {
        // Delete multiple posts
        const result = await deleteMultiplePosts(selectedPosts);
        setIsDeleteDialogOpen(false);
        setSelectedPosts([]);
        setSelectAll(false);
        setSnackbar({ 
          open: true, 
          message: `${result.deletedCount} posts deleted successfully`, 
          severity: 'success' 
        });
      } else {
        // Delete a single post
        await deletePost(postToDelete);
        setIsDeleteDialogOpen(false);
        setPostToDelete(null);
        setSnackbar({ 
          open: true, 
          message: 'Post deleted successfully', 
          severity: 'success' 
        });
      }
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: 'Error deleting post(s): ' + err.message, 
        severity: 'error' 
      });
      if (isBulkDelete) {
        setSelectedPosts([]);
        setSelectAll(false);
      }
    }
  };

  // Toggle select all posts
  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    setSelectAll(checked);
    
    if (checked) {
      // Get IDs of all posts on the current page
      const visiblePosts = filteredPosts
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(post => post.id);
      setSelectedPosts(visiblePosts);
    } else {
      setSelectedPosts([]);
    }
  };

  // Toggle select individual post
  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => {
      if (prev.includes(postId)) {
        // Remove from selection
        const newSelected = prev.filter(id => id !== postId);
        setSelectAll(false);
        return newSelected;
      } else {
        // Add to selection
        const newSelected = [...prev, postId];
        
        // Check if all posts on the current page are now selected
        const visiblePosts = filteredPosts
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map(post => post.id);
        
        if (visiblePosts.every(id => newSelected.includes(id))) {
          setSelectAll(true);
        }
        
        return newSelected;
      }
    });
  };

  // Open status edit dialog
  const handleStatusEditClick = (post) => {
    setCurrentPost(post);
    setIsPublished(post.status === 'published');
    setIsStatusDialogOpen(true);
  };

  // Close status dialog
  const handleCloseStatusDialog = () => {
    setIsStatusDialogOpen(false);
    setCurrentPost(null);
  };

  // Update status
  const handleStatusUpdate = async () => {
    if (currentPost) {
      try {
        const newStatus = isPublished ? 'published' : 'draft';
        await updatePost(currentPost.id, { status: newStatus });
        setSnackbar({ 
          open: true, 
          message: `Post status updated to ${newStatus}`, 
          severity: 'success' 
        });
      } catch (err) {
        setSnackbar({ 
          open: true, 
          message: 'Error updating post status: ' + err.message, 
          severity: 'error' 
        });
      }
      setIsStatusDialogOpen(false);
      setCurrentPost(null);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter posts based on search term
  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  ) || [];

  // Format date to readable string
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Posts
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {selectedPosts.length > 0 && (
              <Button 
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDeletePrompt}
              >
                Delete Selected ({selectedPosts.length})
              </Button>
            )}
            <Button 
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreatePost}
            >
              Create New Post
            </Button>
          </Box>
        </Box>

        {/* Show error if there's any */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Search field */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Search posts"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </Box>

        {/* Posts table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table stickyHeader aria-label="posts table">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedPosts.length > 0 && selectedPosts.length < Math.min(rowsPerPage, filteredPosts.length)}
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPosts.length > 0 ? (
                    filteredPosts
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((post) => (
                        <TableRow hover key={post.id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedPosts.includes(post.id)}
                              onChange={() => handleSelectPost(post.id)}
                            />
                          </TableCell>
                          <TableCell component="th" scope="row">
                            {post.title}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Chip 
                                label={post.status || 'draft'}
                                color={post.status === 'published' ? 'success' : 'default'}
                                size="small"
                                sx={{ mr: 1 }}
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => handleStatusEditClick(post)}
                                title="Change Status"
                              >
                                <PublishIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {post.tags && post.tags.length > 0 ? (
                                post.tags.map((tag, index) => (
                                  <Chip key={index} label={tag} size="small" />
                                ))
                              ) : (
                                <Typography variant="caption" color="text.secondary">
                                  No tags
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{formatDate(post.updatedAt)}</TableCell>
                          <TableCell align="center">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewPost(post.id)}
                              title="View"
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditPost(post.id)}
                              title="Edit"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeletePrompt(post.id)}
                              title="Delete"
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        {searchTerm ? 'No results found' : 'No posts available'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredPosts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <DialogTitle>
            {isBulkDelete ? 'Delete Multiple Posts' : 'Delete Post'}
          </DialogTitle>
          <DialogContent>
            {isBulkDelete ? (
              <Typography>
                Are you sure you want to delete {selectedPosts.length} {selectedPosts.length === 1 ? 'post' : 'posts'}? This action cannot be undone.
              </Typography>
            ) : (
              <Typography>
                Are you sure you want to delete this post? This action cannot be undone.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Status Update Dialog */}
        <Dialog open={isStatusDialogOpen} onClose={handleCloseStatusDialog}>
          <DialogTitle>Update Post Status</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" gutterBottom>
                {currentPost?.title}
              </Typography>
              <FormGroup>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                  } 
                  label={isPublished ? "Published" : "Draft"}
                />
              </FormGroup>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatusDialog}>Cancel</Button>
            <Button onClick={handleStatusUpdate} color="primary" variant="contained">
              Update
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
      </Box>
    </Layout>
  );
}