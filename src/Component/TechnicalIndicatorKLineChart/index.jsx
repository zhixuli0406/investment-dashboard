import React, { useEffect, useState } from 'react'
import { init, dispose } from 'klinecharts'
import Layout from '../../Layout/ChartLayout/index'

const mainTechnicalIndicatorTypes = ['MA', 'EMA', 'SAR']
const subTechnicalIndicatorTypes = ['VOL', 'MACD', 'KDJ']

export default function TechnicalIndicatorKLineChart(props) {
    const { dataset, seriesName } = props
    const [kLineChart, setKLineChart] = useState(null);
    const mainTechnicalIndicatorTypes = ["MA", "EMA", "SAR"];
    const subTechnicalIndicatorTypes = ["VOL", "MACD", "KDJ"];
    useEffect(() => {
        let kLine = init('technical-indicator-k-line')
        setKLineChart(kLine)
        kLine.applyNewData(dataset)
        return () => {
            dispose('technical-indicator-k-line')
        }
    }, [])
    useEffect(() => {
        if (kLineChart)
            kLineChart.applyNewData(dataset)
    }, [dataset])
    return (
        <Layout
            title={seriesName}>
            <div id="technical-indicator-k-line" className="k-line-chart" style={{ width: '100%', height: '600px' }} />
        </Layout>
    )
}
