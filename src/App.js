import React, { Component, Fragment } from 'react'
import './App.scss'
import { Header, Icon, Tab, Container, MenuItem, MenuMenu, Loader, Dimmer } from 'semantic-ui-react'
import Graph from './components/Graph'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataLoaded: false,
            activeIndex: 0,
        }
        this.tabs = [
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
                    key: 1,
                },
            },
            {
                menuItem: (
                    <Fragment key={2}>
                        <MenuMenu position="right">
                            <MenuItem fitted>
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://www.linkedin.com/in/jayank-mayukh"
                                >
                                    <Icon fitted color="blue" size="large" name="linkedin" />
                                </a>
                            </MenuItem>
                            <MenuItem fitted>
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://github.com/jayankmayukh/covid-tracker"
                                >
                                    <Icon fitted color="black" size="large" name="github" />
                                </a>
                            </MenuItem>
                        </MenuMenu>
                    </Fragment>
                ),
            },
        ]
    }

    componentDidMount() {
        let requests = [
            fetch('https://covid-api.jynk.xyz/meta.json').then(async (data) => {
                window.meta = await data.json()
                window.countries = Object.keys(window.meta.countries).sort(
                    (a, b) =>
                        window.meta.countries[b].total_cases - window.meta.countries[a].total_cases
                )
            }),
        ]
        Promise.all(requests).then(() => {
            this.setState({ dataLoaded: true })
        })
        if (/^\/graph/i.test(window.location.pathname)) {
            this.setState({ activeIndex: 0 })
        }
    }

    render() {
        return (
            <div className="App">
                {this.state.dataLoaded ? (
                    <Fragment>
                        <Header as="h1" color="grey">
                            <Header.Content>
                                <Icon name="dashboard" />
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
