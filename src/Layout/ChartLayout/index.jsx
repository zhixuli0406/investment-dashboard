import React from 'react'
import { Box, Typography, Stack, Chip, Grid } from "@mui/material";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function Layout({ stockInfo, children }) {
  return (
    <Box className="k-line-chart-container">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, alignItems: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '35px' }}>{stockInfo.symbolName}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'gray', fontSize: '30px' }}>{stockInfo.systexId}</Typography>
            {
              stockInfo.sectorName !== null ?
                <Chip label={stockInfo.sectorName} color="primary" size="small" /> : null
            }
          </Stack>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2, ml: 2, alignItems: 'center', justifyContent: 'end' }}>
            {
              parseFloat(stockInfo.change) >= 0 ?
                <>
                  <Typography variant="body1" sx={{ fontSize: '35px', color: 'red', fontWeight: 'bold' }}>{stockInfo.price}</Typography>
                  <Typography variant="body1" sx={{ fontSize: '25px', color: 'red', fontWeight: 'bold' }}>
                    <ArrowDropUpIcon sx={{ color: 'red', width: '25px', height: '25px' }} />
                    {stockInfo.change}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '25px', color: 'red', fontWeight: 'bold' }}>{`(${(stockInfo.change / stockInfo.price * 100).toFixed(2)}%)`}</Typography>
                </>
                :
                <>
                  <Typography variant="body1" sx={{ fontSize: '35px', color: 'green', fontWeight: 'bold' }}>{stockInfo.price}</Typography>
                  <Typography variant="body1" sx={{ fontSize: '25px', color: 'green', fontWeight: 'bold' }}>
                    <ArrowDropDownIcon sx={{ color: 'green', width: '25px', height: '25px' }} />
                    {stockInfo.change}
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '25px', color: 'green', fontWeight: 'bold' }}>{`(${(stockInfo.change / stockInfo.price * 100).toFixed(2)}%)`}</Typography>
                </>
            }
          </Stack>
        </Grid>
      </Grid>



      {children}
    </Box >
  )
}
