import React, { useEffect, useState, useRef } from 'react'
import { init, dispose, registerLocale } from 'klinecharts'
import { Button, Stack } from '@mui/material/';
import axios from "axios";
import Layout from '../../Layout/ChartLayout/index'

const intervalList = [
    {
        text: '日K線',
        name: '1d'
    },
    {
        text: '5日K線',
        name: '5d'
    },
    {
        text: '週K線',
        name: '1wk'
    },
    {
        text: '月K線',
        name: '1mo'
    },
]

export default function TechnicalIndicatorKLineChart(props) {
    const { stockID, stockInfo } = props
    const [dataSet, setDataSet] = useState([])
    const [kLineType, setKLineType] = useState(intervalList[0])
    const chart = useRef();

    const getStockPrice = async () => {
        const response = await axios.get(
            `https://stock-proxy-uyy2ythogq-de.a.run.app/yahoo/v8/finance/chart/${stockID}`,
            {
                params: {
                    symbol: stockID,
                    period1: parseInt(new Date().getTime() / 1000) - 315532800,
                    period2: parseInt(new Date().getTime() / 1000),
                    interval: kLineType.name,
                    includePrePost: true,
                    lang: 'zh-TW'
                }
            }
        );
        let chart = response.data.chart.result['0'];
        let data = []
        for (let i = 0; i < chart.timestamp.length; i++) {
            if (chart.indicators.quote['0'].open[i] !== 0) {
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
        setDataSet(data)
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
        chart.current?.createIndicator('MA', false, { id: 'candle_pane' })
        chart.current?.createIndicator('VOL', false, { height: 100 })
        chart.current?.setStyles({
            candle: {
                bar: {
                    upColor: '#F92855',
                    downColor: '#2DC08E',
                    noChangeColor: '#888888',
                    upBorderColor: '#F92855',
                    downBorderColor: '#2DC08E',
                    noChangeBorderColor: '#888888',
                    upWickColor: '#F92855',
                    downWickColor: '#2DC08E',
                    noChangeWickColor: '#888888'
                },
                tooltip: {
                    showRule: 'follow_cross',
                    showType: 'rect'
                }
            },
            yAxis: {
                inside: true,
            },
            indicator: {
                tooltip: {
                    showRule: 'follow_cross',
                    showType: 'rect'
                }
            }
        })
        return () => { dispose('technical-indicator-k-line') }
    }, [])

    useEffect(() => {
        getStockPrice();
    }, [stockID, kLineType])

    useEffect(() => {
        chart.current?.applyNewData(dataSet)
    }, [dataSet])

    return (
        <Layout stockInfo={stockInfo}>
            <Stack spacing={2} direction="row">
                {
                    intervalList.map((item) => (
                        <Button
                            variant="text"
                            color={item === kLineType ? 'primary' : 'inherit'}
                            onClick={() => setKLineType(item)}
                        >
                            {item.text}
                        </Button>
                    ))
                }
            </Stack>
            <div id="technical-indicator-k-line" style={{ width: '100%', height: '400px' }} />
        </Layout>
    )
}