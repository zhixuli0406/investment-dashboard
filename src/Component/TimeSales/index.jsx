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
        const date = moment(new Date()).format()
        const response = await axios.get(
            `https://stock-proxy-uyy2ythogq-de.a.run.app/tw_yahoo/StockServices.priceByTimes;symbol=${stockID};time=${encodeURIComponent(date)}`
        );
        setPriceByTimes(response.data.priceByTimes)
    }

    useEffect(() => {
        getPriceByTimes();
        getPriceByVolumes();
    }, [])

    return (
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer sx={{ maxHeight: 471 }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        時間
                                    </TableCell>
                                    <TableCell>
                                        成交價
                                    </TableCell>
                                    <TableCell>
                                        漲跌
                                    </TableCell>
                                    <TableCell>
                                        成交張數
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                
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
    )
}

export default TimeSales