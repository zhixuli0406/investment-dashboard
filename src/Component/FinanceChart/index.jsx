import React, { useEffect, useState, useRef, useLayoutEffect } from 'react'
import Highcharts from 'highcharts/highstock'
import { init, dispose, registerLocale } from 'klinecharts'
import Layout from '../../Layout/ChartLayout/index'
import axios from "axios";
import Grid from '@mui/material/Grid';
import '../../css/index.css';
import useWindowSize from '../../Hook/useWindowSize';
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
                    <div className='Fx(n) Bxz(bb)'>
                        <ul className='D(f) Fld(c) Flw(w) H(192px) Pstart(0px) Mt(0)'>
                            {
                                stockInfoList.map((item) => (
                                    <li className="price-detail-item H(32px) Mx(16px) D(f) Jc(sb) Ai(c) Bxz(bb) Px(0px) Py(4px) Bdbs(s) Bdbc($bd-primary-divider) Bdbw(1px)">
                                        <span className="C(#232a31) Fz(16px)--mobile Fz(14px)">{item.text}</span>
                                        <span className="Fw(600) Fz(16px)--mobile Fz(14px) D(f) Ai(c)" style={{ color: item.color }}>{item.value}</span>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <div className="Mt(12px) Mx(16px)">
                        <div className="D(f) Jc(sb) Ai(c) Mb(4px) Fz(16px)--mobile Fz(14px)">
                            <div className="C(#232a31) Fw(b)">
                                <span>內盤</span>
                                <span className="Mstart(5px) C($c-trend-down)">{stockInfo.inMarket}
                                    <span className="Fw(n)">{`(${round(stockInfo.inMarket / (stockInfo.inMarket + stockInfo.outMarket) * 100)}%)`}</span>
                                </span>
                            </div>
                            <div className="C(#232a31) Fw(b)">
                                <span className="Mend(5px) C($c-trend-up)">{stockInfo.outMarket}
                                    <span className="Fw(n)">{`(${round(stockInfo.outMarket / (stockInfo.inMarket + stockInfo.outMarket) * 100)}%)`}</span>
                                </span>
                                <span>外盤</span>
                            </div>
                        </div>
                        <div className="D(f) Jc(sb)">
                            <div className="H(8px) Mend(1px) Bgc($c-trend-down) Bdrsbstart(6px) Bdrststart(6px)" style={{ width: `${round(stockInfo.inMarket / (stockInfo.inMarket + stockInfo.outMarket) * 100)}%` }}></div>
                            <div className="H(8px) Mstart(1px) Bgc($c-trend-up) Bdrsbend(6px) Bdrstend(6px)" style={{ width: `${round(stockInfo.outMarket / (stockInfo.inMarket + stockInfo.outMarket) * 100)}%` }}></div>
                        </div>
                    </div>
                    <div className='Mt(24px) Mx(16px)'>
                        <div className='D(f)'>
                            <div className='W(50%) Bxz(bb)'>
                                <div className="D(f) Jc(sb) Ai(c) Mstart(0) Mend(16px) C(#232a31) Fz(16px)--mobile Fz(14px) Pb(4px) Bdbw(1px) Bdbs(s) Bdbc($bd-primary-divider)">
                                    <span>量</span>
                                    <span>委買價</span>
                                </div>
                                <div className='D(f) Jc(sb) Ai(c) Py(6px) Pstart(0px) Pend(16px)'>
                                    <div className='Flxg(2)'>
                                        {
                                            orderbook.map((item) => (
                                                <div className='Pos(r) D(f) Ai(c) H(28px) C(#232a31) Fz(16px)--mobile Fz(14px) Pstart(0px) Pend(0px) Mend(4px) Jc(fs)'>
                                                    <div className='Pos(a) H(20px) Bgc(#7dcbff) Op(0.5) Bdrs(4px) End(0)' style={{ width: `${item.bidVolK / bidVolKValue * 100}%` }}></div>
                                                    {item.bidVolK}
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className='D(f) Fld(c) Ai(fe)'>
                                        {
                                            orderbook.map((item) => (
                                                <div className='D(f) Ai(c) H(28px)'>
                                                    <span className='Fw(n) Fz(16px)--mobile Fz(14px) D(f) Ai(c) C($c-trend-down)'>{item.bid}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className='D(f) Jc(sb) Ai(c) Mstart(0) Mend(16px) C(#232a31) Fz(16px)--mobile Fz(14px) Pt(4px) Bdtw(1px) Bdts(s) Bdtc($bd-primary-divider)'>
                                    {bidVolKValue}
                                    <span>小計</span>
                                </div>
                            </div>
                            <div className='W(50%) Bxz(bb)'>
                                <div className="D(f) Jc(sb) Ai(c) C(#232a31) Fz(16px)--mobile Fz(14px) Pb(4px) Bdbw(1px) Bdbs(s) Bdbc($bd-primary-divider) Mstart(16px) Mend(0)">
                                    <span>委賣價</span>
                                    <span>量</span>
                                </div>
                                <div className='D(f) Jc(sb) Ai(c) Py(6px) Pstart(16px) Pend(0px)'>
                                    <div className='D(f) Fld(c) Ai(fe)'>
                                        {
                                            orderbook.map((item) => (
                                                <div className='D(f) Ai(c) H(28px)'>
                                                    <span className='Fw(n) Fz(16px)--mobile Fz(14px) D(f) Ai(c) C($c-trend-down)'>{item.ask}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                    <div className='Flxg(2)'>
                                        {
                                            orderbook.map((item) => (
                                                <div className='Pos(r) D(f) Ai(c) H(28px) C(#232a31) Fz(16px)--mobile Fz(14px) Pstart(0px) Pend(0px) Mstart(4px) Jc(fe)'>
                                                    <div className='Pos(a) H(20px) Bgc(#7dcbff) Op(0.5) Bdrs(4px) Start(0)' style={{ width: `${item.askVolK / askVolKValue * 100}%` }}></div>
                                                    {item.askVolK}
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className='D(f) Jc(sb) Ai(c) C(#232a31) Fz(16px)--mobile Fz(14px) Pt(4px) Bdtw(1px) Bdts(s) Bdtc($bd-primary-divider) Mstart(16px) Mend(0)'>
                                    <span>小計</span>
                                    {askVolKValue}
                                </div>
                            </div>
                        </div>
                    </div>
                </Grid>
            </Grid>
        </Layout>
    )
}
