import React, { useEffect, useState, useRef } from 'react'
import { init, dispose, registerLocale } from 'klinecharts'
import Layout from '../../Layout/ChartLayout/index'

export default function TechnicalIndicatorKLineChart(props) {
    const { dataset, seriesName } = props
    const chart = useRef()

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
        chart.current?.createIndicator('KDJ', false, { height: 80 })
        chart.current?.applyNewData(dataset)
        return () => { dispose('technical-indicator-k-line') }
    }, [])

    useEffect(() => {
        chart.current?.applyNewData(dataset)
    }, [dataset])

    return (
        <Layout
            title={seriesName}>
            <div id="technical-indicator-k-line" style={{ width: '100%', height: '600px' }} />
        </Layout>
    )
}
