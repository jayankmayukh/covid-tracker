import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import 'semantic-ui-css/semantic.min.css';
import routes from './routes';

if (window.location.hostname === 'covid.jaym.app') {
  window.DATA_SOURCE = 'https://covid-api.jaym.app'
} else {
  window.DATA_SOURCE = 'https://covid-api.jynk.xyz'
}
ReactDOM.render(
    routes,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
