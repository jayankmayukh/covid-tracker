import React, { Component, Fragment } from 'react'
import './App.scss'
import { Header, Icon, Tab, Container, MenuItem, MenuMenu, Loader, Dimmer } from 'semantic-ui-react'
import Graph from './components/Graph'
import DataTable from './components/DataTable'
import Map from './components/Map'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataLoaded: false,
            activeIndex: 0
        }
        this.tabs = [
            {
                menuItem: 'World Map',
                pane: {
                    content: <Map plotGraph={this.plotGraph.bind(this)} />,
                    as: Container,
                    key: 2
                }
            },
            {
                menuItem: 'Data Table',
                pane: {
                    content: <DataTable plotGraph={this.plotGraph.bind(this)} />,
                    as: Container,
                    key: 0
                }
            },
            {
                menuItem: 'Create Graph',
                pane: {
                    content: (
                        <Graph
                            ref={(i) => {
                                this.Graph = i
                            }}
                        />
                    ),
                    as: Container,
                    key: 1
                }
            },
            {
                menuItem: (
                    <Fragment key={2}>
                        <MenuMenu position='right'>
                            <MenuItem fitted>
                                <a target='_blank' href='https://www.linkedin.com/in/jayank-mayukh'>
                                    <Icon fitted color='blue' size='large' name='linkedin' />
                                </a>
                            </MenuItem>
                            <MenuItem fitted>
                                <a
                                    target='_blank'
                                    href='https://github.com/jayankmayukh/covid-tracker'
                                >
                                    <Icon fitted color='black' size='large' name='github' />
                                </a>
                            </MenuItem>
                        </MenuMenu>
                    </Fragment>
                )
            }
        ]
    }

    plotGraph(country) {
        let inp = [
            [
                [country],
                [
                    'Total Cases',
                    'Deaths',
                    'Recovered',
                    'Daily Cases',
                    'Active Cases',
                    'Daily Recoveries',
                    'Daily Deaths'
                ],
                1,
                0
            ]
        ]
        this.setState({ activeIndex: 1 }, () => {
            this.Graph.runFromQuery(inp)
        })
    }

    componentDidMount() {
        let requests = [
            fetch('https://corona-api.com/countries').then(async (data) => {
                window.countryData = (await data.json()).data
            }),
            fetch('https://corona-api.com/timeline').then(async (data) => {
                window.worldData = (await data.json()).data
            })
        ]
        Promise.all(requests).then(() => {
            window.countryData.push({
                code: 'World',
                name: 'World',
                latest_data: window.worldData[0],
                timeline: window.worldData
            })
            this.setState({ dataLoaded: true })
        })
        if (/^\/graph/i.test(window.location.pathname)) {
            this.setState({ activeIndex: 1 })
        }
    }

    render() {
        return (
            <div className='App'>
                {this.state.dataLoaded ? (
                    <Fragment>
                        <Header as='h1' color='grey'>
                            <Header.Content>
                                <Icon name='dashboard' />
                                Covid-19 Tracker
                            </Header.Content>
                        </Header>
                        <Tab
                            menu={{ secondary: true, pointing: true }}
                            activeIndex={this.state.activeIndex}
                            panes={this.tabs}
                            renderActiveOnly={false}
                            onTabChange={(_e, { activeIndex }) => {
                                this.setState({ activeIndex })
                            }}
                        />
                        <div style={{ padding: 30 }}></div>
                    </Fragment>
                ) : (
                    <Dimmer active>
                        <Loader>Loading...</Loader>
                    </Dimmer>
                )}
            </div>
        )
    }
}

export default App
