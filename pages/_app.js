import '../styles/globals.css';
import '../styles/editor.css';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { BlogProvider } from '../components/BlogContext';
import { ThemeProvider, useThemeContext } from '../components/ThemeContext';

function AppContent({ Component, pageProps }) {
  const { theme } = useThemeContext();
  
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <BlogProvider>
        <Component {...pageProps} />
      </BlogProvider>
    </MuiThemeProvider>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;