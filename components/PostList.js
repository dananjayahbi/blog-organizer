import { useState, useEffect, useRef, useCallback } from 'react';
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
  FormGroup,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PublishIcon from '@mui/icons-material/Publish';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { FixedSizeList } from 'react-window';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';

export default function PostList({ 
  posts, 
  onEdit, 
  onDelete, 
  onUpdateStatus, 
  onArchive, 
  onUnarchive,
  defaultStatusFilter = 'all', 
  hideArchived = false,
  archivesMode = false
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [sortOption, setSortOption] = useState('updatedAt-desc'); // default sort by last updated
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [listHeight, setListHeight] = useState(500); // Default height
  const listContainerRef = useRef(null);
  
  // Set the default filter when the component mounts or when defaultStatusFilter changes
  useEffect(() => {
    setStatusFilter(defaultStatusFilter);
  }, [defaultStatusFilter]);

  // Measure container height for virtualized list
  useEffect(() => {
    if (listContainerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        setListHeight(entries[0].contentRect.height);
      });
      
      resizeObserver.observe(listContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);
  
  // Implement search debounce to prevent excessive re-renders on typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsLoading(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Handle search input change with loading indicator
  const handleSearchChange = (e) => {
    setIsLoading(true);
    setSearchTerm(e.target.value);
  };
  
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

  // Open archive dialog
  const handleArchiveClick = (post) => {
    setCurrentPost(post);
    setArchiveDialogOpen(true);
  };

  // Close archive dialog
  const handleCloseArchiveDialog = () => {
    setArchiveDialogOpen(false);
    setCurrentPost(null);
  };

  // Archive post
  const handleArchivePost = () => {
    if (currentPost && onArchive) {
      onArchive(currentPost.id);
      setArchiveDialogOpen(false);
      setCurrentPost(null);
    }
  };

  // Open unarchive dialog
  const handleUnarchiveClick = (post) => {
    setCurrentPost(post);
    setUnarchiveDialogOpen(true);
  };

  // Close unarchive dialog
  const handleCloseUnarchiveDialog = () => {
    setUnarchiveDialogOpen(false);
    setCurrentPost(null);
  };

  // Unarchive post
  const handleUnarchivePost = () => {
    if (currentPost && onUnarchive) {
      onUnarchive(currentPost.id);
      setUnarchiveDialogOpen(false);
      setCurrentPost(null);
    }
  };

  // Handle post view navigation
  const handleViewPost = (postId) => {
    router.push(`/posts/view/${postId}`);
  };

  // Handle delete post click
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  // Confirm delete post
  const handleConfirmDelete = () => {
    if (postToDelete) {
      onDelete(postToDelete.id);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  // Filter posts based on search term, selected tag, and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = debouncedSearchTerm === '' || 
      post.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
      post.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    const matchesTag = filterTag === '' || 
      (post.tags && post.tags.includes(filterTag));
    
    const matchesStatus = statusFilter === 'all' || 
      post.status === statusFilter;

    // For regular posts page, hide archived posts if hideArchived is true
    if (hideArchived && post.status === 'archived') {
      return false;
    }

    // For archives page, only show archived posts
    if (archivesMode && post.status !== 'archived') {
      return false;
    }
    
    return matchesSearch && matchesTag && matchesStatus;
  });

  // Sort posts based on selected option
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const [field, direction] = sortOption.split('-');
    
    switch (field) {
      case 'title':
        return direction === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      case 'createdAt':
        return direction === 'asc' 
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      case 'updatedAt':
        return direction === 'asc' 
          ? new Date(a.updatedAt) - new Date(b.updatedAt)
          : new Date(b.updatedAt) - new Date(a.updatedAt);
      default:
        return direction === 'asc' 
          ? new Date(a.updatedAt) - new Date(b.updatedAt)
          : new Date(b.updatedAt) - new Date(a.updatedAt);
    }
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
        return 'warning';
      default:
        return 'default';
    }
  };

  // Render a single post item for virtualized list
  const renderPost = useCallback(({ index, style }) => {
    const post = sortedPosts[index];
    
    return (
      <Box key={post.id} style={style}>
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
            {!archivesMode ? (
              // Regular posts page actions
              <>
                <IconButton edge="end" onClick={() => handleViewPost(post.id)} title="View Post">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" onClick={() => handleStatusEditClick(post)} title="Change Status">
                  <PublishIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" onClick={() => onEdit(post)} title="Edit">
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleArchiveClick(post)} title="Archive">
                  <ArchiveIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteClick(post)} title="Delete">
                  <DeleteIcon />
                </IconButton>
              </>
            ) : (
              // Archives page actions
              <>
                <IconButton edge="end" onClick={() => handleViewPost(post.id)} title="View Post">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" onClick={() => handleUnarchiveClick(post)} title="Unarchive">
                  <UnarchiveIcon fontSize="small" />
                </IconButton>
                <IconButton edge="end" onClick={() => onEdit(post)} title="Edit">
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteClick(post)} title="Delete">
                  <DeleteIcon />
                </IconButton>
              </>
            )}
          </ListItemSecondaryAction>
        </ListItem>
        {index < sortedPosts.length - 1 && <Divider />}
      </Box>
    );
  }, [sortedPosts, archivesMode, filterTag]);

  return (
    <Box>
      {/* Search and filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                </InputAdornment>
              ),
            }}
            size="small"
          />
        </Grid>

        {!archivesMode && (
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">
                <FilterListIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Status
              </InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Posts</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Drafts</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12} sm={archivesMode ? 12 : 6} md={archivesMode ? 6 : 3}>
          <FormControl fullWidth size="small">
            <InputLabel id="sort-option-label">
              <SortIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
              Sort By
            </InputLabel>
            <Select
              labelId="sort-option-label"
              id="sort-option"
              value={sortOption}
              label="Sort By"
              onChange={(e) => setSortOption(e.target.value)}
            >
              <MenuItem value="updatedAt-desc">Last Updated (Newest)</MenuItem>
              <MenuItem value="updatedAt-asc">Last Updated (Oldest)</MenuItem>
              <MenuItem value="createdAt-desc">Date Created (Newest)</MenuItem>
              <MenuItem value="createdAt-asc">Date Created (Oldest)</MenuItem>
              <MenuItem value="title-asc">Title (A-Z)</MenuItem>
              <MenuItem value="title-desc">Title (Z-A)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
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
        {sortedPosts.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              {archivesMode ? 'No archived posts found' : 'No posts found'}
            </Typography>
          </Box>
        ) : (
          <Box ref={listContainerRef} sx={{ height: 'calc(100vh - 250px)', minHeight: '400px' }}>
            <FixedSizeList
              height={listHeight}
              width="100%"
              itemSize={150} // Adjust based on your post item height
              itemCount={sortedPosts.length}
              overscanCount={5} // Number of extra items to render above/below visible area
            >
              {renderPost}
            </FixedSizeList>
          </Box>
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

      {/* Archive Dialog */}
      <Dialog open={archiveDialogOpen} onClose={handleCloseArchiveDialog}>
        <DialogTitle>Archive Post</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to archive "{currentPost?.title}"?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Archiving will move the post to Archives. You can access it later from the Archives page.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseArchiveDialog}>Cancel</Button>
          <Button onClick={handleArchivePost} color="warning" variant="contained">
            Archive
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unarchive Dialog */}
      <Dialog open={unarchiveDialogOpen} onClose={handleCloseUnarchiveDialog}>
        <DialogTitle>Unarchive Post</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" gutterBottom>
              Do you want to restore "{currentPost?.title}" from the archives?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This will restore the post as a draft and make it available in the regular Posts page.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUnarchiveDialog}>Cancel</Button>
          <Button onClick={handleUnarchivePost} color="primary" variant="contained">
            Restore to Drafts
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to delete "{postToDelete?.title}"?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This action cannot be undone. All associated uploaded images will also be deleted.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}