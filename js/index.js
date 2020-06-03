import FancyWeather from './fancyWeather';
import { render } from './createElement';
import '../styles.css';
// import 'https://api.mapbox.com/mapbox-gl-js/v1.8.1/mapbox-gl.css';

render(new FancyWeather(), document.querySelector('body'));
