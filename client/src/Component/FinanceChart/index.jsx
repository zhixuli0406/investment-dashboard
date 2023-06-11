import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import Highcharts from 'highcharts/highstock'
import { init, dispose, registerLocale } from 'klinecharts'
import axios from "axios";
import Grid from '@mui/material/Grid';
import Layout from '../../Layout/ChartLayout/index'
import '../../css/index.css';
import useWindowSize from '../../Hook/useWindowSize';
import StockInfoList from '../StockInfoList';
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)

export default function FinanceChart(props) {
    const { stockID, stockInfo } = props;
    const [stockInfoList, setStockInfoList] = useState([]);
    const [dataSet, setDataSet] = useState([]);
    const [previousClose, setPreviousClose] = useState(0);
    const [orderbook, setOrderbook] = useState([])
    const [askVolKValue, setAskVolKValue] = useState(0);
    const [bidVolKValue, setBidVolKValue] = useState(0);
    const [width, height] = useWindowSize()
    const chart = useRef()

    function round(num) {
        var m = Number((Math.abs(num) * 100).toPrecision(15));
        return Math.round(m) / 100 * Math.sign(num);
    }

    const getStockPrice = async () => {
        const response = await axios.get(
            `https://stock-proxy-uyy2ythogq-de.a.run.app/tw_yahoo/FinanceChartService.ApacLibraCharts;autoRefresh=1684373057125;symbols=%5B%22${stockID}%22%5D;type=tick`,
            {
                params: {
                    lang: "zh-TW"
                }
            }
        );
        let chart = response.data['0'].chart;
        let data = []
        for (let i = 0; i < chart.timestamp.length; i++) {
            if (chart.indicators.quote['0'].open[i] !== null) {
                data.push({
                    timestamp: chart.timestamp[i] * 1000,
                    open: chart.indicators.quote['0'].open[i],
                    close: chart.indicators.quote['0'].close[i],
                    high: chart.indicators.quote['0'].high[i],
                    low: chart.indicators.quote['0'].low[i],
                    volume: chart.indicators.quote['0'].volume[i]
                })
            }
        }
        data.unshift({
            timestamp: (chart.timestamp[0] - 100) * 1000,
            open: chart.meta.previousClose,
            close: chart.meta.previousClose,
            high: chart.meta.previousClose,
            low: chart.meta.previousClose,
        })
        setDataSet(data);
        setPreviousClose(chart.meta.previousClose);
    }

    useEffect(() => {
        registerLocale('zh-TW', {
            time: '時間：',
            open: '開：',
            high: '高：',
            low: '低：',
            close: '收：',
            volume: '成交量：'
        })
        chart.current = init('finance-chart')
        chart.current?.setLocale('zh-TW')
        chart.current?.setStyles({
            candle: {
                type: 'area',
            },
        });
        chart.current?.createIndicator('VOL', false, { height: 180 })
        return () => {
            dispose('finance-chart')
        }
    }, [])

    useEffect(() => {
        getStockPrice();
        const intervalId = setInterval(() => {
            getStockPrice()
        }, 60000);
        return () => {
            clearInterval(intervalId)
        }
    }, [stockID])

    useEffect(() => {
        let averageValue = 0;
        for (let i = 0; i < dataSet.length; i++) {
            if (dataSet[i].close)
                averageValue += dataSet[i].close;
        }
        let bidVolK = 0
        let askVolK = 0
        if (stockInfo.orderbook) {
            for (let i = 0; i < stockInfo.orderbook.length; i++) {
                bidVolK += stockInfo.orderbook[i].bidVolK
                askVolK += stockInfo.orderbook[i].askVolK
            }
            setOrderbook(stockInfo.orderbook)
            setAskVolKValue(askVolK)
            setBidVolKValue(bidVolK)
        }
        averageValue = averageValue / dataSet.length;
        let infoList = [
            { text: '成交', value: stockInfo.price, color: stockInfo.price >= stockInfo.regularMarketPreviousClose ? '#ff333a' : '#00ab5e' },
            { text: '開盤', value: stockInfo.regularMarketOpen, color: stockInfo.regularMarketOpen >= stockInfo.regularMarketPreviousClose ? '#ff333a' : '#00ab5e' },
            { text: '最高', value: stockInfo.regularMarketDayHigh, color: stockInfo.regularMarketDayHigh >= stockInfo.regularMarketPreviousClose ? '#ff333a' : '#00ab5e' },
            { text: '最低', value: stockInfo.regularMarketDayLow, color: stockInfo.regularMarketDayLow >= stockInfo.regularMarketPreviousClose ? '#ff333a' : '#00ab5e' },
            { text: '均價', value: round(averageValue), color: '#000' },
            { text: '成交金額(億)', value: round(stockInfo.turnoverM / 100), color: '#000' },
            { text: '昨收', value: stockInfo.regularMarketPreviousClose, color: '#000' },
            { text: '漲跌幅', value: stockInfo.changePercent, color: stockInfo.changeStatus === 'up' ? '#ff333a' : '#00ab5e' },
            { text: '漲跌', value: stockInfo.change, color: stockInfo.changeStatus === 'up' ? '#ff333a' : '#00ab5e' },
            { text: '總量', value: stockInfo.volumeK, color: '#000' },
            { text: '昨量', value: stockInfo.previousVolumeK, color: '#000' },
            { text: '振幅', value: `${round(((stockInfo.regularMarketDayHigh - stockInfo.regularMarketDayLow) / stockInfo.regularMarketPreviousClose) * 100)}%`, color: '#000' },
        ]
        setStockInfoList(infoList)
    }, [stockInfo, dataSet])

    useLayoutEffect(() => {
        chart.current?.resize();
    }, [width, height])

    useEffect(() => {
        chart.current?.zoomAtCoordinate(0)
        chart.current?.removeOverlay('priceLine')
        chart.current?.applyNewData(dataSet)
        chart.current?.createOverlay({ name: 'priceLine', points: [{ value: previousClose }], lock: true })
        chart.current?.zoomAtCoordinate(-5)
        chart.current?.setStyles({
            candle: {
                tooltip: {
                    showRule: 'follow_cross',
                    showType: 'rect'
                }
            },
            yAxis: {
                inside: true,
            }
        })
    }, [dataSet])

    return (
        <Layout stockInfo={stockInfo}>
            <Grid container spacing={2}>
                <Grid item xs={6} >
                    <div id="finance-chart" style={{ width: '100%', height: '471px' }} />
                </Grid>
                <Grid item xs={6}>
                    <StockInfoList
                        stockInfo={stockInfo}
                        stockInfoList={stockInfoList}
                        orderbook={orderbook}
                        askVolKValue={askVolKValue}
                        bidVolKValue={bidVolKValue}
                    />
                </Grid>
            </Grid>
        </Layout>
    )
}
