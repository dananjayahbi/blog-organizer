import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create the context
const BlogContext = createContext();

// Custom hook to use the blog context
export const useBlogContext = () => useContext(BlogContext);

// Provider component
export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        // Check if window.electronAPI exists (we're in Electron)
        if (window.electronAPI) {
          const fetchedPosts = await window.electronAPI.getPosts();
          setPosts(fetchedPosts);
        } else {
          // Fallback for development in browser
          const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
          setPosts(storedPosts);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Save a post (create or update)
  const savePost = async (post) => {
    try {
      // Ensure post has basic structure
      const postToSave = { ...post };
      
      // If post doesn't have an id, assign one
      if (!postToSave.id) {
        postToSave.id = uuidv4();
      }
      
      // Add creation date if it doesn't exist
      if (!postToSave.createdAt) {
        postToSave.createdAt = new Date().toISOString();
      }

      // Always update the modified date
      postToSave.updatedAt = new Date().toISOString();
      
      // Make sure we have title and content (even if empty)
      if (!postToSave.title) postToSave.title = '';
      if (!postToSave.content) postToSave.content = '';
      
      // Ensure we have a status
      if (!postToSave.status) postToSave.status = 'draft';
      
      console.log('Saving post:', postToSave);

      // Save using Electron or localStorage
      if (window.electronAPI) {
        const result = await window.electronAPI.savePost(postToSave);
        console.log('Electron save result:', result);
        
        if (!result || !result.success) {
          throw new Error(result?.error || 'Failed to save post');
        }
      } else {
        // Fallback for development in browser
        const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
        const existingPostIndex = storedPosts.findIndex(p => p.id === postToSave.id);
        
        if (existingPostIndex >= 0) {
          storedPosts[existingPostIndex] = postToSave;
        } else {
          storedPosts.push(postToSave);
        }
        
        localStorage.setItem('posts', JSON.stringify(storedPosts));
      }

      // Update state
      setPosts(currentPosts => {
        const existingPostIndex = currentPosts.findIndex(p => p.id === postToSave.id);
        
        if (existingPostIndex >= 0) {
          const updatedPosts = [...currentPosts];
          updatedPosts[existingPostIndex] = postToSave;
          return updatedPosts;
        } else {
          return [...currentPosts, postToSave];
        }
      });

      return postToSave;
    } catch (err) {
      console.error('Error saving post:', err);
      throw err;
    }
  };

  // Delete a post
  const deletePost = async (postId) => {
    try {
      // First get the post to check for images
      let postToDelete = posts.find(p => p.id === postId);
      
      // If post exists and has images, delete them
      if (postToDelete && postToDelete.images && postToDelete.images.length > 0) {
        // Filter only uploaded images (those with paths starting with /images/)
        const uploadedImages = postToDelete.images.filter(img => 
          typeof img === 'string' && img.startsWith('/images/')
        );

        // Delete each uploaded image
        for (const imagePath of uploadedImages) {
          try {
            // Extract the filename from the path
            const filename = imagePath.split('/').pop();
            if (filename && window.electronAPI && window.electronAPI.deleteImage) {
              await deleteImage(filename);
              console.log('Image deleted:', filename);
            }
          } catch (error) {
            console.error('Failed to delete image:', error);
          }
        }
      }

      // Delete the post using Electron or localStorage
      if (window.electronAPI) {
        await window.electronAPI.deletePost(postId);
      } else {
        // Fallback for development in browser
        const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
        const updatedPosts = storedPosts.filter(p => p.id !== postId);
        localStorage.setItem('posts', JSON.stringify(updatedPosts));
      }

      // Update state
      setPosts(currentPosts => currentPosts.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  };

  // Upload an image
  const uploadImage = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.selectImage();
        return result;
      } else {
        console.warn('Image upload is not available in browser mode');
        return null;
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    }
  };
  
  // Delete an image
  const deleteImage = async (filename) => {
    try {
      if (window.electronAPI && window.electronAPI.deleteImage) {
        const result = await window.electronAPI.deleteImage(filename);
        return result;
      } else {
        console.warn('Image deletion is not available in browser mode');
        return { success: false, error: 'Not available in browser mode' };
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      throw err;
    }
  };

  return (
    <BlogContext.Provider 
      value={{
        posts,
        loading,
        error,
        savePost,
        deletePost,
        uploadImage,
        deleteImage
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export default BlogContext;