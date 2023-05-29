import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import moment from 'moment';

const TimeSales = (props) => {
    const { stockID, stockInfo } = props;
    const [priceByVolumes, setPriceByVolumes] = useState([])
    const [priceByTimes, setPriceByTimes] = useState([])

    const getPriceByVolumes = async () => {
        const response = await axios.get(
            `https://stock-proxy-uyy2ythogq-de.a.run.app/tw_yahoo/StockServices.priceByVolumes;symbol=${stockID}`
        );
        setPriceByVolumes(response.data.priceByVolumes)
    }

    const getPriceByTimes = async () => {
        const date = moment(new Date()).format()
        const response = await axios.get(
            `https://stock-proxy-uyy2ythogq-de.a.run.app/tw_yahoo/StockServices.priceByTimes;symbol=${stockID};time=${date}`
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
                
            </Grid>
            <Grid item xs={6}>

            </Grid>
        </Grid>
    )
}

export default TimeSales