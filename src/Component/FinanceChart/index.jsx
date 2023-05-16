import React, { useEffect, useState, useRef } from 'react'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import moment from 'moment-timezone';
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)

export default function FinanceChart(props) {
    const { dataset, seriesName } = props;
    const [chartConfig, setChartConfig] = useState(null);
    const chartRef = useRef();

    useEffect(() => {
        Highcharts.setOptions({
            time: {
                /**
                 * Use moment-timezone.js to return the timezone offset for individual
                 * timestamps, used in the X axis labels and the tooltip header.
                 */
                getTimezoneOffset: function (timestamp) {
                    var zone = 'Asia/Taipei',
                        timezoneOffset = -moment.tz(timestamp, zone).utcOffset();

                    return timezoneOffset;
                }
            }
        });
        setChartConfig({
            rangeSelector: {
                selected: 1
            },
            title: {
                text: seriesName
            },
            series: [{
                name: seriesName,
                data: dataset,
                tooltip: {
                    valueDecimals: 2
                },
                type: 'line'
            }]
        })
    }, [])

    useEffect(() => {
        let updateObject = {
            title: {
                text: seriesName
            },
            series: [{
                name: seriesName,
                data: dataset
            }]
        }
        setChartConfig(chartConfig=>({
            ...chartConfig,
            ...updateObject
        }))
    }, [dataset, seriesName])

    return (
        <HighchartsReact
            highcharts={Highcharts}
            constructorType='stockChart'
            options={chartConfig}
            ref={chartRef}
        />
    )
}
