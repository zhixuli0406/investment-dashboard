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
            `http://122.117.135.211:8080/stock/historical/candles`,
            {
                params: {
                    symbol: stockID.split('.')[0]
                }
            }
        );
        let chart = response.data;
        let data = []
        for (let i = 0; i < chart.length; i++) {
            let dateString = chart[i].date;
            var year = dateString.substring(0, 4);
            var month = dateString.substring(4, 6);
            var day = dateString.substring(6, 8);
            var date = new Date(year, month - 1, day);
            data.push({
                timestamp: date.getTime(),
                open: chart[i].openPrice,
                close: chart[i].closePrice,
                high: chart[i].highPrice,
                low: chart[i].lowPrice,
                volume: chart[i].tradeVolume,
                turnover: chart[i].tradeValue
            })
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
            volume: '成交量：',
            turnover: '成交額：'
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