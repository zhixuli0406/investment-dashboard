import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import moment from 'moment';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TableRow from '@mui/material/TableRow';
import axios from "axios";
import '../../css/index.css'
import '../../css/TimeSales.css'
import Layout from "../../Layout/ChartLayout";

const TimeSales = (props) => {
    const { stockID, stockInfo } = props;
    const [priceByVolumes, setPriceByVolumes] = useState([])
    const [priceByTimes, setPriceByTimes] = useState([]);
    const [offsetNumber, setOffsetNumber] = useState(30);
    const [moreDisabled, setMoreDisable] = useState(false);
    const [allVolumes, setAllVolumes] = useState(0)

    const getPriceByVolumes = async () => {
        const response = await axios.get(
            `https://api.fugle.tw/realtime/v0.3/intraday/volumes`, {
            params: {
                symbolId: stockID.split('.')[0],
                apiToken: process.env.REACT_APP_FUGLE_API_KEY
            }
        });
        let volume = 0
        for (let i = 0; i < response.data.data.volumes.length; i++) {
            volume += response.data.data.volumes[i].volume
        }
        setAllVolumes(volume)
        setPriceByVolumes(response.data.data.volumes)
    }

    const getPriceByTimes = async () => {
        const response = await axios.get(
            `https://api.fugle.tw/realtime/v0.3/intraday/dealts`, {
            params: {
                symbolId: stockID.split('.')[0],
                apiToken: process.env.REACT_APP_FUGLE_API_KEY,
                limit: 30
            }
        });
        setPriceByTimes(priceByTimes => [...priceByTimes, ...response.data.data.dealts,])
    }

    const getMorePriceByTimes = async () => {
        const response = await axios.get(
            `https://api.fugle.tw/realtime/v0.3/intraday/dealts`, {
            params: {
                symbolId: stockID.split('.')[0],
                apiToken: process.env.REACT_APP_FUGLE_API_KEY,
                limit: 500,
                offset: offsetNumber
            }
        });
        if (response.data.data.dealts.length === 0) {
            setMoreDisable(true);
        }
        setPriceByTimes(priceByTimes => [...priceByTimes, ...response.data.data.dealts])
    }

    useEffect(() => {
        getPriceByTimes();
        getPriceByVolumes();
    }, [])

    return (
        <Layout stockInfo={stockInfo}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}><Typography variant="body1" sx={{ fontSize: '35px' }}>成交彙整</Typography></Grid>
                        <Grid item xs={6} sx={{ placeSelf: 'center', textAlign: 'center' }}><Typography variant="caption">資料時間：{moment(priceByTimes[0]?.at).format('YYYY/MM/DD HH:mm:ss')}</Typography></Grid>
                    </Grid>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer className="table" sx={{ maxHeight: 370 }}>
                            <Table stickyHeader >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            時間
                                        </TableCell>
                                        <TableCell align="center">
                                            成交價
                                        </TableCell>
                                        <TableCell align="center">
                                            漲跌
                                        </TableCell>
                                        <TableCell align="center">
                                            成交張數
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        priceByTimes.sort(function (a, b) {
                                            return a.at < b.at ? 1 : -1;
                                        }).map((row) => {
                                            let color = 'green';
                                            if (row.price - stockInfo.regularMarketPreviousClose === 0) {
                                                color = 'black'
                                            }
                                            else if (row.price - stockInfo.regularMarketPreviousClose > 0) {
                                                color = 'red'
                                            }
                                            return (
                                                <TableRow>
                                                    <TableCell>
                                                        {moment(row.at).format('HH:mm:ss')}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {row.price}
                                                    </TableCell>
                                                    <TableCell align="center" style={{ color: color }}>
                                                        {(row.price - stockInfo.regularMarketPreviousClose).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {row.volume}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button
                            variant="text"
                            onClick={() => {
                                setOffsetNumber(offsetNumber => offsetNumber + 500)
                                getMorePriceByTimes();
                            }}
                            disabled={moreDisabled}
                            sx={{ p: 2 }}
                        >
                            載入更多
                            <KeyboardArrowDownIcon />
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}><Typography variant="body1" sx={{ fontSize: '35px' }}>價量變化</Typography></Grid>
                        <Grid item xs={6} sx={{ placeSelf: 'center', textAlign: 'center' }}><Typography variant="caption">資料時間：{moment(priceByTimes[0]?.at).format('YYYY/MM/DD HH:mm:ss')}</Typography></Grid>
                    </Grid>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer className="table" sx={{ maxHeight: 426.5 }}>
                            <Table stickyHeader >
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">
                                            成交價
                                        </TableCell>
                                        <TableCell align="center">
                                        </TableCell>
                                        <TableCell align="center">
                                            成交張數
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        priceByVolumes.sort(function (a, b) {
                                            return a.price < b.price ? 1 : -1;
                                        }).map((row) => {
                                            return (
                                                <TableRow>
                                                    <TableCell align="center">
                                                        {row.price}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="Fxg(1)">
                                                            <div className='Mstart(4px) Bgc(#85bdf2) H(20px) Bdrs(2px) Maw(280px)--mobile' style={{ width: `${row.volume / allVolumes * 100}%` }}></div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {row.volume}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Layout >
    )
}

export default TimeSales