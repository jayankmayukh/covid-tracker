import React, { Component, Fragment } from "react";
import Helpers from '../Helpers';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default class Home extends Component {
    constructor(props){
        super(props);
        this.state = {
            graphs: [],
            charts: []
        }
        this.helper = new Helpers();
    }

    init(){
        let graphs = [];
        let charts = [];
        let country = 'World';
        if(window.location.search){
            let query = new URLSearchParams(window.location.search);
            country = query.get('country');
        }
        if(Object.keys(window.data).includes(country)){
            Object.keys(this.helper.dataTypesDict).forEach((name, i)=>{
                let chartConfig = this.helper.getBasicChartConfig(`${country} - ${name}`);
                chartConfig.series = [this.helper.getSeriesForChart({country, dataType: name, xAxis: 0})];
                graphs.push(
                    <div className="chart-container" key={i}>
                        <HighchartsReact highcharts={Highcharts}
                                        options={chartConfig}
                                        ref={(inp)=>{charts.push(inp)}}
                        />
                    </div>
                    );
            });
        }
        this.setState({graphs, charts, country});
    }

    componentDidMount(){
        this.init();
    }

    render(){
        return (
            <div className="summary">
                <div className="charts">
                    {this.state.graphs}
                </div>
            </div>
        )
    }
}