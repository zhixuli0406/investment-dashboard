import { useEffect, useState } from "react";
import axios from "axios";
import { Tab, Card, Tabs, Box } from '@mui/material/';
import { useParams } from 'react-router-dom';
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
    let { stockID } = useParams();
    const [stockInfo, setStockInfo] = useState({});
    const [value, setValue] = useState(0);

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

    useEffect(() => {
        searchStock(stockID)
        const intervalId = setInterval(() => {
            searchStock(stockID)
        }, 60000);
        return () => {
            clearInterval(intervalId)
        }
    }, [stockID])

    return (
        <Card sx={{ mt: 2, mb: 2 }}>
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
                <FinanceChart stockID={stockID} stockInfo={stockInfo} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <TechnicalIndicatorKLineChart stockID={stockID} stockInfo={stockInfo} />
            </TabPanel>
        </Card >
    )
}

export default ChartPage;