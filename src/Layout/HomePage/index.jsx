import { useEffect, useState } from "react";
import Select from 'react-select';
import axios from "axios";
import SwipeableViews from 'react-swipeable-views';
import { Tab, Container, Tabs, Box, List, ListItem, ListItemText, ListItemButton } from '@mui/material/';
import { Search, SearchIconWrapper, StyledInputBase } from "../../Component/Search";
import SearchIcon from '@mui/icons-material/Search';
import Fuse from 'fuse.js'
import TechnicalIndicatorKLineChart from "../../Component/TechnicalIndicatorKLineChart";
import FinanceChart from "../../Component/FinanceChart";

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

const Homepage = () => {
    const [allStockInfo, setAllStockInfo] = useState([]);
    const [selectStock, setSelectStock] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [searchListShow, setSearchListShow] = useState(false);
    const [stockPrice, setStockPrice] = useState(null);
    const [stockFinance, setStockFinance] = useState(null);
    const [value, setValue] =useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index) => {
        setValue(index);
    };

    const options = {
        includeScore: true,
        keys: ['stock_id', 'stock_name']
    }
    const fuse = new Fuse(allStockInfo, options)

    useEffect(() => {
        getAllStockList()
    }, []);

    useEffect(() => {
        getStockPrice()
        getFinance()
        const intervalId = setInterval(() => {
            getFinance()
        }, 60000);
        return () => clearInterval(intervalId);
    }, [selectStock]);

    const showTechnicalIndicatorKLineChart = () => {
        if (stockPrice) {
            return (
                <TechnicalIndicatorKLineChart dataset={stockPrice} seriesName={selectStock.stock_name} />
            )
        }
    }

    const showFinanceChart = () => {
        if (stockPrice) {
            return (
                <FinanceChart dataset={stockFinance} seriesName={selectStock.stock_name} />
            )
        }
    }

    const getFinance = async () => {
        const response = await axios.get(`https://stock-proxy-uyy2ythogq-de.a.run.app/_td-stock/api/resource/FinanceChartService.ApacLibraCharts;symbols=%5B%22${selectStock.stock_id}.TWO%22%5D;type=tick`);
        let chart = response.data['0'].chart;
        let data = [];
        for (let i = 0; i < chart.timestamp.length; i++) {
            data.push([
                chart.timestamp[i] * 1000,
                chart.indicators.quote['0'].close[i],
                chart.indicators.quote['0'].volume[i]
            ])
        }
        setStockFinance(data)
    }

    const getAllStockList = async () => {
        const response = await axios.get('https://api.finmindtrade.com/api/v4/data?',
            {
                params: {
                    dataset: "TaiwanStockInfo",
                    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMy0wNS0xNCAxOTo0Mjo1MyIsInVzZXJfaWQiOiJsb3Vpcy5saSIsImlwIjoiMTIyLjExNy4xMzUuMjExIn0.u_Qa8Kgoi7_lWSlNfPZORKxA-vDtHJoykPGyqd6FW9w"
                }
            }
        );
        if (response.data.status === 200) {
            setAllStockInfo(response.data.data)
        }
        else {
            console.log(response.data.msg)
        }
    }

    const getStockPrice = async () => {
        const time = new Date();
        const response = await axios.get('https://api.finmindtrade.com/api/v4/data?',
            {
                params: {
                    dataset: "TaiwanStockPrice",
                    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyMy0wNS0xNCAxOTo0Mjo1MyIsInVzZXJfaWQiOiJsb3Vpcy5saSIsImlwIjoiMTIyLjExNy4xMzUuMjExIn0.u_Qa8Kgoi7_lWSlNfPZORKxA-vDtHJoykPGyqd6FW9w",
                    data_id: selectStock.stock_id,
                    start_date: `${time.getFullYear() - 10}-${time.getMonth() + 1}-${time.getDate()}`,
                    end_date: `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`,
                }
            }
        );
        if (response.data.status === 200) {
            let data = [];
            response.data.data.map((item) => {
                data.push(
                    {
                        timestamp: new Date(item.date).toString(),
                        open: item.open,
                        close: item.close,
                        high: item.max,
                        low: item.min,
                        volume: item.Trading_Volume,
                        turnover: item.Trading_money
                    }
                )
            })
            setStockPrice(data)
        }
        else {
            console.log(response.data.msg)
        }
    }

    return (
        <Container maxWidth="lg">
            <Search>
                <SearchIconWrapper>
                    <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                    placeholder="搜尋股票代碼或名稱..."
                    inputProps={{
                        'aria-label': 'search'
                    }}
                    value={inputValue}
                    onChange={(event) => {
                        setInputValue(event.target.value);
                        if (event.target.value.length > 0)
                            setSearchListShow(true);
                        else
                            setSearchListShow(false);
                    }}
                />
            </Search>
            {
                searchListShow ?
                    <List sx={{ border: "groove", position: 'absolute', backgroundColor: '#fff', zIndex: 1000 }}>
                        {
                            fuse.search(inputValue).slice(0, 10).map((Stock) => (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => {
                                            setSelectStock(Stock.item);
                                            setSearchListShow(false);
                                        }}
                                    >
                                        <ListItemText primary={`${Stock.item.stock_id} - ${Stock.item.stock_name}`} />
                                    </ListItemButton>
                                </ListItem>
                            ))
                        }
                    </List> : null
            }
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
            </Tabs>
            <SwipeableViews
                index={value}
                onChangeIndex={handleChangeIndex}
            >
                <TabPanel value={value} index={0} >
                    {
                        showFinanceChart()
                    }
                </TabPanel>
                <TabPanel value={value} index={1}>
                    {
                        showTechnicalIndicatorKLineChart()
                    }
                </TabPanel>
            </SwipeableViews>

        </Container>
    )
}

export default Homepage;