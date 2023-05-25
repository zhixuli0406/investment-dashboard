import { AppBar, Box, Toolbar, IconButton, Typography, Container } from '@mui/material/';
import Search from '../../Component/Search';
import { Outlet } from 'react-router-dom'
const IndexLayout = () => {
    return (
        <Container maxWidth="xl" sx={{ p: 1 }}>
            <AppBar position="sticky" sx={{ p: 2, backgroundColor: '#fff' }}>
                <Search />
            </AppBar>
            <Outlet />
        </Container>
    )
}
export default IndexLayout;