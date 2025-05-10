import '../styles/globals.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BlogProvider } from '../components/BlogContext';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BlogProvider>
        <Component {...pageProps} />
      </BlogProvider>
    </ThemeProvider>
  );
}

export default MyApp;