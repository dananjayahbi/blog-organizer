import { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  List, 
  Typography, 
  Divider, 
  IconButton, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  CssBaseline
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';

// Drawer width
const drawerWidth = 240;

export default function Layout({ children }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const theme = useTheme();

  // Toggle drawer
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Posts', icon: <DescriptionIcon />, path: '/posts' },
    { text: 'Archives', icon: <ArchiveIcon />, path: '/archives' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme => theme.zIndex.drawer + 1,
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 5,
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Blog Post Draft Manager
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Side Drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            whiteSpace: 'nowrap',
            ...(open ? {
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            } : {
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              overflowX: 'hidden',
              width: theme => ({ xs: '0px', sm: `calc(${theme.spacing(7)} + 1px)` }),
            }),
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem 
              key={item.text} 
              disablePadding 
              sx={{ display: 'block' }}
              onClick={() => router.push(item.path)}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  backgroundColor: router.pathname === item.path ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: router.pathname === item.path ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    color: router.pathname === item.path ? 'primary.main' : 'inherit',
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* Add spacing equal to the AppBar height */}
        {children}
      </Box>
    </Box>
  );
}