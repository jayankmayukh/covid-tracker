import React, {Component} from 'react';
import AutoComplete from 'react-autocomplete';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Helpers from '../Helpers';

export default class Graph extends Component {
    constructor(props){
        super(props);
        this.helperInterface = new Helpers();
        this.state = {
            chartOptions: this.helperInterface.getBasicChartConfig('Covid-19 Data Tracker'),
            country: '',
            i: 0
        }
        this.onSubmit = this.onSubmit.bind(this);
        this.onClear = this.onClear.bind(this);
    }

    itemsForAutocomplete(){
        let items = [];
        Object.keys(window.data).forEach((value)=>{
            items.push({id: value, label: value});
        });
        return items;
    }

    dataTypeSelectEntries(){
        let elemList = [];
        Object.keys(this.helperInterface.dataTypesDict).forEach((name, i) => {
            elemList.push(
                <option key={i} value={name}>{name}</option>
            ); 
        });
        return elemList;
    }

    updateYAxis(){
        let yAxisType = this.logCheckbox.checked ? 'logarithmic' : 'linear';
        let newYaxisSettings = this.helperInterface.getBasicAxis();
        newYaxisSettings.type = yAxisType;
        this.chart.chart.yAxis[0].update(newYaxisSettings);
    }

    componentDidMount(){
        this.runFromQuery();
    }

    onSubmit(){
        try {
            let seriesInput = {
                country: this.state.country,
                xAxis: this.daysCheckbox.checked ? 1 : 0,
                dataType: this.dataTypeSelect.value
            }
            if(!Object.keys(window.data).includes(this.state.country)){
                alert('Please select country from suggestions.');
                return;
            }
            let seriesConfig = this.helperInterface.getSeriesForChart(seriesInput);
            if(seriesConfig.data && seriesConfig.data.length){
                this.chartContainer.style = {display: 'block'}
                this.chart.chart.addSeries(seriesConfig);
                let points = 0
                for(let i=0; i < this.chart.chart.series.length; i++){
                    points += this.chart.chart.series[i].data.length;
                }
                if(points > 100){
                    this.chart.chart.update({chart: {animation: false}});
                }
            } else {
                alert('Sorry! There is not enough data to create this graph.')
            }
        } catch (error) {
            console.error(error);
            alert('Oops! something went wrong.');
        }
    }

    onClear(){
        try {
            this.setState({i: this.state.i + 1})
        } catch (error) {
            console.error(error);
            alert('Oops! something went wrong.');
        }
    }

    runFromQuery(){
        if(window.location.search){
            let query = new URLSearchParams(window.location.search);
            query.forEach((query, key)=>{
                query = query.split('_');
                try{
                    if(key === 'title'){
                        let title = query.join(' ');
                        this.chart.chart.title.update({text: title})
                        return;
                    }
                    if(query[0] && Object.keys(window.data).includes(query[0])){
                        let defaultConfig = {
                            country: query[0],
                            xAxis: 0,
                            dataType: 'Total Cases'
                        }
                        query.forEach((value, i)=>{
                            query[i] = value.split('-').join(' ');
                        });
                        if(query[1] && Object.keys(this.helperInterface.dataTypesDict).includes(query)){
                            defaultConfig.dataType = query[1];
                        }
                        if(query[2] === 'Since First 100 Cases'){
                            defaultConfig.xAxis = 1;
                        }
                        let seriesConfig = this.helperInterface.getSeriesForChart(defaultConfig);
                        if(seriesConfig.data && seriesConfig.data.length){
                            this.chartContainer.style = {display: 'block'}
                            this.chart.chart.addSeries(seriesConfig);
                        }
                    }
                } catch(error) {
                    console.error(error);
                }
            });
        }
    }

    render(){
        return (
            <div className="main-graph-tool-comtainer">
                <div className="controls" ref={(inp)=>this.controls = inp}>
                    <div className="country control-input">
                        Country: <br/>
                        <AutoComplete
                            items={this.itemsForAutocomplete()}
                            shouldItemRender={(item, value) => {
                                return item.label.toLowerCase().indexOf(value.toLowerCase()) === 0;
                            }}
                            menuStyle={
                                {
                                    borderRadius: '3px',
                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    padding: '2px 0',
                                    fontSize: '90%',
                                    position: 'fixed',
                                    overflow: 'auto',
                                    maxHeight: '50%',
                                    zIndex: 10
                                }
                            }
                            getItemValue={item => item.label}
                            renderItem={(item, highlighted) =>{
                                    return <div key={item.id}
                                                style={{ backgroundColor: highlighted ? '#eee' : 'white'}}>
                                                {item.label} </div>
                                }
                            }
                            value={this.state.country}
                            onChange={e => this.setState({ country: e.target.value })}
                            onSelect={value => this.setState({ country: value })}
                        />
                    </div>
                    <div className="x-axis-type control-input">
                        X-Axis: <br/>
                        <input type='checkbox' className="switch"
                               ref={(inp)=>{this.daysCheckbox = inp;}} 
                               onClick={(e)=>{this.dateCheckbox.checked = !this.daysCheckbox.checked;}}
                               defaultChecked/> 
                        <label>Days Since First 100 cases</label> <br/>
                        <input type='checkbox' className="switch"
                               ref={(inp)=>{this.dateCheckbox = inp;}}
                               onClick={(e)=>{this.daysCheckbox.checked = !this.dateCheckbox.checked}}/>
                        <label>Date</label>
                    </div>
                    <div className="y-axis-type control-input">
                        Y-Axis: <br/>
                        <input type='checkbox' className="switch"
                               ref={(inp)=>{this.logCheckbox = inp}} 
                               onClick={(e)=>{
                                   this.linearCheckbox.checked = !this.logCheckbox.checked;
                                   this.updateYAxis();
                               }}/> 
                        <label>Logarithmic</label> <br/>
                        <input type='checkbox' className="switch"
                               ref={(inp)=>{this.linearCheckbox = inp;}}
                               onClick={(e)=>{
                                   this.logCheckbox.checked = !this.linearCheckbox.checked;
                                   this.updateYAxis();
                               }}
                               defaultChecked/>
                        <label>Linear</label>
                    </div>
                    <div className="datatype control-input">
                        Data type: <br/>
                        <select ref={(inp)=>{this.dataTypeSelect = inp}} className="dropdown">
                            {this.dataTypeSelectEntries()}
                        </select>
                    </div>
                    <div className="submit control-input">
                        <button onClick={this.onSubmit}>Add Graph</button> <br/>
                        <button onClick={this.onClear}>Clear Graph</button>
                    </div>
                </div>
                <div className="main-chart-container" style={{display: "none"}} ref={(inp)=>{this.chartContainer = inp;}}>
                    <HighchartsReact highchrats={Highcharts}
                                     options={this.state.chartOptions}
                                     ref={(chart)=>{this.chart = chart}} key={this.state.i}/>
                </div>
            </div>
        );
    }
}