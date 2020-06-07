export const getLinkToImage = (country) => {
  const query = country || 'weather';
  const url = `https://api.unsplash.com/photos/random?query=nature,${query}&client_id=rjhf5geMep5Pn0Eks7lohms6C3fUsxZGwI01fyttif8`;
  // console.log(url);
  return fetch(url)
    .then((res) => res.json())
    .then((data) => data.urls.regular)
    .catch(() => '');
};

export const getLocation = (language, city) => {
  if (city) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=4aa14e9b45154a43a9fbe33f6307bad9&language=${language}&pretty=1`;
    return fetch(url)
      .then((res) => res.json())
      .then((res) => res);
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  }).then((pos) => {
    const crd = pos.coords;
    const lat = crd.latitude;
    const lng = crd.longitude;
    const q = `${lat},${lng}`;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${q}&key=4aa14e9b45154a43a9fbe33f6307bad9&language=${language}&pretty=1`;
    return fetch(url)
      .then((res) => res.json())
      .then((res) => res);
  });
};

export const getWeather = (city, country) => {
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&country=${country}&days=4&key=e6c68e83b219470ab0a7c464e2aa0b78`;
  return fetch(url)
    .then((res) => res.json())
    .then((res) => res);
};

/* eslint-disable no-undef */
/* eslint-disable new-cap */

export const getRecognition = () => {
  const grammar = '#JSGF V1.0; grammar weather; public <weather> = weather | forecast| louder | quieter ;';
  const recognition = new webkitSpeechRecognition();
  const speechRecognitionList = new webkitSpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;
  recognition.continuous = true;

  return recognition;
};


export const getVoicedmsg = (text, voice, volume) => {
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance();
  msg.volume = volume ?? 0.7;
  msg.rate = 1;
  msg.pitch = 1;
  msg.text = text;
  msg.voice = voice;
  speechSynthesis.speak(msg);
  return msg;
};
