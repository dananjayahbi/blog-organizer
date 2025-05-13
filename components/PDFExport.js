import { useState } from 'react';
import { PDFDownloadLink, Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { marked } from 'marked';

// Register fonts
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf', fontStyle: 'italic' },
  ]
});

// Create styles for PDF document
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Open Sans',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  metadata: {
    fontSize: 12,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.5,
  },
  tags: {
    fontSize: 10,
    marginTop: 10,
    color: '#333',
  },
  image: {
    marginVertical: 15,
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain',
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 5,
  },
  heading3: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  heading4: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 1.6,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 4,
    paddingLeft: 10,
    flexDirection: 'row',
  },
  listItemBullet: {
    width: 10,
    fontSize: 12,
  },
  listItemContent: {
    flex: 1,
  },
  codeBlock: {
    fontFamily: 'Courier',
    fontSize: 11,
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginVertical: 10,
  },
  blockquote: {
    borderLeftWidth: 2,
    borderLeftColor: '#ccc',
    paddingLeft: 10,
    fontStyle: 'italic',
    marginVertical: 10,
  }
});

// Convert Markdown to structured content for PDF rendering
const parseMarkdown = (content) => {
  if (!content) return [];

  // Use marked to tokenize the markdown
  const tokens = marked.lexer(content);
  
  // Process tokens into renderable elements
  return tokens.map((token, index) => {
    switch (token.type) {
      case 'heading':
        const HeadingStyle = styles[`heading${token.depth}`] || styles.heading1;
        return {
          type: 'heading',
          style: HeadingStyle,
          content: token.text,
          key: `heading-${index}`
        };
      
      case 'paragraph':
        // Check if paragraph contains an image
        const imageMatch = token.text.match(/!\[(.*?)\]\((.*?)\)/);
        if (imageMatch) {
          const altText = imageMatch[1];
          const imageUrl = imageMatch[2];
          const imageUrlWithOrigin = imageUrl.startsWith('/') ? 
            `${typeof window !== 'undefined' ? window.location.origin : ''}${imageUrl}` : 
            imageUrl;
          
          return {
            type: 'image',
            src: imageUrlWithOrigin,
            alt: altText,
            key: `image-${index}`
          };
        } else {
          // Handle text with potential inline formatting
          return {
            type: 'paragraph',
            content: token.text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'),  // Basic bold/italic stripping
            key: `paragraph-${index}`
          };
        }
      
      case 'list':
        return {
          type: 'list',
          items: token.items.map((item, i) => ({
            content: item.text,
            key: `list-item-${index}-${i}`
          })),
          key: `list-${index}`
        };
      
      case 'code':
        return {
          type: 'code',
          content: token.text,
          key: `code-${index}`
        };
      
      case 'blockquote':
        return {
          type: 'blockquote',
          content: token.text,
          key: `blockquote-${index}`
        };
      
      default:
        if (token.text) {
          return {
            type: 'text',
            content: token.text,
            key: `text-${index}`
          };
        }
        return null;
    }
  }).filter(Boolean); // Remove any null elements
};

// Component for PDF content
const PostPDF = ({ post }) => {
  const parsedContent = parseMarkdown(post.content);
  
  // Render element based on its type
  const renderElement = (element) => {
    switch (element.type) {
      case 'heading':
        return <Text style={element.style} key={element.key}>{element.content}</Text>;
      
      case 'paragraph':
        return <Text style={styles.paragraph} key={element.key}>{element.content}</Text>;
      
      case 'image':
        return <Image src={element.src} style={styles.image} key={element.key} />;
      
      case 'list':
        return (
          <View key={element.key}>
            {element.items.map(item => (
              <View style={styles.listItem} key={item.key}>
                <Text style={styles.listItemBullet}>• </Text>
                <Text style={styles.listItemContent}>{item.content}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'code':
        return <Text style={styles.codeBlock} key={element.key}>{element.content}</Text>;
      
      case 'blockquote':
        return <Text style={styles.blockquote} key={element.key}>{element.content}</Text>;
      
      case 'text':
        return <Text style={styles.paragraph} key={element.key}>{element.content}</Text>;
      
      default:
        return null;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.metadata}>
            Status: {post.status} • Created: {new Date(post.createdAt).toLocaleDateString()} • 
            Last updated: {new Date(post.updatedAt).toLocaleDateString()}
          </Text>
          
          {parsedContent.map(element => renderElement(element))}
          
          {post.tags && post.tags.length > 0 && (
            <Text style={styles.tags}>
              Tags: {post.tags.join(', ')}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

// Main export component
export default function PDFExport({ post }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleOpen = () => setDialogOpen(true);
  const handleClose = () => setDialogOpen(false);
  
  const fileName = `${post.title.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.pdf`;

  return (
    <>
      <Button 
        variant="outlined"
        color="primary"
        startIcon={<FileDownloadIcon />}
        onClick={handleOpen}
        size="small"
      >
        Export as PDF
      </Button>
      
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Export Post as PDF</DialogTitle>
        <DialogContent>
          <p>Download "{post.title}" as a PDF document.</p>
          
          <PDFDownloadLink 
            document={<PostPDF post={post} />} 
            fileName={fileName}
            style={{
              textDecoration: 'none'
            }}
          >
            {({ blob, url, loading, error }) => (
              <Button 
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <FileDownloadIcon />}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Generating PDF...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}