import React, { useEffect, useState, useRef } from 'react'
import Highcharts from 'highcharts/highstock'
import { init, dispose, registerLocale } from 'klinecharts'
import Layout from '../../Layout/ChartLayout/index'
import axios from "axios";
import './index.css';
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
    const chart = useRef()

    function round(num) {
        var m = Number((Math.abs(num) * 100).toPrecision(15));
        return Math.round(m) / 100 * Math.sign(num);
    }

    const getStockPrice = async () => {
        const response = await axios.get(
            `https://stock-proxy-uyy2ythogq-de.a.run.app/tw_yahoo/_td-stock/api/resource/FinanceChartService.ApacLibraCharts;autoRefresh=1684373057125;symbols=%5B%22${stockID}%22%5D;type=tick`,
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
        chart.current = init('technical-indicator-k-line')
        chart.current?.setLocale('zh-TW')
        chart.current?.setStyles({
            candle: {
                type: 'area',
            },
        });
        chart.current?.createIndicator('VOL', false, { height: 100 })
        return () => {
            dispose('technical-indicator-k-line')
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
    }, [stockInfo])

    useEffect(() => {
        chart.current?.zoomAtCoordinate(0)
        chart.current?.removeOverlay('priceLine')
        chart.current?.applyNewData(dataSet)
        chart.current?.createOverlay({ name: 'priceLine', points: [{ value: previousClose }], lock: true })
        chart.current?.zoomAtCoordinate(-8)
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
            <div id="technical-indicator-k-line" style={{ width: '100%', height: '400px' }} />
            <div className='Fx(n) Bxz(bb) Pt(12px)'>
                <ul className='D(f) Fld(c) Flw(w) H(192px) Pstart(0px)'>
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
        </Layout>
    )
}
