import React, { Component, Fragment } from "react";
import Helpers from "../Helpers";
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, CardGroup, Card, CardContent, CardHeader, Statistic, Container, Dropdown, Divider, Button, Icon } from "semantic-ui-react";

export default class DataTable extends Component{
    constructor(props){
        super(props);
        this.state = {
            data: window.countryData.filter((itrData)=>{
                        return (
                            itrData.timeline && 
                            itrData.timeline.length &&
                            itrData.latest_data
                        );
                    }).sort((a,b)=>{
                        let countA = a.timeline[0].confirmed;
                        let countB = b.timeline[0].confirmed;
                        return countB - countA;
                    }),
            filteredData: [],
            countries: [],
            countryEntries: []
        }
        this.helper = new Helpers;
        this.elems = {};
    }

    scroll(code){
        window.scrollTo(0, this.elems[code].offsetTop);
    }

    componentDidMount(){
        this.countryEntries();
    }

    countryEntries(){
        let elemList = [];
        window.countryData.filter((itrData)=>{
            return itrData.timeline && itrData.timeline.length && itrData.latest_data;
        }).sort((a,b)=>{
            let countA = a.timeline[0].confirmed;
            let countB = b.timeline[0].confirmed;
            return countB - countA;
        }).forEach((itrData)=>{
            elemList.push({text: itrData.name, value: itrData.code});
        });
        this.setState({countryEntries: elemList});
    }

