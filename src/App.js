import React, { Component } from 'react';
import './App.scss';
import Routes from './routes';

class App extends Component{

    constructor(props){
        super(props);
        this.state = {
            dataLoaded: false
        }
    }

    componentDidMount(){
        fetch('https://pomber.github.io/covid19/timeseries.json').then(async (data)=>{
            window.data = await data.json();
            let World = [];
            for(let i=0; i < window.data.India.length; i++){
                let thisEntry = {
                    date: window.data.India[i].date,
                    confirmed: 0,
                    deaths: 0,
                    recovered: 0
                }
                Object.entries(window.data).forEach(([_key, value])=> {
                    thisEntry.confirmed += value[i].confirmed;
                    thisEntry.deaths += value[i].deaths;
                    thisEntry.recovered += value[i].deaths;
                });
                World.push(thisEntry);
            }
            window.data.World = World;
            this.setState({dataLoaded: true});
        });
    }

    render(){
        return (
            <div className="App">
                <header>
                    <h1>Covid-19 Data Tracker</h1>
                </header>
                <main>
                    {this.state.dataLoaded ? Routes : <div className="loading">Loading...</div>}
                </main>
            </div>
        );
    }
}

export default App;
