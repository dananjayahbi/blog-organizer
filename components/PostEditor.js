import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Divider,
  Chip,
  Stack,
  IconButton
} from '@mui/material';
import { marked } from 'marked';
import { useBlogContext } from './BlogContext';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

export default function PostEditor({ post, onSave, onCancel }) {
  const { uploadImage } = useBlogContext();
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(post?.tags || []);
  const [images, setImages] = useState(post?.images || []);
  const [isPreview, setIsPreview] = useState(false);
  
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

  // Handle image upload
  const handleImageUpload = async () => {
    try {
      const imageFileName = await uploadImage();
      if (imageFileName) {
        // Add markdown image tag to content
        const imageMarkdown = `\n![Image](${imageFileName})\n`;
        setContent(prevContent => prevContent + imageMarkdown);
        setImages([...images, imageFileName]);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedPost = {
      ...post,
      title,
      content,
      tags,
      images
    };
    
    onSave(updatedPost);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
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
      
      {/* Editor/Preview toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1">
          {isPreview ? 'Preview' : 'Content'}
        </Typography>
        <Button 
          startIcon={isPreview ? <EditIcon /> : <PreviewIcon />}
          size="small"
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? 'Edit' : 'Preview'}
        </Button>
      </Box>
      
      {/* Content editor or preview */}
      {isPreview ? (
        <Paper 
          variant="outlined" 
          sx={{ p: 2, minHeight: 300, maxHeight: 600, overflow: 'auto' }}
        >
          <div 
            dangerouslySetInnerHTML={renderMarkdown(content)} 
            className="markdown-preview"
          />
        </Paper>
      ) : (
        <Box>
          <TextField
            multiline
            fullWidth
            variant="outlined"
            minRows={12}
            maxRows={20}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ fontFamily: 'monospace' }}
          />
          
          <Button 
            startIcon={<ImageIcon />}
            onClick={handleImageUpload}
            sx={{ mt: 1 }}
          >
            Add Image
          </Button>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}