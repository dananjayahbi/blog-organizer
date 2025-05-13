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
      // If post doesn't have an id, assign one
      if (!post.id) {
        post.id = uuidv4();
        post.created = new Date().toISOString();
      }

      // Update the modified date
      post.modified = new Date().toISOString();

      // Save using Electron or localStorage
      if (window.electronAPI) {
        await window.electronAPI.savePost(post);
      } else {
        // Fallback for development in browser
        const storedPosts = JSON.parse(localStorage.getItem('posts') || '[]');
        const existingPostIndex = storedPosts.findIndex(p => p.id === post.id);
        
        if (existingPostIndex >= 0) {
          storedPosts[existingPostIndex] = post;
        } else {
          storedPosts.push(post);
        }
        
        localStorage.setItem('posts', JSON.stringify(storedPosts));
      }

      // Update state
      setPosts(currentPosts => {
        const existingPostIndex = currentPosts.findIndex(p => p.id === post.id);
        
        if (existingPostIndex >= 0) {
          const updatedPosts = [...currentPosts];
          updatedPosts[existingPostIndex] = post;
          return updatedPosts;
        } else {
          return [...currentPosts, post];
        }
      });

      return post;
    } catch (err) {
      console.error('Error saving post:', err);
      throw err;
    }
  };

  // Delete a post
  const deletePost = async (postId) => {
    try {
      // Delete using Electron or localStorage
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