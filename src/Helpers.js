export default class Helpers {
    constructor() {
        this.tzOffset = new Date().getTimezoneOffset() * 60 * 1000
        this.cache = {}
        this.getDataTypesDict([])
    }

    getReadableName(name) {
        return name.split('_').map(part => {
            let _part = part[0].toUpperCase() + part.slice(1)
            return _part
        }).join(' ')
    }

    getDataTypesDict(countries) {
        const types = {}
        if (!countries.length) {
            Object.keys(window.meta.timeseries).forEach((k) => (types[k] = this.getReadableName(k)))
        }
        countries.forEach((country, i) => {
            if (i === 0) {
                window.meta.countries[country].timeseries.forEach((ts) => {
                    types[ts] = this.getReadableName(ts)
                })
            } else {
                Object.keys(types).forEach((type) => {
                    if (!window.meta.countries[country].timeseries.includes(type)) {
                        delete types[type]
                    }
                })
            }
        })
        this.dataTypesDict = types
        return types
    }

    async fetchData(country) {
        const cacheKey = country
        if (!this.cache[cacheKey] || this.cache[cacheKey].failed) {
            this.cache[cacheKey] = fetch(`.netlify/functions/timeseries?country=${country}`)
                .then((data) => data.json())
                .catch(() => (this.cache[cacheKey].failed = true))
        }
        return this.cache[cacheKey]
    }

    isMobile() {
        return typeof window.orientation !== 'undefined'
    }

    async getSeries(country, key, xAxis) {
        let apiData = await this.fetchData(country)
        let series = []
        let data = apiData
        if ([1, 2].includes(xAxis)) {
            data = data.filter((value) => {
                return value.total_cases >= 100
            })
        }
        if ([3].includes(xAxis)) {
            data = data.filter((value) => {
                return value.total_vaccinations >= 1
            })
        }
        for (let i = 0; i < data.length; i++) {
            let value = data[i]
            let xVal
            if (xAxis === 2) {
                xVal = value.total_cases
            } else if (xAxis === 1) {
                xVal = i
            } else if (xAxis) {
                xVal = i
            }else {
                xVal = Date.parse(value.date) - this.tzOffset
            }
            if (value[key]) {
                series.push([xVal, value[key]])
            }
        }
        return series
    }

    getBasicAxis(title) {
        return {
            title: {
                text: title,
            },
            lineWidth: 1,
            showEmpty: false,
            allowDecimals: false,
        }
    }

    getBasicChartConfig(title) {
        return {
            xAxis: [
                {
                    type: 'datetime',
                    ...this.getBasicAxis('Date'),
                },
                this.getBasicAxis('Days Since First 100 cases'),
                {
                    type: 'logarithmic',
                    ...this.getBasicAxis('Total Cases Since First 100 Cases (Log Scale)'),
                },
                this.getBasicAxis('Days Since Vaccination Started')
            ],
            credits: {
                text: 'Source: Our World In Data',
                href: 'https://github.com/owid/covid-19-data/tree/master/public/data#license',
            },
            chart: {
                animation: false,
            },
            yAxis: [this.getBasicAxis()],
            title: {
                text: title,
            },
            plotOptions: {
                series: {
                    marker: {
                        symbol: 'circle',
                        enabled: false,
                    },
                },
            },
            tooltip: {
                shared: true,
            },
        }
    }

    movingAverage(series) {
        let newSeries = []
        let sum = 0
        let N = 7
        for (let i = 0; i < series.length; i++) {
            sum += series[i][1]
            if (series[i - N]) {
                sum -= series[i - N][1]
            }
            if (i >= N - 1) {
                let avg = Math.round(sum / N)
                newSeries.push([series[i][0], avg])
            }
        }
        return newSeries
    }

    async getSeriesForChart(inp) {
        let series = await this.getSeries(inp.country, inp.dataType, inp.xAxis)
        if (inp.movingAverage) {
            series = this.movingAverage(series)
        }
        return {
            name: `${inp.country} - ${this.dataTypesDict[inp.dataType]}${
                inp.movingAverage ? ' - 7DMA' : ''
            }`,
            data: series,
            xAxis: inp.xAxis,
        }
    }
}

export function isMobile() {
    return typeof window.orientation !== 'undefined'
}
