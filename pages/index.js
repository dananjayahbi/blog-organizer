import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Container,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Description as PostsIcon,
  Image as ImagesIcon,
  Edit as DraftsIcon,
  Publish as PublishedIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useBlogContext } from '../components/BlogContext';

export default function Dashboard() {
  const { posts, loading, error } = useBlogContext();
  const [stats, setStats] = useState({
    totalPosts: 0,
    draftPosts: 0,
    publishedPosts: 0,
    totalImages: 0
  });

  // Calculate statistics
  useEffect(() => {
    if (posts && posts.length > 0) {
      const totalPosts = posts.length;
      const draftPosts = posts.filter(post => post.status === 'draft').length;
      const publishedPosts = posts.filter(post => post.status === 'published').length;
      
      // Count all images used across posts
      const totalImages = posts.reduce((total, post) => {
        return total + (post.images ? post.images.length : 0);
      }, 0);
      
      setStats({
        totalPosts,
        draftPosts,
        publishedPosts,
        totalImages
      });
    }
  }, [posts]);

  // Stats cards data
  const statsCards = [
    { title: 'Total Posts', value: stats.totalPosts, icon: <PostsIcon sx={{ fontSize: 40 }} color="primary" /> },
    { title: 'Draft Posts', value: stats.draftPosts, icon: <DraftsIcon sx={{ fontSize: 40 }} color="secondary" /> },
    { title: 'Published Posts', value: stats.publishedPosts, icon: <PublishedIcon sx={{ fontSize: 40 }} color="success" /> },
    { title: 'Total Images', value: stats.totalImages, icon: <ImagesIcon sx={{ fontSize: 40 }} color="info" /> },
  ];

  // Recent posts (show latest 5 posts)
  const recentPosts = posts ? [...posts].sort((a, b) => 
    new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5) : [];

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        {/* Show error if there's any */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        {/* Show loading indicator */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {statsCards.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card.title}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 140,
                      justifyContent: 'space-between',
                    }}
                    elevation={2}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography component="h2" variant="h6" color="text.secondary">
                        {card.title}
                      </Typography>
                      {card.icon}
                    </Box>
                    <Typography component="p" variant="h3">
                      {card.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            {/* Recent Posts Section */}
            <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
              Recent Posts
            </Typography>
            <Grid container spacing={2}>
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <Grid item xs={12} key={post.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{post.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {post.content.substring(0, 120)}
                          {post.content.length > 120 ? '...' : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Status: {post.status || 'draft'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last updated: {new Date(post.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1">No posts yet. Create your first post!</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </>
        )}
      </Box>
    </Layout>
  );
}