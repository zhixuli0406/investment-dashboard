import React, { useEffect, useState, useRef } from 'react'
import Highcharts from 'highcharts/highstock'
import { init, dispose, registerLocale } from 'klinecharts'
import Layout from '../../Layout/ChartLayout/index'
import axios from "axios";
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)

export default function FinanceChart(props) {
    const { stockID, stockInfo } = props;
    const [dataSet, setDataSet] = useState([]);
    const [previousClose, setPreviousClose] = useState(0);
    const chart = useRef()

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
        </Layout>
    )
}
