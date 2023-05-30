import { useEffect, useState } from "react";
import axios from "axios";
import { Tab, Card, Tabs, Box, Grid, Button, Typography } from '@mui/material/';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useParams, useNavigate } from 'react-router-dom';
import TechnicalIndicatorKLineChart from "../../Component/TechnicalIndicatorKLineChart";
import FinanceChart from "../../Component/FinanceChart";
import TimeSales from "../../Component/TimeSales";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}


const ChartPage = () => {
    let { stockID } = useParams();
    const [stockInfo, setStockInfo] = useState({});
    const [recommended, setRecommended] = useState([]);
    const [value, setValue] = useState(0);
    const navigate = useNavigate();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const searchStock = async (stockID) => {
        const response = await axios.get(`https://stock-proxy-uyy2ythogq-de.a.run.app/tw_yahoo/StockServices.stockList;fields=avgPrice%2Corderbook;symbols=${stockID}`);
        setStockInfo(stockInfo => ({
            ...stockInfo,
            ...response.data[0]
        }))
    }

    const recommendedTickers = async (stockID) => {
        const response = await axios.get(`https://stock-proxy-uyy2ythogq-de.a.run.app/tw_yahoo/StockServices.recommendedTickers;symbol=${stockID}`);
        setRecommended(response.data.stockList)
    }

    useEffect(() => {
        searchStock(stockID)
        recommendedTickers(stockID)
        const intervalId = setInterval(() => {
            searchStock(stockID)
        }, 10000);
        return () => {
            clearInterval(intervalId)
        }
    }, [stockID])

    return (
        <Grid container spacing={2}>
            <Grid item xs={8}>
                <Card sx={{ mt: 2, mb: 2, borderRadius: '10px', height: '650px' }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="fullWidth"
                        aria-label="full width tabs example"
                    >
                        <Tab label="走勢圖" {...a11yProps(0)} />
                        <Tab label="技術分析" {...a11yProps(1)} />
                        <Tab label="成交彙整" {...a11yProps(2)} />
                    </Tabs>
                    <TabPanel value={value} index={0} >
                        <FinanceChart stockID={stockID} stockInfo={stockInfo} />
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <TechnicalIndicatorKLineChart stockID={stockID} stockInfo={stockInfo} />
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <TimeSales stockID={stockID} stockInfo={stockInfo} />
                    </TabPanel>
                </Card >
            </Grid>
            <Grid item xs={4}>
                <Card sx={{ mt: 2, mb: 2, borderRadius: '10px', p: 2, height: '650px' }}>
                    <Typography
                        sx={{ flex: '1 1 100%' }}
                        variant="h5"
                        id="網友也在看"
                        component="div"
                    >
                        網友也在看
                    </Typography>
                    <TableContainer sx={{ overflow: 'hidden', mt: 2 }}>
                        <Table >
                            <TableHead>
                                <TableRow>
                                    <TableCell>股票名稱(股號)</TableCell>
                                    <TableCell>價格</TableCell>
                                    <TableCell align="right">漲跌幅</TableCell>
                                    <TableCell align="right">成交量</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    recommended.map((item) => (
                                        <TableRow
                                            key={item.symbol}
                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                            <TableCell component="th" scope="row">
                                                <Button variant="text" onClick={() => navigate(`/${item.symbol}`)}>{`${item.symbolName}(${item.symbol})`}</Button>
                                            </TableCell>
                                            <TableCell sx={{ color: (parseFloat(item.change) < 0 ? 'green' : 'red') }}>{`${item.price}`}</TableCell>
                                            <TableCell sx={{ color: (parseFloat(item.change) < 0 ? 'green' : 'red') }}>{`${item.change}(${item.changePercent})`}</TableCell>
                                            <TableCell >{item.volume}</TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card >
            </Grid>
        </Grid>
    )
}

export default ChartPage;