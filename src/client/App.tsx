import * as React from 'react';
import { Box, Toolbar, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import Home from './components/Home';
import RouterTest from './components/RouterTest';
import LoginPage from './components/Login';
import SideMenu from './components/SideMenu';

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path='/' element={<Home />} />
    <Route path='/login' element={<LoginPage />} />
    <Route path='/router-example/:slug' element={<RouterTest />} />
  </Routes>
);

export const App: React.FC = () => {

  const preferDark = useMediaQuery('(prefers-color-scheme: dark)');

  const generateTheme = (dark: boolean) => createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: dark ? '#001333' : 'primary',
            color: dark ? '#ffffff' : 'primary',
            boxShadow: 'none',
          }
        }
      }
    }
  });
  
  const [theme, setTheme] = React.useState(generateTheme(preferDark));

  React.useMemo(() => setTheme(generateTheme(preferDark)), [preferDark]);

  document.body.style.backgroundColor = theme.palette.mode === 'dark' ? '#121212' : '#ffffff';

  return (
    <React.Fragment>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Box sx={{ display: 'flex' }}>
            <Header setTheme={setTheme} generateTheme={generateTheme} currentTheme={theme.palette.mode} />
            <SideMenu />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <AppRoutes />
            </Box>
          </Box>
        </ThemeProvider>
      </BrowserRouter>
    </React.Fragment>
  );
};

export default App;