import mapboxgl from 'mapbox-gl/dist/mapbox-gl';

import { Component, createRef } from './createElement';
import TimeZone from './timeZone';
import {
  div, button, img, select, option, input, label, form,
} from './tags';
import {
  getPlaceholder,
  getTextButtonSearch,
  getTextlatitudelongitude,
  getTepmByType,
  getWeatherInfo,
  getWindSPD,
  get3DaysWeekName,
  getWetherDescrByCode,
  getIconClassNameWeatherByCode,
  getDataToPicUrl,
} from './helpers';
import {
  getLinkToImage, getLocation, getWeather,
} from './queries';

export default class FancyWeather extends Component {
  state = {
    language: localStorage.getItem('language') || 'en',
    tempType: localStorage.getItem('tempType') || 'celsius',
    search: '',
    imagebg: '',
    country: '',
    state: '',
    city: '',
    lat: '',
    lng: '',
    timeZone: '',

    countryCode: localStorage.getItem('countryCode'),
    weatherToday: {
      temp: '',
      appTemp: '',
      wind: '',
      humidity: '',
      weatherCode: '',
    },
    weatherDays: {
      day1: '',
      day1WeatherCode: '',
      day2: '',
      day2WeatherCode: '',
      day3: '',
      day3WeatherCode: '',
    },

    btnBackgoundImgClass: '',
    btnSearchClass: '',
  };

  selectLanguage = createRef();

  inputCelsius = createRef();

  inputFahrenheit = createRef();

  input = createRef();

  constructor(props) {
    super(props);
    this.setState({
      language: localStorage.getItem('language') || 'en',
      tempType: localStorage.getItem('tempType') || 'celsius',
    });
  }

  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiemhhbm5hc2JpdG5ldmEiLCJhIjoiY2thc2h6eXRxMGtlcTJ3bzV3N2I4cW5leCJ9.gVomj5-byfWfjNDI8M33fQ';
    this.mapboxgl = new mapboxgl.Map({
      container: 'myMap',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [19, 50],
      zoom: 6,
      attributionControl: true,
    });

