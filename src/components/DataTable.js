import React, { Component, Fragment } from 'react'
import { isMobile } from '../Helpers'
import {
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Card,
    CardContent,
    CardHeader,
    Statistic,
    Container,
    Dropdown,
    Divider,
    Icon
} from 'semantic-ui-react'

export default class DataTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: window.countryData
                .filter((itrData) => {
                    return itrData.latest_data && itrData.code !== 'World'
                })
                .sort((a, b) => {
                    let countA = a.latest_data.confirmed
                    let countB = b.latest_data.confirmed
                    return countB - countA
                }),
            filteredData: [],
            countries: [],
            countryEntries: []
        }
        this.elems = {}
    }

    scroll(code) {
        window.scrollTo(0, this.elems[code].offsetTop)
    }

    componentDidMount() {
        this.countryEntries()
    }

    countryEntries() {
        let elemList = []
        window.countryData
            .filter((itrData) => {
                return itrData.latest_data && itrData.code !== 'World'
            })
            .sort((a, b) => {
                let countA = a.latest_data.confirmed
                let countB = b.latest_data.confirmed
                return countB - countA
            })
            .forEach((itrData) => {
                elemList.push({ text: itrData.name, value: itrData.code })
            })
        this.setState({ countryEntries: elemList })
    }

    render() {
        let table = () => {
            return (
                <Table celled selectable>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Total Cases</TableHeaderCell>
                            <TableHeaderCell>Cases Today</TableHeaderCell>
                            <TableHeaderCell>Total Deaths</TableHeaderCell>
                            <TableHeaderCell>Deaths Today</TableHeaderCell>
                            <TableHeaderCell>Total Recovered</TableHeaderCell>
                            <TableHeaderCell>Active Cases</TableHeaderCell>
                            <TableHeaderCell>Total Cases per Million</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(() => {
                            let rowList = []
                            ;(this.state.filteredData.length === 0
                                ? this.state.data
                                : this.state.filteredData
                            ).forEach((value, i) => {
                                try {
                                    rowList.push(
                                        <TableRow key={i}>
                                            <TableCell
                                                onClick={() => {
                                                    this.props.plotGraph(value.code)
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {value.name}
                                            </TableCell>
                                            <TableCell>
                                                {value.latest_data.confirmed.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {value.today.confirmed
                                                    ? value.today.confirmed.toLocaleString()
                                                    : '-'}
                                            </TableCell>
                                            <TableCell negative>
                                                {value.latest_data.deaths.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {value.today.deaths
                                                    ? value.today.deaths.toLocaleString()
                                                    : '-'}
                                            </TableCell>
                                            <TableCell positive>
                                                {value.latest_data.recovered.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {(
                                                    value.latest_data.confirmed -
                                                    value.latest_data.recovered -
                                                    value.latest_data.deaths
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {value.latest_data.calculated.cases_per_million_population.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    )
                                } catch (error) {
                                    console.log(error)
                                }
                            })
                            return rowList
                        })()}
                    </TableBody>
                </Table>
            )
        }
        let cards = () => {
            return (
                <Fragment>
                    {(() => {
                        let cardList = []
                        ;(this.state.filteredData.length === 0
                            ? this.state.data
                            : this.state.filteredData
                        ).forEach((value, i) => {
                            try {
                                cardList.push(
                                    <Card key={i} fluid>
                                        <CardContent>
                                            <CardHeader textAlign='center'>{value.name}</CardHeader>
                                            <Statistic.Group widths={2} size='mini'>
                                                <Statistic>
                                                    <Statistic.Value>
                                                        {value.latest_data.confirmed.toLocaleString()}
                                                    </Statistic.Value>
                                                    <Statistic.Label>Total Cases</Statistic.Label>
                                                </Statistic>

                                                <Statistic color={'yellow'}>
                                                    <Statistic.Value>
                                                        {value.today.confirmed
                                                            ? value.today.confirmed.toLocaleString()
                                                            : '-'}
                                                    </Statistic.Value>
                                                    <Statistic.Label>Cases Today</Statistic.Label>
                                                </Statistic>

                                                <Statistic color={'orange'}>
                                                    <Statistic.Value>
                                                        {value.latest_data.deaths.toLocaleString()}
                                                    </Statistic.Value>
                                                    <Statistic.Label>Total Deaths</Statistic.Label>
                                                </Statistic>

                                                <Statistic color={'red'}>
                                                    <Statistic.Value>
                                                        {value.today.deaths
                                                            ? value.today.deaths.toLocaleString()
                                                            : '-'}
                                                    </Statistic.Value>
                                                    <Statistic.Label>Deaths Today</Statistic.Label>
                                                </Statistic>

                                                <Statistic color={'green'}>
                                                    <Statistic.Value>
                                                        {value.latest_data.recovered.toLocaleString()}
                                                    </Statistic.Value>
                                                    <Statistic.Label>
                                                        Total Recovered
                                                    </Statistic.Label>
                                                </Statistic>

                                                <Statistic color={'brown'}>
                                                    <Statistic.Value>
                                                        {(
                                                            value.latest_data.confirmed -
                                                            value.latest_data.recovered -
                                                            value.latest_data.deaths
                                                        ).toLocaleString()}
                                                    </Statistic.Value>
                                                    <Statistic.Label>Active Cases</Statistic.Label>
                                                </Statistic>

                                                <Statistic color='grey'>
                                                    <Statistic.Value>
                                                        {value.latest_data.calculated.cases_per_million_population.toLocaleString()}
                                                    </Statistic.Value>
                                                    <Statistic.Label>
                                                        Cases per Million
                                                    </Statistic.Label>
                                                </Statistic>
                                            </Statistic.Group>
                                        </CardContent>
                                        <CardContent
                                            textAlign='center'
                                            extra
                                            onClick={() => {
                                                this.props.plotGraph(value.code)
                                            }}
                                        >
                                            <Icon size='large' name='chart area' />
                                        </CardContent>
                                    </Card>
                                )
                            } catch (error) {
                                console.log(error)
                            }
                        })
                        return cardList
                    })()}
                </Fragment>
            )
        }
        return (
            <Fragment>
                <Container text>
                    {!isMobile() ? (
                        <Statistic.Group widths={1}>
                            <Statistic>
                                <Statistic.Value>
                                    {window.worldData[0].confirmed.toLocaleString()}
                                </Statistic.Value>
                                <Statistic.Label>Total Cases</Statistic.Label>
                            </Statistic>
                        </Statistic.Group>
                    ) : null}

                    <Statistic.Group widths={isMobile() ? 1 : 2}>
                        {isMobile() ? (
                            <Statistic>
                                <Statistic.Value>
                                    {window.worldData[0].confirmed.toLocaleString()}
                                </Statistic.Value>
                                <Statistic.Label>Total Cases</Statistic.Label>
                            </Statistic>
                        ) : null}
                        <Statistic color='orange'>
                            <Statistic.Value>
                                {window.worldData[0].deaths.toLocaleString()}
                            </Statistic.Value>
                            <Statistic.Label>Total Deaths</Statistic.Label>
                        </Statistic>
                        <Statistic color='green'>
                            <Statistic.Value>
                                {window.worldData[0].recovered.toLocaleString()}
                            </Statistic.Value>
                            <Statistic.Label>Total Recovered</Statistic.Label>
                        </Statistic>
                        <Statistic color='brown'>
                            <Statistic.Value>
                                {window.worldData[0].active.toLocaleString()}
                            </Statistic.Value>
                            <Statistic.Label>Active Cases</Statistic.Label>
                        </Statistic>
                        <Statistic color='yellow'>
                            <Statistic.Value>
                                {window.worldData[0].new_confirmed
                                    ? window.worldData[0].new_confirmed.toLocaleString()
                                    : '-'}
                            </Statistic.Value>
                            <Statistic.Label>Cases Today</Statistic.Label>
                        </Statistic>
                        <Statistic color='red'>
                            <Statistic.Value>
                                {window.worldData[0].new_deaths
                                    ? window.worldData[0].new_deaths.toLocaleString()
                                    : '-'}
                            </Statistic.Value>
                            <Statistic.Label>Deaths Today</Statistic.Label>
                        </Statistic>
                        <Statistic color='teal'>
                            <Statistic.Value>
                                {window.worldData[0].new_recovered
                                    ? window.worldData[0].new_recovered.toLocaleString()
                                    : '-'}
                            </Statistic.Value>
                            <Statistic.Label>Recoveries Today</Statistic.Label>
                        </Statistic>
                    </Statistic.Group>
                </Container>
                <Divider />
                <Dropdown
                    onChange={(_e, { value }) => {
                        this.setState({
                            filteredData: this.state.data.filter(({ code }) => {
                                return value.includes(code)
                            })
                        })
                    }}
                    options={this.state.countryEntries}
                    multiple
                    search
                    selection
                    closeOnChange
                    clearable
                    fluid
                    placeholder='Countries'
                />
                {isMobile() ? cards() : table()}
            </Fragment>
        )
    }
}
