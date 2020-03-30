import React, {Component, Fragment} from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Helpers from '../Helpers';
import '../styles/Graph.scss';
import Fullscreen from "react-full-screen";
import { Dropdown, Grid, Button, Container, Menu, Icon} from 'semantic-ui-react';

export default class Graph extends Component {
    constructor(props){
        super(props);
        this.helper = new Helpers();
        this.state = {
            chartOptions: this.helper.getBasicChartConfig(),
            countries: [],
            dataTypes: [],
            log: false,
            days: false,
            i: 0,
            isFull: false,
        }
    }

    countryEntries(){
        let elemList = [];
        Object.keys(window.data).sort((a,b)=>{
            let countA = window.data[a][window.data[a].length - 1].confirmed;
            let countB = window.data[b][window.data[b].length - 1].confirmed;
            return countB - countA;
        }).forEach((name)=>{
            elemList.push({text: name, value: name});
        });
        return elemList;
    }

    dataTypeEntries(){
        let elemList = [];
        Object.keys(this.helper.dataTypesDict).forEach((name) => {
            elemList.push(
                {text: name, value: name}
            ); 
        });
        return elemList;
    }

    updateYAxis(){
        let yAxisType = this.logCheckbox.checked ? 'logarithmic' : 'linear';
        let newYaxisSettings = this.helper.getBasicAxis();
        newYaxisSettings.type = yAxisType;
        this.chart.chart.yAxis[0].update(newYaxisSettings);
    }

    componentDidMount(){
        this.runFromQuery();
    }

    onSubmit(){
        try {
            let countriesSkipped = [];
            this.state.countries.forEach((country)=>{
                this.state.dataTypes.forEach((dataType)=>{
                    let seriesInput = {
                        country,
                        xAxis: this.state.xAxis,
                        dataType,
                    }
                    let seriesConfig = this.helper.getSeriesForChart(seriesInput);
                    if(seriesConfig.data && seriesConfig.data.length){
                        this.chart.chart.addSeries(seriesConfig, false);
                    } else {
                        countriesSkipped.push(country);
                    }
                });
            });
            this.chart.chart.redraw();
            if(countriesSkipped.length){
                alert(`${countriesSkipped.join(', ')} ${countriesSkipped.length === 1 ? 'does' : 'do'} not have enough data for given settings.`)
            }
        } catch (error) {
            console.error(error);
            alert('Oops! something went wrong.');
        }
    }

    clearForm(){
        this.setState({countries: [], xAxis: undefined, dataTypes: []});
        this.countriesDropdown.clearValue();
        this.dataTypeDropdown.clearValue();
        this.xAxisDropdown.clearValue();
    }

    onClear(){
        this.setState({i: this.state.i + 1});
        this.clearForm();
    }

    yAxisUpdate(log){
        this.setState({log},()=>{
            this.chart.chart.yAxis[0].update({type: this.state.log ? 'logarithmic' : 'linear'});
        });
    }

    onFull = ()=>{
        this.setState({isFull: true}, ()=>{
            if(this.helper.isMobile())
                window.screen.orientation.lock('landscape');
            this.chart.chart.reflow()
        });
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
                        if(query[1] && Object.keys(this.helper.dataTypesDict).includes(query)){
                            defaultConfig.dataType = query[1];
                        }
                        if(query[2] === 'Since First 100 Cases'){
                            defaultConfig.xAxis = 1;
                        }
                        let seriesConfig = this.helper.getSeriesForChart(defaultConfig);
                        if(seriesConfig.data && seriesConfig.data.length){
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
            <Fragment>
                <Container>
                    <Grid stackable columns='equal'>
                        <Grid.Row>
                            <Grid.Column>
                                <Dropdown ref={(a)=>{this.countriesDropdown = a}} 
                                            onChange={(_e, {value})=>{this.setState({countries: value})}}
                                            options={this.countryEntries()} multiple search
                                            selection closeOnChange clearable fluid placeholder="Countries"/>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={12}>
                                <Dropdown onChange={(_e, {value})=>{this.setState({dataTypes: value});}}
                                            ref={(a)=>{this.dataTypeDropdown = a}}
                                            options={this.dataTypeEntries()} multiple search
                                            selection closeOnChange clearable fluid placeholder="Data Types"/>
                            </Grid.Column>
                            <Grid.Column>
                                <Dropdown onChange={(_e, {value})=>{this.setState({xAxis: value})}}
                                            ref={(a)=>{this.xAxisDropdown = a}}
                                            options={[{text: 'Days Since First 100 Cases', value: 0},
                                                    {text: 'Date', value: 1}]} selection fluid
                                                    placeholder="X-Axis"/>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <Button primary fluid onClick={()=>this.onSubmit()}>Add Graph</Button>
                            </Grid.Column>
                            <Grid.Column>
                                <Button basic color='red' fluid onClick={()=>this.onClear()}>Clear Graph</Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    <Menu tabular attached="top">
                        <Menu.Item
                            name='Linear Scale'
                            active={!this.state.log}
                            onClick={()=>this.yAxisUpdate(false)}
                        />
                        <Menu.Item
                            name='Log Scale'
                            active={this.state.log}
                            onClick={()=>this.yAxisUpdate(true)}
                        />
                        <Menu.Menu position='right'>
                            <Menu.Item onClick={this.onFull}>
                                <Icon name="expand arrows alternate"></Icon>
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                    <Fullscreen enabled={this.state.isFull}
                                onChange={(isFull)=>{this.setState({isFull}, this.chart.chart.reflow())}}>
                        <HighchartsReact highchrats={Highcharts}
                                        options={this.state.chartOptions}
                                        ref={(chart)=>{this.chart = chart}} key={this.state.i}
                                        containerProps={{className: 'main-chart-container'}}
                        />
                    </Fullscreen>
                </Container>
           </Fragment>
        );
    }
}