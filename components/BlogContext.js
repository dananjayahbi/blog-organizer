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
          // Fallback for development in browser without Electron
          const storedPosts = localStorage.getItem('blog-posts');
          if (storedPosts) {
            setPosts(JSON.parse(storedPosts));
          }
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Save posts to storage when they change
  useEffect(() => {
    if (!loading && posts.length > 0) {
      // Fallback for browser development
      if (!window.electronAPI) {
        localStorage.setItem('blog-posts', JSON.stringify(posts));
      }
    }
  }, [posts, loading]);

  // Add a new post
  const addPost = async (postData) => {
    const newPost = {
      id: uuidv4(),
      title: postData.title,
      content: postData.content,
      images: postData.images || [],
      tags: postData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft', // draft, published, archived
    };

    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.savePost(newPost);
        if (!result.success) {
          throw new Error(result.error || 'Failed to save post');
        }
      }
      
      setPosts((prevPosts) => [...prevPosts, newPost]);
      return newPost;
    } catch (err) {
      console.error('Error adding post:', err);
      setError('Failed to add blog post');
      throw err;
    }
  };

  // Update an existing post
  const updatePost = async (id, postData) => {
    try {
      const postIndex = posts.findIndex((post) => post.id === id);
      if (postIndex === -1) {
        throw new Error('Post not found');
      }

      const updatedPost = {
        ...posts[postIndex],
        ...postData,
        updatedAt: new Date().toISOString(),
      };

      if (window.electronAPI) {
        const result = await window.electronAPI.savePost(updatedPost);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update post');
        }
      }

      const updatedPosts = [...posts];
      updatedPosts[postIndex] = updatedPost;
      setPosts(updatedPosts);
      return updatedPost;
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update blog post');
      throw err;
    }
  };

  // Delete a post
  const deletePost = async (id) => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.deletePost(id);
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete post');
        }
      }

      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete blog post');
      throw err;
    }
  };

  // Delete multiple posts
  const deleteMultiplePosts = async (ids) => {
    try {
      // Track success/failure for each post
      const results = [];
      
      // Delete posts one by one
      for (const id of ids) {
        try {
          if (window.electronAPI) {
            const result = await window.electronAPI.deletePost(id);
            if (!result.success) {
              results.push({ id, success: false, error: result.error || 'Failed to delete post' });
              continue;
            }
          }
          results.push({ id, success: true });
        } catch (err) {
          results.push({ id, success: false, error: err.message });
        }
      }

      // Update state by removing all posts that were successfully deleted
      const successfullyDeletedIds = results
        .filter(result => result.success)
        .map(result => result.id);
      
      setPosts((prevPosts) => prevPosts.filter((post) => !successfullyDeletedIds.includes(post.id)));
      
      // Check if all deletions were successful
      const allSuccess = results.every(result => result.success);
      if (!allSuccess) {
        const failedCount = results.filter(result => !result.success).length;
        throw new Error(`Failed to delete ${failedCount} posts`);
      }
      
      return { success: true, deletedCount: successfullyDeletedIds.length };
    } catch (err) {
      console.error('Error in bulk delete:', err);
      setError('Some posts could not be deleted');
      throw err;
    }
  };

  // Archive a post
  const archivePost = async (id) => {
    try {
      const postIndex = posts.findIndex((post) => post.id === id);
      if (postIndex === -1) {
        throw new Error('Post not found');
      }

      const archivedPost = {
        ...posts[postIndex],
        status: 'archived',
        updatedAt: new Date().toISOString(),
      };

      if (window.electronAPI) {
        const result = await window.electronAPI.savePost(archivedPost);
        if (!result.success) {
          throw new Error(result.error || 'Failed to archive post');
        }
      }

      const updatedPosts = [...posts];
      updatedPosts[postIndex] = archivedPost;
      setPosts(updatedPosts);
      return archivedPost;
    } catch (err) {
      console.error('Error archiving post:', err);
      setError('Failed to archive blog post');
      throw err;
    }
  };

  // Unarchive a post (restore to draft)
  const unarchivePost = async (id) => {
    try {
      const postIndex = posts.findIndex((post) => post.id === id);
      if (postIndex === -1) {
        throw new Error('Post not found');
      }

      const unarchivedPost = {
        ...posts[postIndex],
        status: 'draft',
        updatedAt: new Date().toISOString(),
      };

      if (window.electronAPI) {
        const result = await window.electronAPI.savePost(unarchivedPost);
        if (!result.success) {
          throw new Error(result.error || 'Failed to unarchive post');
        }
      }

      const updatedPosts = [...posts];
      updatedPosts[postIndex] = unarchivedPost;
      setPosts(updatedPosts);
      return unarchivedPost;
    } catch (err) {
      console.error('Error unarchiving post:', err);
      setError('Failed to unarchive blog post');
      throw err;
    }
  };

  // Upload an image
  const uploadImage = async () => {
    try {
      if (window.electronAPI) {
        // Return the complete result including filePath and fileName
        const result = await window.electronAPI.selectImage();
        return result;
      }
      return null;
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
      throw err;
    }
  };

  // Value to be provided to consumers of this context
  const value = {
    posts,
    loading,
    error,
    addPost,
    updatePost,
    deletePost,
    deleteMultiplePosts,
    uploadImage,
    archivePost,
    unarchivePost,
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export default BlogContext;