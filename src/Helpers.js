export default class Helpers {
    
    constructor(){
        this.tzOffset = (new Date()).getTimezoneOffset() * 60 * 1000;
        this.dataTypesDict = {
            'Total Cases': 'confirmed',
            'Deaths': 'deaths',
            'Recovered': 'recovered',
            'Daily Cases': 'confirmed:diff:nonNegative',
            'Active Cases': 'active',
            'Daily Recoveries': 'recovered:diff:nonNegative',
            'Daily Deaths': 'deaths:diff:nonNegative'
        }
    }

    isMobile(){
        return (typeof window.orientation !== "undefined");
    }

    getSeries(country, key){
        let series = [];
        let operations;
        [key, operations] = [key.split(':')[0], key.split(':').slice(1)];
        for(let value of window.data[country]){
            let timestamp = Date.parse(value.date) - this.tzOffset;
            if(value[key]){
                series.push([timestamp, value[key]]);
            } else if(key === 'active'){
                let total = value.confirmed;
                let closed = value.recovered + value.deaths;
                let active = total - closed;
                series.push([timestamp, active]);
            }
        }
        for(let operation of operations){
            series = this.applySeriesOp(series, operation);
        }
        return series;
    }

    getBasicAxis(title){
        return {
            title: {
                text: title,
            },
            lineWidth: 1,
            showEmpty: false,
            allowDecimals: false
        }
    }

    getBasicChartConfig(title){
        return {
            xAxis: [
                {   
                    type: 'datetime',
                    ...this.getBasicAxis('Date')
                },
                this.getBasicAxis('Days Since First 100 cases')
            ],
            credits: {
                enabled: false
            },
            chart: this.isMobile() ? {
                animation: false
            } : {
                animation: false
            },
            yAxis: [
                this.getBasicAxis()
            ],
            title: {
                text: title
            },
            plotOptions:{
                series: {
                    marker: {
                        symbol: 'circle'
                    }
                }
            },
            tooltip:{
                shared: true
            }
        }
    }

    applySeriesOp(series, operation){
        let newSeries = []
        if(series.length){
            switch (operation){
                default:
                    newSeries = series;
                    break;

                case 'diff':
                    for(let i=0; i < series.length; i++){
                        let diff = i===0 ? series[i][1] : series[i][1] - series[i - 1][1]; // i = 0 is first case
                        let timestamp = series[i][0]
                        newSeries.push([timestamp, diff]);
                    }
                    break;

                case 'ratio':
                    for(let i=1; i < series.length; i++){
                        let ratio = series[i][1]/series[i-1][1]; // i = 0 is first case
                        let timestamp = series[i][0]
                        newSeries.push([timestamp, ratio]);
                    }
                    break;
                case 'xToDayCount':
                    for(let i=0; i < series.length; i++){
                        newSeries.push([i,series[i][1]]);
                    }
                    break;
                case 'nonNegative':
                    for(let i=0; i < series.length; i++){
                        if(series[i][1] >= 0){
                            newSeries.push(series[i]);
                        }
                    }
                    break;
            }
        }
        return newSeries;
    }

    dataSinceNCases(series, country, n=100){
        let cases = this.getSeries(country, 'confirmed');
        let start = -1;
        for(let i=0; i < cases.length; i++){
            if(cases[i][1] >= n){
                start = i;
                break;
            }
        }
        if(start === -1){
            return []
        }
        let newSeries = [];
        let refCases = cases.slice(start);
        if(refCases.length && refCases[0][0] < series[0][0]){
            for(let i=0; refCases[i][0] >= series[0][0]; i++){
                newSeries.push([refCases[i][0], 0])
            }
        }
        for(let i=0; i < series.length; i++){
            if(series[i][0] >= refCases[0][0]){
                newSeries.push(series[i]);
            }
        }
        return newSeries;
    }

    getSeriesForChart(inp){
        let series = this.getSeries(inp.country, this.dataTypesDict[inp.dataType]);
        if(inp.xAxis === 1){
            series = this.dataSinceNCases(series, inp.country);
            series = this.applySeriesOp(series, 'xToDayCount')
        }
        return {
            name: `${inp.country} - ${inp.dataType} - ${inp.xAxis ? 'Since First 100 Cases': 'Date Wise'}`,
            data: series,
            xAxis: inp.xAxis
        }
    }

}