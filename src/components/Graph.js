import React, {Component, Fragment} from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Helpers from '../Helpers';
import '../styles/Graph.scss';
import Fullscreen from "react-full-screen";
import { Dropdown, Grid, Button, Menu, Icon, Checkbox, Popup, Loader, Transition} from 'semantic-ui-react';

export default class Graph extends Component {
    constructor(props){
        super(props);
        this.helper = new Helpers();
        this.state = {
            chartOptions: this.helper.getBasicChartConfig(),
            countries: [],
            dataTypes: [],
            log: false,
            i: 0,
            isFull: false,
            sharing: false,
            countryEntries: [],
            dataTypeEntries: [],
            formOpen: true
        };
        this.plotted = [];
        this.xAxisDropdownList = [
            {text: 'Days Since First 100 Cases', value: 1},
            {text: 'Date', value: 0},
            {text: 'Total Cases (Log Scale) Since First 100 cases', value: 2}
        ];
    }

    shareIcon = ()=>{
        let baseIcon = (
            <Menu.Item onClick={this.share} fitted>
                {this.state.sharing ? <Loader active inline size="small"/> : <Icon name="share alternate"/>}
            </Menu.Item>
        );
        if(window.navigator.share){
            return baseIcon;
        } else if(window.navigator.clipboard){
            return <Popup content='Link has been copied!' basic  on="click" trigger={baseIcon}/>
        } else{
            return null;
        }
    }

    countryEntries(){
        let elemList = [];
        window.countryData.filter((itrData)=>{
            return itrData.timeline && itrData.timeline.length > 1;
        }).sort((a,b)=>{
            let countA = a.timeline[0].confirmed;
            let countB = b.timeline[0].confirmed;
            return countB - countA;
        }).forEach((itrData)=>{
            elemList.push({text: itrData.name, value: itrData.code});
        });
        this.setState({countryEntries: elemList});
    }

    dataTypeEntries(){
        let elemList = [];
        Object.keys(this.helper.dataTypesDict).forEach((name) => {
            elemList.push(
                {text: name, value: name}
            ); 
        });
        this.setState({dataTypeEntries: elemList});
    }

    updateYAxis(){
        let type = this.logCheckbox.checked ? 'logarithmic' : 'linear';
        this.chart.chart.yAxis[0].update({type});
    }

    componentDidMount(){
        this.runFromQuery();
        this.countryEntries();
        this.dataTypeEntries();
    }

    inputToGraph(seriesInput){
        try {
            let seriesConfig = this.helper.getSeriesForChart(seriesInput);
            if(seriesConfig.data && seriesConfig.data.length){
                this.chart.chart.addSeries(seriesConfig, false);
                return true;
            }
        } catch(error){
            console.error(error);
        }
    }

    validate(){
        if(this.state.countries.length === 0){
            alert('Choose at least one country.');
            return;
        }
        if(this.state.countries.length === 0){
            alert('Choose at least one data type.');
            return;
        }
        if(!this.state.xAxis && this.state.xAxis !== 0){
            alert('Choose a xAxis from dropdown.');
            return;
        }
        return true;
    }

    onSubmit(){
        if(!this.validate()){
            return;
        }
        this.plotted.push([this.state.countries, this.state.dataTypes, this.state.xAxis, this.state.movingAverage ? 1 : 0])
        let countriesSkipped = [];
        this.state.countries.forEach((country)=>{
            this.state.dataTypes.forEach((dataType)=>{
                let seriesInput = {
                    country,
                    xAxis: this.state.xAxis,
                    dataType,
                    movingAverage: this.state.movingAverage
                }
                if(!this.inputToGraph(seriesInput)){
                    countriesSkipped.push(country);
                }
            });
        });
        this.chart.chart.redraw();
        this.clearForm();
        if(countriesSkipped.length){
            alert(`${countriesSkipped.join(', ')} ${countriesSkipped.length === 1 ? 'does' : 'do'} not have enough data for given settings.`)
        }
    }

    clearForm(){
        this.setState({countries: [], dataTypes: []});
        this.countriesDropdown.clearValue();
        this.dataTypeDropdown.clearValue();
    }

    onClear(){
        this.setState({i: this.state.i + 1});
        this.plotted = [];
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

    share = ()=>{
        let params = encodeURI(JSON.stringify(this.plotted));
        let query = '/graph?q=' + params + '&l=' + (this.state.log ? 1 : 0);
        let url = window.location.host + query;
        if(window.navigator.share){
            this.setState({sharing: true}, ()=>{
                window.navigator.share({
                    url: query,
                    text: 'See, compare and analyze Covid - 19 statistics.\n',
                    title: 'Covid - 19 Data Tracker'
                }).finally(()=>{
                    this.setState({sharing: false});
                });
            });
        } else if(window.navigator.clipboard){
            window.navigator.clipboard.writeText(url);
        }
    }

    runFromQuery(inputs, log=false){
        if(!inputs && window.location.search){
            let query = new URLSearchParams(window.location.search);
            inputs = query.get('q');
            inputs = JSON.parse(inputs);
            log = parseInt(query.get('l')) ? true : false;
        }
        if(inputs){
            try {  
                inputs.forEach((input)=>{
                    if(input.length === 4){
                        input[0].forEach((country)=>{
                            input[1].forEach((dataType)=>{
                                let seriesInput = {
                                    country,
                                    xAxis: input[2],
                                    dataType,
                                    movingAverage: input[3] ? true : false
                                }
                                this.inputToGraph(seriesInput)
                            });
                        });
                        this.chart.chart.redraw();
                    }
                }); 
                this.yAxisUpdate(log);
                this.plotted = [...this.plotted, ...inputs];
                this.setState({formOpen: false});
            } catch (error) {
                console.error(error);
            }
        }
    }

    render(){
        return (
            <Fragment>
                <Transition duration={0} visible={this.state.formOpen}>
                    <Grid stackable columns='equal'>
                        <Grid.Row>
                            <Grid.Column>
                                <Dropdown ref={(a)=>{this.countriesDropdown = a}} 
                                            onChange={(_e, {value})=>{this.setState({countries: value})}}
                                            options={this.state.countryEntries} multiple search
                                            selection closeOnChange clearable fluid placeholder="Countries"/>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={12}>
                                <Dropdown onChange={(_e, {value})=>{this.setState({dataTypes: value});}}
                                            ref={(a)=>{this.dataTypeDropdown = a}}
                                            options={this.state.dataTypeEntries} multiple search
                                            selection closeOnChange clearable fluid placeholder="Data Types"/>
                            </Grid.Column>
                            <Grid.Column width={4}>
                                <Dropdown onChange={(_e, {value})=>{this.setState({xAxis: value})}}
                                            ref={(a)=>{this.xAxisDropdown = a}}
                                            options={this.xAxisDropdownList} selection fluid
                                                    placeholder="X-Axis"/>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <Checkbox slider label='Smoothen' onChange={()=>{
                                    this.setState({movingAverage: !this.state.movingAverage});}}/>
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
                </Transition>
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
                            <Menu.Item onClick={()=>this.setState({formOpen: !this.state.formOpen})} fitted>
                                <Icon  name={this.state.formOpen ? 'chevron up' : 'sliders horizontal'}/>
                            </Menu.Item>
                            <this.shareIcon/>
                            <Menu.Item onClick={this.onFull} fitted>
                                <Icon name="expand arrows alternate"/>
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

           </Fragment>
        );
    }
}