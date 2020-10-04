import React, { useState, useEffect, useRef } from 'react'
import Highcharts from 'highcharts/highmaps.src'
import map from '@highcharts/map-collection/custom/world-highres.geo.json'
import '../styles/Graph.scss'
import Fullscreen from 'react-full-screen'
import { Menu, Icon, Dropdown } from 'semantic-ui-react'
import { isMobile } from '../Helpers'

const getDataArray = (type) => {
    let dataArray = window.countryData
        .map((data) => {
            if (data.code === 'World') return
            let value
            switch (type) {
                case 'confirmed':
                case 'recovered':
                case 'deaths':
                    value = data.latest_data[type]
                    break
                default:
                    value = data.latest_data.confirmed
                    break
            }
            return { code: data.code, value: value || null }
        })
        .filter((data) => data)
    return dataArray
}

const labelMap = {
    confirmed: 'Total Cases',
    deaths: 'Deaths',
    recovered: 'Recovered'
}

const colorMap = {
    confirmed: {
        minColor: '#FFFFFF',
        maxColor: '#1B4F72'
    },
    deaths: {
        minColor: '#FFFFFF',
        maxColor: '#78281F'
    },
    recovered: {
        minColor: '#FFFFFF',
        maxColor: '#28B463'
    }
}

const getChartOptions = (callback) => {
    return {
        chart: { map },
        credits: {
            enabled: false
        },
        title: {
            text: labelMap.confirmed
        },
        plotOptions: {
            series: {
                point: {
                    events: {
                        click: function () {
                            if (callback.click instanceof Function)
                                callback.click.call(this, ...arguments)
                        }
                    }
                },
                joinBy: ['iso-a2', 'code']
            }
        },

        colorAxis: {
            type: 'logarithmic',
            labels: { overflow: 'allow' },
            ...colorMap.confirmed
        },

        series: [
            {
                data: getDataArray(),
                name: labelMap.confirmed
            }
        ]
    }
}

export default function Map() {
    const callback = useRef({})
    const [type, setType] = useState('confirmed')
    const [isFull, setIsFull] = useState(false)
    const chartRef = useRef()
    const containerRef = useRef()
    const chart = chartRef.current
    useEffect(() => {
        chartRef.current = Highcharts.mapChart(containerRef.current, getChartOptions(callback))
    }, [])
    useEffect(() => {
        if (chart) {
            if (isMobile()) window.screen.orientation.lock('landscape')
            chart.reflow()
        }
    }, [isFull])
    useEffect(() => {
        if (chart) {
            chart.update(
                {
                    series: [{ data: getDataArray(type), name: labelMap[type] }],
                    title: { text: labelMap[type] },
                    colorAxis: {
                        ...colorMap[type]
                    }
                },
                true,
                true
            )
        }
    }, [type])
    return (
        <>
            <Dropdown
                onChange={(_e, { value }) => setType(value)}
                options={[
                    { text: 'Total Cases', value: 'confirmed' },
                    { text: 'Deaths', value: 'deaths' },
                    { text: 'Recovered', value: 'recovered' }
                ]}
                selection
                fluid
                placeholder='Data Type'
            />
            <Menu tabular attached='top'>
                <Menu.Menu position='right'>
                    <Menu.Item onClick={() => setIsFull(true)} fitted>
                        <Icon name='expand arrows alternate' />
                    </Menu.Item>
                </Menu.Menu>
            </Menu>
            <Fullscreen enabled={isFull} onChange={(isFull) => setIsFull(isFull)}>
                <div className='main-chart-container' ref={containerRef}></div>
            </Fullscreen>
        </>
    )
}
