import { AppBar, Box, Toolbar, Button, Typography, Container } from '@mui/material/';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Search from '../../Component/Search';
import { Outlet, useNavigate } from 'react-router-dom'
const pages = ['Products', 'Pricing', 'Blog'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];
const IndexLayout = () => {
    const navigate = useNavigate();
    return (
        <Container maxWidth="xl" sx={{ p: 1 }}>
            <AppBar position="sticky" sx={{ p: 2, borderRadius: '10px', backgroundColor: '#FCFAF2' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <AssessmentIcon fontSize='large' sx={{ mr: 2, color: 'red', cursor: 'pointer' }} onClick={() => navigate('/')} />
                        <Box sx={{ flexGrow: 1 }}>
                            <Search />
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <Outlet />
        </Container>
    )
}
export default IndexLayout;