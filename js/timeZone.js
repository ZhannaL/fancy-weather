import { Component } from './createElement';
import { div } from './tags';
import {
  getLocal,
} from './helpers';

export default class TimeZone extends Component {
  state ={
    currentTime: new Date(),
  }

  componentDidMount() {
    this.interval = setInterval(() => this.setState({ currentTime: new Date() }), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { timeZone, language } = this.props;
    const { currentTime } = this.state;

    const local = getLocal(language);

    const dayWeek = currentTime.toLocaleString(local, { weekday: 'short', ...(timeZone ? { timeZone } : null) });
    const stringTimeDay = currentTime.toLocaleString(local, { dateStyle: 'medium', ...(timeZone ? { timeZone } : null) }).split(' ');
    const time = currentTime.toLocaleString(local, { timeStyle: 'short', ...(timeZone ? { timeZone } : null) });

    return div()(`${dayWeek} ${stringTimeDay[0]} ${stringTimeDay[1]} ${time}`);
  }
}
