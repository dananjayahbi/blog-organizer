import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  Divider,
  Stack,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Upload as UploadIcon,
  Image as ImageIcon,
  Visibility as PreviewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { marked } from 'marked';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { useBlogContext } from '../../../components/BlogContext';

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  const { posts, loading: postsLoading, error: postsError, updatePost, uploadImage } = useBlogContext();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('draft');
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [post, setPost] = useState(null);
  const [imageUrlDialogOpen, setImageUrlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Load post data when id is available
  useEffect(() => {
    if (id && posts) {
      const existingPost = posts.find(p => p.id === id);
      if (existingPost) {
        setPost(existingPost);
        setTitle(existingPost.title || '');
        setContent(existingPost.content || '');
        setTags(existingPost.tags || []);
        setImages(existingPost.images || []);
        setStatus(existingPost.status || 'draft');
      } else {
        // Post not found, redirect to posts page
        router.push('/posts');
      }
    }
  }, [id, posts, router]);

  // Parse markdown to HTML for preview
  const renderMarkdown = (text) => {
    if (!text) return '';
    return { __html: marked.parse(text) };
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Handle tag deletion
  const handleDeleteTag = (tagToDelete) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  // Handle tag input key press (to add on Enter)
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle markdown file upload
  const handleMarkdownFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    
    // Check for file extension instead of MIME type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.md') && !fileName.endsWith('.markdown')) {
      setSnackbar({
        open: true,
        message: 'Please select a valid markdown file (.md or .markdown)',
        severity: 'error'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target.result);
    };
    reader.readAsText(file);
  };

  // Handle image upload
  const handleImageUpload = async () => {
    try {
      setLoading(true); // Show loading state while uploading
      
      const result = await uploadImage();
      if (result && !result.canceled) {
        // Get cursor position to insert at current position if possible
        const textArea = document.querySelector('textarea');
        const cursorPosition = textArea ? textArea.selectionStart : content.length;
        
        // Use the web-friendly path directly returned from the main process
        const imagePath = result.filePath || `/images/${result.fileName}`;
        
        // Add markdown image tag at cursor position or at the end
        const imageMarkdown = `\n![Image](${imagePath})\n`;
        const newContent = content.slice(0, cursorPosition) + imageMarkdown + content.slice(cursorPosition);
        setContent(newContent);
        
        // Add to images array to track
        setImages(prev => [...prev, result.fileName]);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Image added successfully',
          severity: 'success'
        });
      } else {
        // User cancelled or no image was selected
        setSnackbar({
          open: true,
          message: 'No image selected or operation cancelled',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setSnackbar({
        open: true,
        message: 'Error uploading image: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  // Handle adding image by URL
  const handleAddImageByUrl = () => {
    setImageUrlDialogOpen(true);
  };

  // Handle image URL dialog submit
  const handleImageUrlSubmit = () => {
    if (imageUrl && imageUrl.trim()) {
      // Get cursor position to insert at current position if possible
      const textArea = document.querySelector('textarea');
      const cursorPosition = textArea ? textArea.selectionStart : content.length;
      
      // Add markdown image tag at cursor position or at the end
      const imageMarkdown = `![Image](${imageUrl.trim()})`;
      const newContent = content.slice(0, cursorPosition) + imageMarkdown + content.slice(cursorPosition);
      setContent(newContent);
      
      setSnackbar({
        open: true,
        message: 'Image URL added successfully',
        severity: 'success'
      });
    }
    
    setImageUrlDialogOpen(false);
    setImageUrl('');
  };

  // Handle image URL dialog close
  const handleImageUrlDialogClose = () => {
    setImageUrlDialogOpen(false);
    setImageUrl('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setSnackbar({
        open: true,
        message: 'Please provide a title for your post',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const updatedPost = {
        ...post,
        title,
        content,
        tags,
        images,
        status
      };
      
      await updatePost(id, updatedPost);
      
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
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            Update Post
          </Button>
        </Box>

        {/* Editor Form */}
        <Grid container spacing={3}>
          {/* Left side - Content Entry */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              {/* Title input */}
              <TextField
                label="Post Title"
                fullWidth
                variant="outlined"
                margin="normal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              
              {/* Tags input */}
              <Box sx={{ mt: 2, mb: 1 }}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label="Add Tags"
                    size="small"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyPress}
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={handleAddTag}
                  >
                    Add
                  </Button>
                </Stack>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Markdown upload / image upload */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                >
                  Upload .md file
                  <input
                    type="file"
                    accept=".md,.markdown"
                    hidden
                    onChange={handleMarkdownFileUpload}
                  />
                </Button>
                
                <Button 
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={handleImageUpload}
                >
                  Add Image
                </Button>
                
                <Button 
                  variant="outlined"
                  startIcon={<ImageIcon />}
                  onClick={handleAddImageByUrl}
                >
                  Image by URL
                </Button>
              </Box>
              
              {/* Content editor */}
              <TextField
                multiline
                fullWidth
                variant="outlined"
                minRows={20}
                maxRows={30}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{ 
                  fontFamily: 'monospace',
                  '& .MuiInputBase-input': { fontFamily: 'monospace' }  
                }}
                placeholder="Enter markdown content here or upload a .md file"
              />
            </Paper>
          </Grid>
          
          {/* Right side - Preview */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Preview</Typography>
                <Button 
                  startIcon={isPreview ? <EditIcon /> : <PreviewIcon />}
                  size="small"
                  onClick={() => setIsPreview(!isPreview)}
                >
                  {isPreview ? 'Show Markdown' : 'Show Preview'}
                </Button>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {isPreview ? (
                <Box 
                  sx={{ 
                    minHeight: '600px', 
                    maxHeight: 'calc(100vh - 250px)',
                    overflow: 'auto',
                    p: 2
                  }}
                >
                  {content ? (
                    <div 
                      dangerouslySetInnerHTML={renderMarkdown(content)} 
                      className="markdown-preview"
                    />
                  ) : (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Preview will appear here when you add content
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ 
                  minHeight: '600px', 
                  maxHeight: 'calc(100vh - 250px)',
                  overflow: 'auto',
                  p: 2,
                  bgcolor: '#f5f5f5',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap'
                }}>
                  {content || (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Raw markdown will appear here when you add content
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Bottom navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Back to Posts
          </Button>
          <Button 
            variant="contained"
            color="primary"
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            Update Post
          </Button>
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
        
        {/* Dialog for image URL input */}
        <Dialog
          open={imageUrlDialogOpen}
          onClose={handleImageUrlDialogClose}
          aria-labelledby="image-url-dialog-title"
          aria-describedby="image-url-dialog-description"
        >
          <DialogTitle id="image-url-dialog-title">Add Image by URL</DialogTitle>
          <DialogContent>
            <DialogContentText id="image-url-dialog-description">
              Enter the URL of the image you want to add to the post. The image will be embedded in the markdown content.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Image URL"
              type="url"
              fullWidth
              variant="outlined"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              helperText="The URL must be accessible and point directly to an image file."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleImageUrlDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleImageUrlSubmit} color="primary">
              Add Image
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}