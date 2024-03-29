import React, { Component, Fragment } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Helpers, { isMobile } from '../Helpers'
import iso from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import '../styles/Graph.scss'
import Fullscreen from 'react-full-screen'
import {
    Dropdown,
    Grid,
    Button,
    Menu,
    Icon,
    Checkbox,
    Popup,
    Loader,
    Transition,
    Dimmer,
} from 'semantic-ui-react'

iso.registerLocale(enLocale)

export default class Graph extends Component {
    constructor(props) {
        super(props)
        this.helper = new Helpers()
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
            formOpen: true,
            loading: false,
            onSeparateAxis: false,
        }
        this.plotted = []
        this.xAxisDropdownList = [
            { text: 'Days Since First 100 Cases', value: 1 },
            { text: 'Date', value: 0 },
            { text: 'Total Cases (Log Scale) Since First 100 cases', value: 2 },
            { text: 'Days Since Vaccination Started', value: 3 },
        ]
    }

    shareIcon = () => {
        let baseIcon = (
            <Menu.Item onClick={this.share} fitted>
                {this.state.sharing ? (
                    <Loader active inline size="small" />
                ) : (
                    <Icon name="share alternate" />
                )}
            </Menu.Item>
        )
        if (window.navigator.share) {
            return baseIcon
        } else if (window.navigator.clipboard) {
            return <Popup content="Link has been copied!" basic on="click" trigger={baseIcon} />
        } else {
            return null
        }
    }

    countryEntries() {
        let elemList = window.countries.map((code) => ({
            text: iso.getName(code, 'en'),
            value: code,
        }))
        this.setState({ countryEntries: elemList })
    }

    dataTypeEntries() {
        let elemList = []
        Object.entries(this.helper.getDataTypesDict(this.state.countries)).forEach(
            ([key, name]) => {
                elemList.push({ text: name, value: key })
            }
        )
        this.setState({ dataTypeEntries: elemList })
    }

    updateYAxis() {
        let type = this.logCheckbox.checked ? 'logarithmic' : 'linear'
        this.chart.chart.yAxis.forEach((yAxis) => yAxis.update({ type }, false))
        this.chart.chart.redraw()
    }

    componentDidMount() {
        this.runFromQuery()
        this.countryEntries()
        this.dataTypeEntries()
    }

    async inputToGraph(seriesInput) {
        try {
            let seriesConfig = await this.helper.getSeriesForChart(seriesInput)
            if (seriesConfig.data && seriesConfig.data.length) {
                if (this.state.onSeparateAxis) {
                    seriesConfig.yAxis = seriesInput.dataType
                    if (!this.chart.chart.get(seriesInput.dataType)) {
                        let name = this.helper.dataTypesDict[seriesInput.dataType]
                        this.chart.chart.addAxis(
                            {
                                ...this.helper.getBasicAxis(name),
                                id: seriesInput.dataType,
                                opposite: this.chart.chart.yAxis.length % 2 === 1,
                            },
                            false,
                            false
                        )
                    }
                }
                this.chart.chart.addSeries(seriesConfig, false)
                return true
            }
        } catch (error) {
            console.error(error)
        }
    }

    validate() {
        if (this.state.countries.length === 0) {
            alert('Choose at least one country.')
            return
        }
        if (this.state.countries.length === 0) {
            alert('Choose at least one data type.')
            return
        }
        if (!this.state.xAxis && this.state.xAxis !== 0) {
            alert('Choose a xAxis from dropdown.')
            return
        }
        return true
    }

    async onSubmit() {
        if (!this.validate()) {
            return
        }
        this.plotted.push([
            this.state.countries,
            this.state.dataTypes,
            this.state.xAxis,
            this.state.onSeparateAxis ? 1 : 0,
        ])
        let promises = []
        this.state.countries.forEach((country) => {
            this.state.dataTypes.forEach((dataType) => {
                let seriesInput = {
                    country,
                    xAxis: this.state.xAxis,
                    dataType,
                    onSeparateAxis: this.state.onSeparateAxis,
                }
                promises.push(this.inputToGraph(seriesInput))
            })
        })

        this.setState({ loading: true })
        await Promise.all(promises)
        this.chart.chart.redraw()
        this.setState({ loading: false })
        this.clearForm()
    }

    clearForm() {
        this.setState({ countries: [], dataTypes: [] }, () => {
            this.dataTypeEntries()
        })
        this.countriesDropdown.clearValue()
        this.dataTypeDropdown.clearValue()
    }

    onClear() {
        this.setState({ i: this.state.i + 1 })
        this.plotted = []
        this.clearForm()
    }

    yAxisUpdate(log) {
        this.setState({ log }, () => {
            this.chart.chart.yAxis.forEach((yAxis) =>
                yAxis.update({ type: this.state.log ? 'logarithmic' : 'linear' }, false)
            )
            this.chart.chart.redraw()
        })
    }

    onFull = () => {
        this.setState({ isFull: true }, () => {
            if (isMobile()) window.screen.orientation.lock('landscape')
            this.chart.chart.reflow()
        })
    }

    share = () => {
        let params = encodeURI(JSON.stringify(this.plotted))
        let query = '/graph?q=' + params + '&l=' + (this.state.log ? 1 : 0)
        let url = window.location.host + query
        if (window.navigator.share) {
            this.setState({ sharing: true }, () => {
                window.navigator
                    .share({
                        url: query,
                        text: 'See, compare and analyze Covid - 19 statistics.\n',
                        title: 'Covid - 19 Data Tracker',
                    })
                    .finally(() => {
                        this.setState({ sharing: false })
                    })
            })
        } else if (window.navigator.clipboard) {
            window.navigator.clipboard.writeText(url)
        }
    }

    async runFromQuery(inputs, log = false) {
        if (!inputs && window.location.search) {
            let query = new URLSearchParams(window.location.search)
            inputs = query.get('q')
            inputs = JSON.parse(inputs)
            log = parseInt(query.get('l')) ? true : false
        }
        if (inputs) {
            try {
                let promises = []
                inputs.forEach((input) => {
                    if (input.length === 4) {
                        input[0].forEach((country) => {
                            input[1].forEach((dataType) => {
                                let seriesInput = {
                                    country,
                                    xAxis: input[2],
                                    dataType,
                                    onSeparateAxis: input[3] ? true : false,
                                }
                                promises.push(this.inputToGraph(seriesInput))
                            })
                        })
                    }
                })
                this.setState({ loading: true })
                await Promise.all(promises)
                this.chart.chart.redraw()
                this.setState({ loading: false })

                this.yAxisUpdate(log)
                this.plotted = [...this.plotted, ...inputs]
                this.setState({ formOpen: false })
            } catch (error) {
                console.error(error)
            }
        }
    }

    render() {
        return (
            <Fragment>
                <Transition duration={0} visible={this.state.formOpen}>
                    <Grid stackable columns="equal">
                        <Grid.Row>
                            <Grid.Column>
                                <Dropdown
                                    ref={(a) => {
                                        this.countriesDropdown = a
                                    }}
                                    onChange={(_e, { value }) => {
                                        this.setState({ countries: value }, () => {
                                            this.dataTypeEntries()
                                        })
                                    }}
                                    options={this.state.countryEntries}
                                    multiple
                                    search
                                    selection
                                    closeOnChange
                                    clearable
                                    fluid
                                    placeholder="Countries"
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column width={12}>
                                <Dropdown
                                    onChange={(_e, { value }) => {
                                        this.setState({ dataTypes: value })
                                    }}
                                    ref={(a) => {
                                        this.dataTypeDropdown = a
                                    }}
                                    options={this.state.dataTypeEntries}
                                    multiple
                                    search
                                    selection
                                    closeOnChange
                                    clearable
                                    fluid
                                    placeholder="Data Types"
                                />
                            </Grid.Column>
                            <Grid.Column width={4}>
                                <Dropdown
                                    onChange={(_e, { value }) => {
                                        this.setState({ xAxis: value })
                                    }}
                                    ref={(a) => {
                                        this.xAxisDropdown = a
                                    }}
                                    options={this.xAxisDropdownList}
                                    selection
                                    fluid
                                    placeholder="X-Axis"
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <Checkbox
                                    slider
                                    label="Plot On Separate Axis"
                                    onChange={() => {
                                        this.setState({
                                            onSeparateAxis: !this.state.onSeparateAxis,
                                        })
                                    }}
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                            <Grid.Column>
                                <Button primary fluid onClick={() => this.onSubmit()}>
                                    Add Graph
                                </Button>
                            </Grid.Column>
                            <Grid.Column>
                                <Button basic color="red" fluid onClick={() => this.onClear()}>
                                    Clear Graph
                                </Button>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Transition>
                <Menu tabular attached="top">
                    <Menu.Item
                        name="Linear Scale"
                        active={!this.state.log}
                        onClick={() => this.yAxisUpdate(false)}
                    />
                    <Menu.Item
                        name="Log Scale"
                        active={this.state.log}
                        onClick={() => this.yAxisUpdate(true)}
                    />
                    <Menu.Menu position="right">
                        <Menu.Item
                            onClick={() => this.setState({ formOpen: !this.state.formOpen })}
                            fitted
                        >
                            <Icon
                                name={this.state.formOpen ? 'chevron up' : 'sliders horizontal'}
                            />
                        </Menu.Item>
                        <this.shareIcon />
                        <Menu.Item onClick={this.onFull} fitted>
                            <Icon name="expand arrows alternate" />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Fullscreen
                    enabled={this.state.isFull}
                    onChange={(isFull) => {
                        this.setState({ isFull }, this.chart.chart.reflow())
                    }}
                >
                    <Dimmer.Dimmable>
                        <HighchartsReact
                            highchrats={Highcharts}
                            options={this.state.chartOptions}
                            ref={(chart) => {
                                this.chart = chart
                            }}
                            key={this.state.i}
                            containerProps={{ className: 'main-chart-container' }}
                        />
                        <Dimmer active={this.state.loading} inverted>
                            <Loader content="Fetching data..." />
                        </Dimmer>
                    </Dimmer.Dimmable>
                </Fullscreen>
            </Fragment>
        )
    }
}
