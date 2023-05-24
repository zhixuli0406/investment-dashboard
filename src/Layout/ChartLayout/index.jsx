import React from 'react'
import { Box, Typography, Stack, Chip } from "@mui/material";
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
              <Typography variant="body1" sx={{ fontSize: '30px', color: 'red', fontWeight: 'bold' }}>{stockInfo.price}</Typography>
              <Typography variant="body1" sx={{ fontSize: '20px', color: 'red', fontWeight: 'bold' }}>
                <ArrowDropUpIcon sx={{ color: 'red', width: '20px', height: '20px' }} />
                {stockInfo.change}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '20px', color: 'red', fontWeight: 'bold' }}>{`(${(stockInfo.change / stockInfo.price * 100).toFixed(2)}%)`}</Typography>
            </>
            :
            <>
              <Typography variant="body1" sx={{ fontSize: '30px', color: 'green', fontWeight: 'bold' }}>{stockInfo.price}</Typography>
              <Typography variant="body1" sx={{ fontSize: '20px', color: 'green', fontWeight: 'bold' }}>
                <ArrowDropDownIcon sx={{ color: 'green', width: '20px', height: '20px' }} />
                {stockInfo.change}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '20px', color: 'green', fontWeight: 'bold' }}>{`(${(stockInfo.change / stockInfo.price * 100).toFixed(2)}%)`}</Typography>
            </>
        }
      </Stack>

      {children}
    </Box>
  )
}
