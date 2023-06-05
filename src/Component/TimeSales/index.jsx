import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import moment from 'moment';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import axios from "axios";
import './index.css'
import Layout from "../../Layout/ChartLayout";

const TimeSales = (props) => {
    const { stockID, stockInfo } = props;
    const [priceByVolumes, setPriceByVolumes] = useState([])
    const [priceByTimes, setPriceByTimes] = useState([])
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const getPriceByVolumes = async () => {
        const response = await axios.get(
            `https://stock-proxy-uyy2ythogq-de.a.run.app/tw_yahoo/StockServices.priceByVolumes;symbol=${stockID}`
        );
        setPriceByVolumes(response.data.priceByVolumes)
    }

    const getPriceByTimes = async () => {
        const response = await axios.get(
            `https://api.fugle.tw/realtime/v0.3/intraday/dealts`, {
            params: {
                symbolId: stockID.split('.')[0],
                apiToken: process.env.REACT_APP_FUGLE_API_KEY,
                limit: 500
            }
        }
        );
        setPriceByTimes(response.data.data.dealts)
    }

    useEffect(() => {
        getPriceByTimes();
        getPriceByVolumes();
        const intervalId = setInterval(() => {
            getPriceByTimes();
            getPriceByVolumes();
        }, 60000);
        return () => {
            clearInterval(intervalId)
        }
    }, [])

    return (
        <Layout stockInfo={stockInfo}>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                        <TableContainer className="table" sx={{ maxHeight: 430 }}>
                            <Table stickyHeader >
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">
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
                                        (rowsPerPage > 0
                                            ? priceByTimes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            : priceByTimes
                                        ).map((row) => {
                                            let color = 'green';
                                            if (row.price - stockInfo.regularMarketPreviousClose === 0) {
                                                color = 'black'
                                            }
                                            else if (row.price - stockInfo.regularMarketPreviousClose > 0) {
                                                color = 'red'
                                            }
                                            return (
                                                <TableRow>
                                                    <TableCell align="center">
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
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={priceByTimes.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={6}>

                </Grid>
            </Grid>
        </Layout>
    )
}

export default TimeSales