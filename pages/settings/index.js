import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemText,
  Switch,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import Layout from '../../components/Layout';
import { useThemeContext } from '../../components/ThemeContext';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useThemeContext();
  const [autosave, setAutosave] = useState(true);
  const [defaultView, setDefaultView] = useState('preview');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedAutosave = localStorage.getItem('autosave');
    const storedDefaultView = localStorage.getItem('defaultView');
    
    if (storedAutosave !== null) {
      setAutosave(storedAutosave === 'true');
    }
    
    if (storedDefaultView) {
      setDefaultView(storedDefaultView);
    }
  }, []);

  // Handle settings save
  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('autosave', autosave);
    localStorage.setItem('defaultView', defaultView);
    
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success'
    });
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Layout>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        <Paper sx={{ p: 3, my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Application Settings
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText primary="Dark Mode" secondary="Use dark color theme" />
              <Switch
                edge="end"
                checked={darkMode}
                onChange={handleDarkModeToggle}
              />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemText primary="Auto Save" secondary="Automatically save drafts while typing" />
              <Switch
                edge="end"
                checked={autosave}
                onChange={(e) => setAutosave(e.target.checked)}
              />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemText primary="Default Post View" />
              <FormControl sx={{ minWidth: 150 }}>
                <Select
                  value={defaultView}
                  onChange={(e) => setDefaultView(e.target.value)}
                  size="small"
                >
                  <MenuItem value="preview">Preview</MenuItem>
                  <MenuItem value="editor">Editor</MenuItem>
                  <MenuItem value="split">Split View</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
          </List>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSave}
            >
              Save Settings
            </Button>
          </Box>
        </Paper>
        
        {/* Additional settings sections could go here */}
        
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
      </Box>
    </Layout>
  );
}