import { useEffect, useState } from "react";
import axios from "axios";
import { Tab, Container, Tabs, Box, List, ListItem, ListItemText, ListItemButton } from '@mui/material/';
import { Search, SearchIconWrapper, StyledInputBase } from "../../Component/Search";
import SearchIcon from '@mui/icons-material/Search';
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

const ChartPage = () => {
    const [stockList, setStockList] = useState([]);
    const [selectStock, setSelectStock] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [searchListShow, setSearchListShow] = useState(false);
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        searchStockList();
    }, [inputValue])

    const showTechnicalIndicatorKLineChart = () => {
        if (selectStock) {
            return (
                <TechnicalIndicatorKLineChart stockID={selectStock.symbol} seriesName={selectStock.longname} />
            )
        }
    }

    const showFinanceChart = () => {
        if (selectStock) {
            return (
                <FinanceChart stockID={selectStock.symbol} seriesName={selectStock.longname} />
            )
        }
    }

    const searchStockList = async () => {
        const response = await axios.get('https://stock-proxy-uyy2ythogq-de.a.run.app/yahoo_query1/v1/finance/search',
            {
                params: {
                    q: inputValue,
                    lang: 'zh-TW',
                    quotesCount: 8,
                }
            }
        );
        setStockList(response.data.quotes)
        setSearchListShow(true)
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
                        if (event.target.value.length == 0)
                            setSearchListShow(false);
                    }}
                />
            </Search>
            {
                searchListShow ?
                    <List sx={{ border: "groove", position: 'absolute', backgroundColor: '#fff', zIndex: 1000 }}>
                        {
                            stockList.map((Stock) => (
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => {
                                            setSelectStock(Stock);
                                            setSearchListShow(false);
                                        }}
                                    >
                                        <ListItemText
                                            primary={Stock.symbol}
                                            secondary={Stock.longname}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))
                        }
                    </List> : null
            }
            {
                selectStock ?
                    <>
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
                    </> : null
            }
        </Container>
    )
}

export default ChartPage;