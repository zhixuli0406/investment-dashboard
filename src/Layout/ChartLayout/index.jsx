import React from 'react'
import { Box, CircularProgress, Container, Snackbar, Toolbar, Typography, Grid, Stack, Chip, TextField, Autocomplete } from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function Layout({ stockInfo, children }) {
  return (
    <Box className="k-line-chart-container">
      <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, alignItems: 'center' }}>
        <Typography variant="body1" sx={{ fontSize: '25px' }}>{stockInfo.symbolName}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'gray', fontSize: '20px' }}>{stockInfo.systexId}</Typography>
        {
          stockInfo.sectorName !== null ?
            <Chip label={stockInfo.sectorName} color="primary" size="small" /> : null
        }

      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2, alignItems: 'center' }}>
        {
          parseFloat(stockInfo.change) >= 0 ?
            <>
              <Typography variant="body1" sx={{ fontSize: '25px', color: 'red', fontWeight: 'bold' }}>{stockInfo.price}</Typography>
              <Chip icon={<ArrowDropUpIcon />} label={stockInfo.change} sx={{ color: 'red', fontWeight: 'bold', fontSize: '20px' }} />
            </>
            :
            <>
              <Typography variant="body1" sx={{ fontSize: '25px', color: 'green', fontWeight: 'bold' }}>{stockInfo.price}</Typography>
              <Chip icon={<ArrowDropDownIcon />} label={stockInfo.change} sx={{ color: 'green', fontWeight: 'bold', fontSize: '20px' }} />
            </>
        }
      </Stack>

      {children}
    </Box>
  )
}
