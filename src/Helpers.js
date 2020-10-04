export default class Helpers {
    constructor() {
        this.tzOffset = new Date().getTimezoneOffset() * 60 * 1000
        this.dataTypesDict = {
            'Total Cases': 'confirmed',
            Deaths: 'deaths',
            Recovered: 'recovered',
            'Daily Cases': 'new_confirmed',
            'Active Cases': 'active',
            'Daily Recoveries': 'new_recovered',
            'Daily Deaths': 'new_deaths'
        }
        this.cache = {}
    }

    async fetchData(country) {
        if (country === 'World')
            return {
                code: 'World',
                name: 'World',
                latest_data: window.worldData[0],
                timeline: window.worldData
            }
        else {
            if (!this.cache[country] || this.cache[country].failed) {
                this.cache[country] = fetch('https://corona-api.com/countries/' + country)
                    .then(data => data.json())
                    .then(data => data.data)
                    .catch(() => this.cache[country].failed = true)
            }
            return this.cache[country]
        }
    }

    isMobile() {
        return typeof window.orientation !== 'undefined'
    }

    async getSeries(country, key, xAxis) {
        let apiData = await this.fetchData(country)
        let series = []
        let data = apiData.timeline.filter((value) => !value.is_in_progress).reverse()
        if ([1, 2].includes(xAxis)) {
            data = data.filter((value) => {
                return value.confirmed >= 100
            })
        }
        for (let i = 0; i < data.length; i++) {
            let value = data[i]
            let xVal
            if (xAxis === 2) {
                xVal = value.confirmed
            } else if (xAxis === 1) {
                xVal = i
            } else {
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
                text: title
            },
            lineWidth: 1,
            showEmpty: false,
            allowDecimals: false
        }
    }

    getBasicChartConfig(title) {
        return {
            xAxis: [
                {
                    type: 'datetime',
                    ...this.getBasicAxis('Date')
                },
                this.getBasicAxis('Days Since First 100 cases'),
                {
                    type: 'logarithmic',
                    ...this.getBasicAxis('Total Cases Since First 100 Cases (Log Scale)')
                }
            ],
            credits: {
                enabled: false
            },
            chart: {
                animation: false
            },
            yAxis: [this.getBasicAxis()],
            title: {
                text: title
            },
            plotOptions: {
                series: {
                    marker: {
                        symbol: 'circle',
                        enabled: false
                    }
                }
            },
            tooltip: {
                shared: true
            }
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
        let series = await this.getSeries(inp.country, this.dataTypesDict[inp.dataType], inp.xAxis)
        if (inp.movingAverage) {
            series = this.movingAverage(series)
        }
        return {
            name: `${inp.country} - ${inp.dataType}${
                inp.movingAverage ? ' - One Week Moving Average' : ''
            }`,
            data: series,
            xAxis: inp.xAxis
        }
    }
}

export function isMobile() {
    return typeof window.orientation !== 'undefined'
}