    render(){
        let table = ()=>{ 
            return(
                <Table celled selectable>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Total Cases</TableHeaderCell>
                            <TableHeaderCell>New Cases</TableHeaderCell>
                            <TableHeaderCell>Total Deaths</TableHeaderCell>
                            <TableHeaderCell>New Deaths</TableHeaderCell>
                            <TableHeaderCell>Total Recovered</TableHeaderCell>
                            <TableHeaderCell>Active Cases</TableHeaderCell>
                            <TableHeaderCell>Critical Cases</TableHeaderCell>
                            <TableHeaderCell>Total Cases per Million</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(()=>{
                            let rowList = [];
                            (this.state.filteredData.length === 0 ?
                                this.state.data :
                                this.state.filteredData).forEach((value, i)=>{
                                try{
                                    rowList.push(
                                        <TableRow key={i}>
                                            <TableCell onClick={()=>{
                                                this.props.plotGraph(value.code);
                                            }}
                                                style={{cursor: 'pointer'}}>
                                                {value.name}
                                            </TableCell>
                                            <TableCell>{value.latest_data.confirmed}</TableCell>
                                            <TableCell>{value.today.confirmed || ''}</TableCell>
                                            <TableCell negative>{value.latest_data.deaths}</TableCell>
                                            <TableCell>{value.today.deaths || ''}</TableCell>
                                            <TableCell positive>{value.latest_data.recovered}</TableCell>
                                            <TableCell>{value.timeline[0].active}</TableCell>
                                            <TableCell>{value.latest_data.critical}</TableCell>
                                            <TableCell >{value.latest_data.calculated.cases_per_million_population}</TableCell>
                                        </TableRow>
                                    );
                                }catch(error){
                                    console.log(error);
                                }
                            });
                            return rowList;
                        })()}
                    </TableBody>
                </Table>
            );
        }
        let cards = ()=>{
            return (
                <Fragment>
                    {(()=>{
                        let cardList = [];
                        (this.state.filteredData.length === 0 ?
                            this.state.data :
                            this.state.filteredData).forEach((value, i)=>{
                            try{
                                cardList.push(
                                    <Card key={i} fluid>
                                        <CardContent>
                                            <CardHeader textAlign='center'>
                                                {value.name}
                                            </CardHeader>
                                            <Statistic.Group widths={2} size="mini">
                                                
                                                <Statistic>
                                                    <Statistic.Value>{value.latest_data.confirmed}</Statistic.Value>
                                                    <Statistic.Label>Total Cases</Statistic.Label>
                                                </Statistic>
                                                
                                                <Statistic color={"yellow"}>
                                                    <Statistic.Value>{value.today.confirmed}</Statistic.Value>
                                                    <Statistic.Label>New Cases</Statistic.Label>
                                                </Statistic>

                                                <Statistic color={"orange"}>
                                                    <Statistic.Value>{value.latest_data.deaths}</Statistic.Value>
                                                    <Statistic.Label>Total Deaths</Statistic.Label>
                                                </Statistic>

                                                <Statistic color={"red"}>
                                                    <Statistic.Value>{value.today.deaths}</Statistic.Value>
                                                    <Statistic.Label>New Deaths</Statistic.Label>
                                                </Statistic>

                                                <Statistic color={"green"}>
                                                    <Statistic.Value>{value.latest_data.recovered}</Statistic.Value>
                                                    <Statistic.Label>Total Recovered</Statistic.Label>
                                                </Statistic>

                                                <Statistic color={"brown"}>
                                                    <Statistic.Value>{value.timeline[0].active}</Statistic.Value>
                                                    <Statistic.Label>Active Cases</Statistic.Label>
                                                </Statistic>

                                                <Statistic color={"pink"}>
                                                    <Statistic.Value>{value.latest_data.critical}</Statistic.Value>
                                                    <Statistic.Label>Critical Cases</Statistic.Label>
                                                </Statistic>

                                                <Statistic color="grey">
                                                    <Statistic.Value>{value.latest_data.calculated.cases_per_million_population}</Statistic.Value>
                                                    <Statistic.Label>Cases per Million</Statistic.Label>
                                                </Statistic>

                                            </Statistic.Group>
                                        </CardContent>
                                        <CardContent textAlign='center' extra onClick={()=>{this.props.plotGraph(value.code)}}>
                                            <Icon size='large' name='chart area'/>
                                        </CardContent>
                                    </Card>
                                )
                            }catch(error){
                                console.log(error);
                            }
                        });
                        return cardList;
                    })()}
                </Fragment>
            );
        }
        return (
            <Fragment>
                <Container text>
                    {!this.helper.isMobile() ? <Statistic.Group widths={1}>
                        <Statistic>
                            <Statistic.Value>{window.worldData[0].confirmed}</Statistic.Value>
                            <Statistic.Label>Total Cases</Statistic.Label>
                        </Statistic>
                    </Statistic.Group> : null}
                    
                    <Statistic.Group widths={this.helper.isMobile() ? 1 : 2}>
                        {this.helper.isMobile() ? 
                        <Statistic>
                            <Statistic.Value>{window.worldData[0].confirmed}</Statistic.Value>
                            <Statistic.Label>Total Cases</Statistic.Label>
                        </Statistic> : null}
                        <Statistic color='orange'>
                            <Statistic.Value>{window.worldData[0].deaths}</Statistic.Value>
                            <Statistic.Label>Total Deaths</Statistic.Label>
                        </Statistic>
                        <Statistic color='green'>
                            <Statistic.Value>{window.worldData[0].recovered}</Statistic.Value>
                            <Statistic.Label>Total Recovered</Statistic.Label>
                        </Statistic>
                        <Statistic color='yellow'>
                            <Statistic.Value>{window.worldData[0].new_confirmed}</Statistic.Value>
                            <Statistic.Label>New Cases</Statistic.Label>
                        </Statistic>
                        <Statistic color='olive'>
                            <Statistic.Value>{window.worldData[0].active}</Statistic.Value>
                            <Statistic.Label>Active Cases</Statistic.Label>
                        </Statistic>
                        <Statistic color='red'>
                            <Statistic.Value>{window.worldData[0].new_deaths}</Statistic.Value>
                            <Statistic.Label>New Deaths</Statistic.Label>
                        </Statistic>
                        <Statistic color='teal'>
                            <Statistic.Value>{window.worldData[0].new_recovered}</Statistic.Value>
                            <Statistic.Label>New Recoveries</Statistic.Label>
                        </Statistic>
                    </Statistic.Group>
                </Container>
                <Divider/>
                <Dropdown onChange={(_e, {value})=>{
                                        this.setState({
                                            filteredData: this.state.data.filter(({code})=>{
                                                return value.includes(code);
                                            })
                                        })
                                    }}
                            options={this.state.countryEntries} multiple search
                            selection closeOnChange clearable fluid placeholder="Countries"/>
                {this.helper.isMobile() ? cards() : table()}
            </Fragment>
        )
    }
}