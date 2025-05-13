import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Divider,
  Chip,
  Stack,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { marked } from 'marked';
import { useBlogContext } from './BlogContext';
import { useThemeContext } from './ThemeContext';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CodeIcon from '@mui/icons-material/Code';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LinkIcon from '@mui/icons-material/Link';
import dynamic from 'next/dynamic';
import React from 'react';

// Import TurnDown dynamically as it's client-side only
const TurndownService = dynamic(() => import('turndown'), { 
  ssr: false
});
// Import ReactQuill dynamically because it requires 'window'
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});
// Import ReactQuill styles
import 'react-quill/dist/quill.snow.css';

const PostEditorComponent = forwardRef(({ post, onSave, onCancel }, ref) => {
  const { uploadImage } = useBlogContext();
  const { darkMode } = useThemeContext();
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(post?.tags || []);
  const [images, setImages] = useState(post?.images || []);
  const [isPreview, setIsPreview] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const [editorType, setEditorType] = useState('markdown'); // 'markdown' or 'richtext'
  const [htmlContent, setHtmlContent] = useState('');
  const [turndownInstance, setTurndownInstance] = useState(null);
  const [editorHeight, setEditorHeight] = useState(600);
  const [imageUrlDialogOpen, setImageUrlDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const quillRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Function to get the current post data
  const getCurrentPostData = () => {
    // Ensure we save the markdown version regardless of editor type
    let finalContent = content;
    if (editorType === 'richtext' && turndownInstance && htmlContent) {
      finalContent = turndownInstance.turndown(htmlContent);
    }
    
    return {
      ...post,
      title,
      content: finalContent,
      tags,
      images
    };
  };
  
  // Expose methods to parent component through ref
  useImperativeHandle(ref, () => ({
    savePost: () => {
      const updatedPost = getCurrentPostData();
      onSave(updatedPost);
    }
  }));
  
  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'code-block'],
      ['clean']
    ],
  };
  
  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image', 'code-block'
  ];
  
  // Initialize TurndownService on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined' && !turndownInstance) {
      import('turndown').then(({ default: Turndown }) => {
        const service = new Turndown({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced'
        });
        setTurndownInstance(service);
        
        // If there's initial content and we're in rich text mode, convert markdown to HTML
        if (content && editorType === 'richtext') {
          setHtmlContent(marked.parse(content));
        }
      }).catch(error => {
        console.error("Failed to load Turndown:", error);
      });
    }
  }, []);
  
  // Convert HTML to Markdown when switching from richtext to markdown
  useEffect(() => {
    if (editorType === 'markdown' && htmlContent && turndownInstance) {
      const markdown = turndownInstance.turndown(htmlContent);
      setContent(markdown);
    } else if (editorType === 'richtext' && content) {
      // Convert Markdown to HTML when switching to richtext
      setHtmlContent(marked.parse(content));
    }
  }, [editorType, turndownInstance]);
  
  // Calculate editor height based on content length
  useEffect(() => {
    // Base height calculation for both markdown and rich text editors
    const baseHeight = 600;
    const contentLength = content.length;
    
    // For rich text editor: minimum 1000px, grows with content
    const richTextHeight = Math.max(1000, 1000 + Math.floor(contentLength / 1000) * 100);
    
    // For markdown editor: minimum 600px, grows with content but with smaller increments
    const markdownHeight = Math.max(baseHeight, baseHeight + Math.floor(contentLength / 500) * 50);
    
    // Set editor height based on current editor type
    setEditorHeight(editorType === 'richtext' ? richTextHeight : markdownHeight);
  }, [content, editorType]);
  
  // Handle editor type change
  const handleEditorTypeChange = (event, newType) => {
    if (newType !== null) {
      setEditorType(newType);
      setIsPreview(false); // Reset preview state when changing editor type
    }
  };
  
  // Handle rich text editor content change
  const handleRichTextChange = (value) => {
    setHtmlContent(value);
    
    // Convert to markdown on change
    if (turndownInstance) {
      const markdown = turndownInstance.turndown(value || '');
      setContent(markdown);
    }
  };
  
  // Load auto-save setting from localStorage
  useEffect(() => {
    const storedAutoSave = localStorage.getItem('autosave');
    if (storedAutoSave !== null) {
      setAutoSaveEnabled(storedAutoSave === 'true');
    }
  }, []);
  
  // Create savePost function with useCallback to prevent unnecessary recreations
  const savePost = useCallback(() => {
    const updatedPost = getCurrentPostData();
    onSave(updatedPost, true); // Pass true to indicate this is an auto-save
    setLastSaved(new Date());
  }, [post, title, content, editorType, htmlContent, turndownInstance, tags, images, onSave]);
  
  // Set up auto-save timer
  useEffect(() => {
    if (!autoSaveEnabled) return;
    
    const timer = setTimeout(() => {
      if (title.trim() && (content.trim() || htmlContent.trim())) {
        savePost();
      }
    }, 10000); // Auto-save after 10 seconds of inactivity
    
    return () => clearTimeout(timer);
  }, [title, content, htmlContent, autoSaveEnabled, savePost]);
  
  // Parse markdown to HTML for preview - FIXED FORMAT
  const renderMarkdown = (text) => {
    if (!text) return { __html: '' };
    try {
      return { __html: marked.parse(text) };
    } catch (error) {
      console.error("Error parsing markdown:", error);
      return { __html: '<p>Error rendering preview</p>' };
    }
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
      const imageResult = await uploadImage();
      if (imageResult && !imageResult.canceled) {
        // The image path is already correctly formatted from Electron as /images/filename
        const imagePath = imageResult.filePath;
        setImages([...images, imagePath]);
        
        if (editorType === 'markdown') {
          // Add markdown image tag to content with the cursor position in mind
          const imageMarkdown = `\n![Image](${imagePath})\n`;
          setContent(prevContent => prevContent + imageMarkdown);
          
          // Force update to ensure preview reflects the change
          setTimeout(() => {
            const previewElement = document.querySelector('.markdown-preview, .markdown-preview-dark');
            if (previewElement) {
              previewElement.innerHTML = marked.parse(content + imageMarkdown);
            }
          }, 100);
        } else {
          // Insert image in rich text editor
          const quill = quillRef.current?.getEditor();
          if (quill) {
            // Get the current selection range or use the end of the document
            const range = quill.getSelection(true);
            // Insert the image at the current cursor position
            quill.insertEmbed(range.index, 'image', imagePath);
            // Move cursor after the image
            quill.setSelection(range.index + 1, 0);
          } else {
            // If the Quill editor isn't available, append to the HTML content
            setHtmlContent(prevHtml => prevHtml + `<img src="${imagePath}" alt="Image" />`);
          }
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  // Open dialog for adding image by URL
  const handleAddImageByUrlClick = () => {
    setImageUrl('');
    setImageAlt('Image');
    setImageUrlDialogOpen(true);
  };

  // Close image URL dialog
  const handleCloseImageUrlDialog = () => {
    setImageUrlDialogOpen(false);
  };

  // Insert image by URL
  const handleInsertImageByUrl = () => {
    if (!imageUrl.trim()) return;
    
    // Add the URL to the content
    if (editorType === 'markdown') {
      // Add markdown image tag to content
      const imageMarkdown = `\n![${imageAlt || 'Image'}](${imageUrl})\n`;
      setContent(prevContent => {
        const newContent = prevContent + imageMarkdown;
        
        // Force update to ensure preview reflects the change
        setTimeout(() => {
          const previewElement = document.querySelector('.markdown-preview, .markdown-preview-dark');
          if (previewElement) {
            previewElement.innerHTML = marked.parse(newContent);
          }
        }, 100);
        
        return newContent;
      });
    } else {
      // Insert image in rich text editor
      const quill = quillRef.current?.getEditor();
      if (quill) {
        // Get the current selection range or use the end of the document
        const range = quill.getSelection(true);
        // Insert the image at the current cursor position
        quill.insertEmbed(range.index, 'image', imageUrl);
        // Move cursor after the image
        quill.setSelection(range.index + 1, 0);
      } else {
        // If the Quill editor isn't available, append to the HTML content
        setHtmlContent(prevHtml => prevHtml + `<img src="${imageUrl}" alt="${imageAlt || 'Image'}" />`);
      }
    }
    
    // Close the dialog
    setImageUrlDialogOpen(false);
  };
  
  // Handle markdown file upload
  const handleMarkdownFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if file is a markdown file
    if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        setContent(fileContent);
        
        // Set title from filename if title is empty
        if (!title) {
          const fileName = file.name.replace(/\.[^/.]+$/, ""); // remove extension
          setTitle(fileName);
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a markdown file (.md or .markdown)');
    }
    
    // Reset input to allow selecting the same file again
    event.target.value = '';
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedPost = getCurrentPostData();
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
      
      {/* Auto-save indicator */}
      {autoSaveEnabled && lastSaved && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Auto-saved at {lastSaved.toLocaleTimeString()}
        </Typography>
      )}
      
      {/* Editor type toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <ToggleButtonGroup
          value={editorType}
          exclusive
          onChange={handleEditorTypeChange}
          size="small"
          aria-label="editor type"
        >
          <ToggleButton value="markdown" aria-label="markdown editor">
            <CodeIcon fontSize="small" sx={{ mr: 0.5 }} /> Markdown
          </ToggleButton>
          <ToggleButton value="richtext" aria-label="rich text editor">
            <FormatBoldIcon fontSize="small" sx={{ mr: 0.5 }} /> Rich Text
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {/* Hidden file input for markdown files */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      
      {/* Content editor */}
      {editorType === 'markdown' ? (
        // Markdown editor with side-by-side preview
        <Grid container spacing={2}>
          {/* Left side - Markdown editor */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Editor</Typography>
              <Box>
                <Button 
                  startIcon={<FileUploadIcon />}
                  onClick={handleMarkdownFileUpload}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  Load Markdown
                </Button>
                <Button 
                  startIcon={<LinkIcon />}
                  onClick={handleAddImageByUrlClick}
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  Add Image by URL
                </Button>
                <Button 
                  startIcon={<ImageIcon />}
                  onClick={handleImageUpload}
                  size="small"
                  variant="outlined"
                >
                  Upload Image
                </Button>
              </Box>
            </Box>
            <TextField
              multiline
              fullWidth
              variant="outlined"
              minRows={20}
              maxRows={40}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ 
                fontFamily: 'monospace',
                '& .MuiInputBase-root': {
                  minHeight: `${editorHeight}px`,
                  height: `${editorHeight}px`,
                  overflow: 'auto'
                }
              }}
            />
          </Grid>
          
          {/* Right side - Preview */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Preview</Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                minHeight: `${editorHeight}px`, 
                height: `${editorHeight}px`,
                overflow: 'auto',
                backgroundColor: darkMode ? 'rgba(20, 20, 20, 0.8)' : 'white'
              }}
            >
              <div 
                dangerouslySetInnerHTML={renderMarkdown(content)} 
                className={darkMode ? 'markdown-preview-dark' : 'markdown-preview'}
              />
            </Paper>
          </Grid>
        </Grid>
      ) : (
        // Rich text editor
        <Box>
          <Box 
            sx={{ 
              border: '1px solid #ccc', 
              borderRadius: 1, 
              mb: 1,
              '.ql-editor': {
                minHeight: `${editorHeight}px`,
                fontSize: '16px',
              },
              '.ql-container': {
                borderBottomLeftRadius: '4px',
                borderBottomRightRadius: '4px',
              },
              '.ql-toolbar': {
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
              }
            }}
          >
            {typeof window !== 'undefined' && ReactQuill && (
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={htmlContent}
                onChange={handleRichTextChange}
                modules={quillModules}
                formats={quillFormats}
                style={{ height: 'auto' }}
              />
            )}
          </Box>
          <Button 
            startIcon={<LinkIcon />}
            onClick={handleAddImageByUrlClick}
            sx={{ mt: 1, mr: 1 }}
          >
            Add Image by URL
          </Button>
          <Button 
            startIcon={<ImageIcon />}
            onClick={handleImageUpload}
            sx={{ mt: 1 }}
          >
            Upload Image
          </Button>
        </Box>
      )}
      
      {/* Image URL Dialog */}
      <Dialog open={imageUrlDialogOpen} onClose={handleCloseImageUrlDialog}>
        <DialogTitle>Add Image by URL</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Image URL"
            type="url"
            fullWidth
            variant="outlined"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Alt Text"
            type="text"
            fullWidth
            variant="outlined"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageUrlDialog}>Cancel</Button>
          <Button onClick={handleInsertImageByUrl} variant="contained" color="primary">
            Insert
          </Button>
        </DialogActions>
      </Dialog>
      
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
});

// Export as a named component with display name for better debugging
const PostEditor = React.memo(PostEditorComponent);
PostEditor.displayName = 'PostEditor';

export default PostEditor;