    this.input.current.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.searchPlace(this.state.search);
      }
    });
    getLocation(this.state.language).then((data) => {
      this.setState({
        country: data.results[0].components.country,
        city: data.results[0].components.city,
        state: data.results[0].components.state,
        lat: data.results[0].annotations.DMS.lat,
        lng: data.results[0].annotations.DMS.lng,
        timeZone: data.results[0].annotations.timezone.name,
        countryCode: data.results[0].components.country_code,
      });
      this.mapboxgl.flyTo({
        center: [data.results[0].geometry.lng, data.results[0].geometry.lat],
        zoom: 10,
        essential: true,
      });
      // console.log(data.results[0].components.country_code);
      return {
        city: data.results[0].components.city,
        countryCode: data.results[0].components.country_code,
      };
    }).then(({ city, countryCode }) => {
      getWeather(city, countryCode).then(
        (result) => this.setState({
          weatherToday: {
            temp: result.data[0].temp,
            appTemp: result.data[0].app_min_temp,
            wind: result.data[0].wind_spd,
            humidity: result.data[0].rh,
            weatherCode: result.data[0].weather.code,
          },
          weatherDays: {
            day1: result.data[1].max_temp,
            day1WeatherCode: result.data[1].weather.code,
            day2: result.data[2].max_temp,
            day2WeatherCode: result.data[2].weather.code,
            day3: result.data[3].max_temp,
            day3WeatherCode: result.data[3].weather.code,
          },
        }),
      );
    });

    // console.log('mount');

    getLinkToImage('weather').then((pic) => this.setState({ imagebg: pic }));
  }

  changeBackground = () => {
    this.setState({ btnBackgoundImgClass: 'btnBackgoundImgActive' });
    getLinkToImage(getDataToPicUrl(this.state.timeZone, this.state.weatherToday.weatherCode))
      .then((pic) => this.setState({ imagebg: pic, btnBackgoundImgClass: '' }));
  }

  searchPlace = (value) => {
    this.setState({ btnSearchClass: 'btnSearchLoad' });
    getLocation(this.state.language, value)
      .then((data) => {
        this.setState(data.results.length ? {
          country: data.results[0].components.country,
          city: data.results[0].components.city
          || data.results[0].components.town
          || data.results[0].components.state,
          state: data.results[0].components.state || data.results[0].components.county,
          lat: data.results[0].annotations.DMS.lat,
          lng: data.results[0].annotations.DMS.lng,
          timeZone: data.results[0].annotations.timezone.name,
          btnSearchClass: '',
        } : { search: 'Wrong search', btnSearchClass: '' });
        if (data.results.length) {
          this.mapboxgl.flyTo({
            center: [
              data.results[0].geometry.lng,
              data.results[0].geometry.lat],
            zoom: 9,
            essential: true,
          });
        }
        if (data.results.length) {
          return {
            city: value,
            country: data.results[0].components.country,
            countryCode: data.results[0].components.country_code,
          };
        } return {
          city: this.state.city,
          countryCode: this.state.countryCode,
          timeZone: data.results[0].annotations.timezone.name,
        };
      }).then(({
        city, countryCode, timeZone,
      }) => {
        getLinkToImage(getDataToPicUrl(timeZone, this.state.weatherToday.weatherCode))
          .then((pic) => this.setState({ imagebg: pic }));
        getWeather(city, countryCode)
          .then(
            (result) => this.setState({
              weatherToday: {
                temp: result.data[0].temp,
                appTemp: result.data[0].app_min_temp,
                wind: result.data[0].wind_spd,
                humidity: result.data[0].rh,
                weatherCode: result.data[0].weather.code,
              },
              weatherDays: {
                day1: result.data[1].max_temp,
                day1WeatherCode: result.data[1].weather.code,
                day2: result.data[2].max_temp,
                day2WeatherCode: result.data[2].weather.code,
                day3: result.data[3].max_temp,
                day3WeatherCode: result.data[3].weather.code,
              },
            }),
          )
          .catch(() => this.setState({ search: 'Enter city name, Please' }));
      });
  }

  changeTempType = (value) => {
    localStorage.setItem('tempType', value);
    this.setState({ tempType: value });
  }

  changeLanguage = (language) => {
    localStorage.setItem('language', language);
    getLocation(language, this.state.search).then((data) => this.setState({
      language,
      country: data.results[0].components.country,
      city: data.results[0].components.city,
      state: data.results[0].components.state,
      lat: data.results[0].annotations.DMS.lat,
      lng: data.results[0].annotations.DMS.lng,
      timeZone: data.results[0].annotations.timezone.name,
    }));
  };

  render() {
    const {
      language,
      tempType,
      search,
      imagebg,
      country,
      state,
      city,
      lat,
      lng,
      timeZone,
      weatherToday,
      weatherDays,
      btnBackgoundImgClass,
      btnSearchClass,
    } = this.state;
    const {
      temp, appTemp, wind, humidity, weatherCode,
    } = weatherToday;

    const {
      day1, day1WeatherCode, day2, day2WeatherCode, day3, day3WeatherCode,
    } = weatherDays;
    // console.log(tempType);
    // console.log('img', imagebg);

    return div({
      className: 'appWrapper',
      style: imagebg ? `background-image: url(${imagebg})` : '',
    })([
      div({ className: 'controls' })([
        div({ className: 'wrapper buttons' })([
          button({ className: 'btnBackgound', onClick: () => this.changeBackground() })([
            img({
              className: `btnBackgoundImg ${btnBackgoundImgClass}`,
              alt: 'refresh',
              src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            })(),
            div({ className: 'tooltip' })('change \r\n background image'),
          ]),
          select({
            className: 'selectLanguage',
            ref: this.selectLanguage,
            value: language,
            onChange: () => this.changeLanguage(this.selectLanguage.current.value),
          })([
            option({ className: 'option', value: 'ru' })('RU'),
            option({ className: 'option', value: 'pl' })('PL'),
            option({ className: 'option', value: 'en' })('EN'),
          ]),
          form({ className: 'btnsTemp' })([
            input({
              className: 'input celsius',
              name: 'temp',
              type: 'radio',
              id: 'celsius',
              value: 'celsius',
              checked: tempType === 'celsius',
              ref: this.inputCelsius,
              onChange: () => this.changeTempType(this.inputCelsius.current.value),
            })(),
            label({ className: 'label celsius', for: 'celsius' })('°C'),
            input({
              className: 'input fahrenheit',
              name: 'temp',
              type: 'radio',
              id: 'fahrenheit',
              value: 'fahrenheit',
              checked: tempType === 'fahrenheit',
              ref: this.inputFahrenheit,
              onChange: () => this.changeTempType(this.inputFahrenheit.current.value),
            })(),
            label({ className: 'label fahrenheit', for: 'fahrenheit' })('°F'),
          ]),
        ]),
        div({ className: 'wrapper search' })([
          input({
            ref: this.input,
            className: 'inputsearch',
            type: 'text',
            value: search,
            placeholder: getPlaceholder(language),
            onChange: () => this.setState({ search: this.input.current.value }),
          })(),
          button({
            className: `btnSearch ${btnSearchClass}`,
            onClick: () => this.searchPlace(search),
          })(
            getTextButtonSearch(language),
          ),
        ]),
      ]),
      div({ className: 'weatherAndMap' })([
        div({ className: 'weather' })([
          div({ className: 'weatherToday' })([
            div({ className: 'wrapper city' })([
              div()(`${city} , ${country} `),
              div()(` ${state}`),
            ]),
            div({ className: 'wrapper time' })([new TimeZone({ timeZone, language })]),
            div({ className: 'wrapper today' })([
              div({ className: 'temp' })(`${getTepmByType(temp, tempType)}${tempType === 'celsius' ? '°C' : '°F'}`),
              img({
                className: `iconToday ${getIconClassNameWeatherByCode(weatherCode)}`,
                alt: 'weather icon today',
                src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
              })(),
              div({ className: 'info' })([
                div({ className: 'infoLine' })(getWetherDescrByCode(weatherCode)(language)),
                div({ className: 'infoLine' })(`${getWeatherInfo('feels')(language)}: ${getTepmByType(appTemp, tempType)} ${tempType === 'celsius' ? '°C' : '°F'}`),
                div({ className: 'infoLine' })(`${getWeatherInfo('wind')(language)}: ${Math.ceil(wind)} ${getWindSPD(language)}`),
                div({ className: 'infoLine' })(`${getWeatherInfo('rh')(language)}: ${Math.ceil(humidity)} %`),
              ]),
            ]),
          ]),
          div({ className: 'weatherDays wrapper' })([
            div({ className: 'day' })([
              div({ className: 'dayWeek' })(get3DaysWeekName(language, timeZone)[0]),
              div({ className: 'dayTemp' })(`${getTepmByType(day1, tempType)}${tempType === 'celsius' ? '°C' : '°F'}`),
              img({
                className: `dayIcon ${getIconClassNameWeatherByCode(day1WeatherCode)}`,
                alt: 'weather icon day',
                src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
              })(),
            ]),
            div({ className: 'day' })([
              div({ className: 'dayWeek' })(get3DaysWeekName(language, timeZone)[1]),
              div({ className: 'dayTemp' })(`${getTepmByType(day2, tempType)}${tempType === 'celsius' ? '°C' : '°F'}`),
              img({
                className: `dayIcon ${getIconClassNameWeatherByCode(day2WeatherCode)}`,
                alt: 'weather icon day',
                src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
              })(),
            ]),
            div({ className: 'day' })([
              div({ className: 'dayWeek' })(get3DaysWeekName(language, timeZone)[2]),
              div({ className: 'dayTemp' })(`${getTepmByType(day3, tempType)}${tempType === 'celsius' ? '°C' : '°F'}`),
              img({
                className: `dayIcon ${getIconClassNameWeatherByCode(day3WeatherCode)}`,
                alt: 'weather icon day',
                src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
              })(),
            ]),
          ]),
        ]),
        div({ className: 'mapBlock wrapper' })([
          div({ className: 'map mapboxgl-map', id: 'myMap' })(),
          div({ className: 'latitude' })([div()(`${getTextlatitudelongitude('lat')(language)}:`), div()(`${lat}`)]),
          div({ className: 'longitude' })([div()(`${getTextlatitudelongitude('lng')(language)}:`), div()(`${lng}`)]),
        ]),
      ]),
    ]);
  }
}
