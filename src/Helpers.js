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

    async fetchData(country, key, xAxis) {
        const cacheKey = country + key + xAxis
        if (!this.cache[cacheKey] || this.cache[cacheKey].failed) {
            this.cache[cacheKey] = fetch(`https://covid-api.jynk.xyz/.netlify/functions/timeseries?country=${country}&key=${key}&xAxis=${xAxis}`)
                .then((data) => data.json())
                .catch(() => (this.cache[cacheKey].failed = true))
        }
        return this.cache[cacheKey]
    }

    isMobile() {
        return typeof window.orientation !== 'undefined'
    }

    async getSeries(country, key, xAxis) {
        let series = await this.fetchData(country, key, xAxis)
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

    async getSeriesForChart(inp) {
        let series = await this.getSeries(inp.country, inp.dataType, inp.xAxis)
        return {
            name: `${inp.country} - ${this.dataTypesDict[inp.dataType]}`,
            data: series,
            xAxis: inp.xAxis,
        }
    }
}

export function isMobile() {
    return typeof window.orientation !== 'undefined'
}
