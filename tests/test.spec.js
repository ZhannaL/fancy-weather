import {
  getPlaceholder,
  getTextButtonSearch,
  getTepmByType,
  getShortWeatherByCode,
} from '../js/helpers';

describe('helpers tests', () => {
  it('test placeholder, check by language', () => {
    expect(getPlaceholder('en')).toBe('search city');
    expect(getPlaceholder('ru')).toBe('поиск города');
    expect(getPlaceholder('pl')).toBe('szukaj miasta');
  });

  it('test text in button search, check by language', () => {
    expect(getTextButtonSearch('en')).toBe('search');
    expect(getTextButtonSearch('ru')).toBe('поиск');
    expect(getTextButtonSearch('pl')).toBe('szukaj');
  });

  it('test temperature, Celsius to Fahrenheit conversion', () => {
    expect(getTepmByType(12)).toBe(Math.ceil(53.6));
    expect(getTepmByType(26)).toBe(Math.ceil(78.8));
    expect(getTepmByType(0)).toBe(Math.ceil(32));
    expect(getTepmByType(-7)).toBe(Math.ceil(19.4));
  });

  it('test get short description of weather', () => {
    expect(getShortWeatherByCode(230)).toBe('thunder');
    expect(getShortWeatherByCode(301)).toBe('drizzle');
    expect(getShortWeatherByCode(511)).toBe('rain');
    expect(getShortWeatherByCode(612)).toBe('snow');
    expect(getShortWeatherByCode('other')).toBe('weather');
  });

  it('check Error', () => {
    expect(() => getPlaceholder('fr')).toThrow(Error);
    expect(() => getPlaceholder('fr')).toThrowError(
      new Error('Sorry, we dont know this language.'),
    );
    expect(() => getTextButtonSearch('fr')).toThrowError(
      new Error('Sorry, we dont know this language.'),
    );
  });
});
