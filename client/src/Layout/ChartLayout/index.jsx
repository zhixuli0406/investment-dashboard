import React from 'react'
import { Box, Typography, Stack, Chip, Grid } from "@mui/material";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

const renderStockChange = (stockInfo) => {
  if (parseFloat(stockInfo.change) === 0) {
    return (
      <>
        <Typography variant="body1" sx={{ fontSize: '35px', color: 'black', fontWeight: 'bold' }}>{stockInfo.price}</Typography>
        <HorizontalRuleIcon sx={{ color: 'black', width: '25px', height: '25px' }} />
        <Typography variant="body1" sx={{ fontSize: '25px', color: 'black', fontWeight: 'bold' }}>
          {stockInfo.change}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '25px', color: 'black', fontWeight: 'bold' }}>{`(${(stockInfo.change / stockInfo.price * 100).toFixed(2)}%)`}</Typography>
      </>
    )
  }
  else if (parseFloat(stockInfo.change) > 0) {
    return (
      <>
        <Typography variant="body1" sx={{ fontSize: '35px', color: 'red', fontWeight: 'bold' }}>{stockInfo.price}</Typography>
        <ArrowUpwardIcon sx={{ color: 'red', width: '25px', height: '25px' }} />
        <Typography variant="body1" sx={{ fontSize: '25px', color: 'red', fontWeight: 'bold' }}>
          {stockInfo.change}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '25px', color: 'red', fontWeight: 'bold' }}>{`(${(stockInfo.change / stockInfo.price * 100).toFixed(2)}%)`}</Typography>
      </>
    )
  }
  else {
    return (
      <>
        <Typography variant="body1" sx={{ fontSize: '35px', color: 'green', fontWeight: 'bold' }}>{stockInfo.price}</Typography>
        <ArrowDownwardIcon sx={{ color: 'green', width: '25px', height: '25px' }} />
        <Typography variant="body1" sx={{ fontSize: '25px', color: 'green', fontWeight: 'bold' }}>
          {stockInfo.change}
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '25px', color: 'green', fontWeight: 'bold' }}>{`(${(stockInfo.change / stockInfo.price * 100).toFixed(2)}%)`}</Typography>
      </>
    )
  }
}

export default function Layout({ stockInfo, children }) {
  return (
    <Box className="k-line-chart-container">
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1, alignItems: 'center' }}>
            <Typography variant="body1" sx={{ fontSize: '35px' }}>{stockInfo.symbolName}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'gray', fontSize: '30px' }}>{stockInfo.systexId}</Typography>
            {
              stockInfo.sectorName !== null ?
                <Chip label={stockInfo.sectorName} color="primary" size="small" /> : null
            }
          </Stack>
        </Grid>
        <Grid item xs={4}>
          <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2, ml: 2, alignItems: 'center', justifyContent: 'end' }}>
            {renderStockChange(stockInfo)}
          </Stack>
        </Grid>
      </Grid>
      {children}
    </Box >
  )
}
