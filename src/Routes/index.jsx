import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ChartPage from '../Page/ChartPage';
import IndexLayout from '../Layout/IndexLayout';

const darkTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

const AppRoutes = () => {
    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <Routes>
                    <Route path='/' element={<IndexLayout />}>
                        <Route path=":stockID" element={<ChartPage />} />
                    </Route>
                </Routes>
            </ThemeProvider>
        </>
    )
}
export default AppRoutes