import React, { useEffect, useState, useRef } from 'react'
import Highcharts from 'highcharts/highstock'
import HighchartsReact from 'highcharts-react-official'
import moment from 'moment-timezone';
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)

export default function TechnicalIndicatorKLineChart(props) {
    const { dataset, seriesName } = props;
    const [chartConfig, setChartConfig] = useState(null);
    const chartRef = useRef();

    useEffect(() => {
        let ohlc = []
        let volume = []
        let dataLength = dataset.length
        let groupingUnits = [[
            'week',             // unit name
            [1]               // allowed multiples
        ], [
            'month',
            [1, 2, 3, 4, 6]
        ]]
        for (let i = 0; i < dataLength; i += 1) {
            ohlc.push([
                dataset[i][0], // the date
                dataset[i][1], // open
                dataset[i][2], // high
                dataset[i][3], // low
                dataset[i][4] // close
            ]);

            volume.push([
                dataset[i][0], // the date
                dataset[i][5] // the volume
            ]);
        }
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
            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'OHLC'
                },
                height: '60%',
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '65%',
                height: '35%',
                offset: 0,
                lineWidth: 2
            }],
            tooltip: {
                split: true
            },
            series: [{
                type: 'candlestick',
                name: seriesName,
                data: ohlc,
                tooltip: {
                    valueDecimals: 2
                },
                dataGrouping: {
                    units: groupingUnits
                }
            }, {
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                dataGrouping: {
                    units: groupingUnits
                }
            }]
        })
    }, [])

    useEffect(() => {
        let ohlc = []
        let volume = []
        let dataLength = dataset.length
        let groupingUnits = [[
            'week',             // unit name
            [1]               // allowed multiples
        ], [
            'month',
            [1, 2, 3, 4, 6]
        ]]
        for (let i = 0; i < dataLength; i += 1) {
            ohlc.push([
                dataset[i][0], // the date
                dataset[i][1], // open
                dataset[i][2], // high
                dataset[i][3], // low
                dataset[i][4] // close
            ]);

            volume.push([
                dataset[i][0], // the date
                dataset[i][5] // the volume
            ]);
        }
        let updateObject = {
            title: {
                text: seriesName
            },
            series: [{
                type: 'candlestick',
                name: seriesName,
                data: ohlc,
                tooltip: {
                    valueDecimals: 2
                },
                dataGrouping: {
                    units: groupingUnits
                }
            }, {
                type: 'column',
                name: 'Volume',
                data: volume,
                yAxis: 1,
                dataGrouping: {
                    units: groupingUnits
                }
            }]
        }
        setChartConfig(chartConfig => ({
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
