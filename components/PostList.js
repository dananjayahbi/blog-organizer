import { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PublishIcon from '@mui/icons-material/Publish';
import { format } from 'date-fns';

export default function PostList({ posts, onEdit, onDelete, onUpdateStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  
  // Open status edit dialog
  const handleStatusEditClick = (post) => {
    setCurrentPost(post);
    setIsPublished(post.status === 'published');
    setStatusDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setStatusDialogOpen(false);
    setCurrentPost(null);
  };

  // Update status
  const handleStatusUpdate = () => {
    if (currentPost) {
      onUpdateStatus(currentPost.id, isPublished ? 'published' : 'draft');
      setStatusDialogOpen(false);
      setCurrentPost(null);
    }
  };

  // Filter posts based on search term and selected tag
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = filterTag === '' || 
      (post.tags && post.tags.includes(filterTag));
    
    return matchesSearch && matchesTag;
  });

  // Extract all unique tags from posts
  const allTags = [...new Set(posts.flatMap(post => post.tags || []))];

  // Handle tag click for filtering
  const handleTagClick = (tag) => {
    if (filterTag === tag) {
      setFilterTag(''); // Clear filter if same tag clicked
    } else {
      setFilterTag(tag);
    }
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get excerpt from content
  const getExcerpt = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'default';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Search and filters */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>
      
      {/* Tags filter */}
      {allTags.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {allTags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              onClick={() => handleTagClick(tag)}
              color={filterTag === tag ? 'primary' : 'default'}
              variant={filterTag === tag ? 'filled' : 'outlined'}
            />
          ))}
          {filterTag && (
            <Chip
              label="Clear filter"
              size="small"
              onClick={() => setFilterTag('')}
              color="secondary"
            />
          )}
        </Box>
      )}

      {/* Posts list */}
      <Paper variant="outlined">
        {filteredPosts.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">No posts found</Typography>
          </Box>
        ) : (
          <List>
            {filteredPosts.map((post, index) => (
              <Box key={post.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" component="div" sx={{ mr: 1 }}>
                          {post.title}
                        </Typography>
                        <Chip 
                          size="small"
                          label={post.status || 'draft'}
                          color={getStatusChipColor(post.status)}
                          onClick={() => handleStatusEditClick(post)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                          sx={{ display: 'block', mb: 1 }}
                        >
                          {getExcerpt(post.content)}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {post.tags && post.tags.map(tag => (
                            <Chip 
                              key={tag} 
                              label={tag} 
                              size="small" 
                              onClick={() => handleTagClick(tag)}
                            />
                          ))}
                        </Box>
                        
                        <Typography variant="caption" color="textSecondary">
                          Created: {formatDate(post.createdAt)}
                          {post.updatedAt !== post.createdAt && 
                            ` • Updated: ${formatDate(post.updatedAt)}`}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleStatusEditClick(post)} title="Change Status">
                      <PublishIcon fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" onClick={() => onEdit(post)} title="Edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" onClick={() => onDelete(post.id)} title="Delete">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredPosts.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Paper>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseDialog}>
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleStatusUpdate} color="primary" variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}