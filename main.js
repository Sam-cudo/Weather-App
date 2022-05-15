const config = {
  cUrl: "https://api.countrystatecity.in/v1/countries",
  cKey: "UzhXUTBFVERwN2FudHFIN3RvcWJKTDlJYUpscU11d0xKbGQxNkJEaQ==",
  wUrl: "https://api.openweathermap.org/data/2.5/",
  wKey: "cf87a9e4938d8fbf85f279a3b8c2e0aa",
};
// get countries states and cities

const getCountries = async (fieldName, ...args) => {
  let apiEndPoint;
  switch (fieldName) {
    case "countries":
      apiEndPoint = config.cUrl;
      break;
    case "states":
      apiEndPoint = `${config.cUrl}/${args[0]}/states`;
      break;
    case "cities":
      apiEndPoint = `${config.cUrl}/${args[0]}/states/${args[1]}/cities`;
    default:
  }

  const response = await fetch(apiEndPoint, {
    headers: { "X-CSCAPI-KEY": config.cKey },
  });
  if (response.status != 200) {
    throw new Error(`Something went wrong, status code: ${response.status}`);
  }
  const countries = await response.json();
  return countries;
};
// get weather info

const getWeather = async (cityName, ccode, units = "metric") => {
  const apiEndPoint = `${
    config.wUrl
  }weather?q=${cityName},${ccode.toLowerCase()}&APPID=${
    config.wKey
  }&units=${units}`;

  try {
    const response = await fetch(apiEndPoint);
    if (response.status != 200) {
      if (response.status == 404) {
        weatherDiv.innerHTML = `<div class="alert-danger">
                              <h3>Oops! No data available.</h3>
                              </div>`;
      } else {
        throw new Error(
          `Something went wrong, status code: ${response.status}`
        );
      }
    }
    const weather = await response.json();
    return weather;
  } catch (error) {
    console.log(error);
  }
};

const getDateTime = (unixTimeStamp) => {
  const milliSeconds = unixTimeStamp * 1000;
  const dateObject = new Date(milliSeconds);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const humanDateFormate = dateObject.toLocaleDateString("en-US", options);
  return humanDateFormate;
};

const displayWeather = (data) => {
  const wheatherWidget = `<div class="card">
    <div class="card-body">
        <h5 class="card-title">${data.name}, ${
    data.sys.country
  } 
        </h5>
        <p>${getDateTime(data.dt)}</p>
        <div id="tempcard"><h6 class="card-subtitle mb2 cel"> ${data.main.temp}</h6>
        <p class="card-text">Feels Like: ${data.main.temp}</p>
        <p class="card-text">Max: ${data.main.temp_max}°C, Min: ${data.main.temp_min}°C</p></div>
        ${data.weather
          .map(
            (
              w
            ) => `<div id="img-container">${w.main} <img src="https://openweathermap.org/img/wn/${w.icon}.png" /></div>
        <p>${w.description}</p>`
          )
          .join("\n")}
        
    </div>
</div>`;
  weatherDiv.innerHTML = wheatherWidget;
};

const getLoader = () => {
  return `<div class="spinner-grow text-info" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>`;
};

const countriesListDropDown = document.querySelector("#countrylist");
const statesListDropDown = document.querySelector("#statelist");
const citiesListDropDown = document.querySelector("#citylist");
const weatherDiv = document.querySelector("#weatherwidget");

// on content load
document.addEventListener("DOMContentLoaded", async () => {
  const countries = await getCountries("countries");
  //console.log(countries);
  let countriesOptions = "";
  if (countries) {
    countriesOptions += `<option value="">Country</option>`;
    countries.forEach((coutry) => {
      countriesOptions += `<option value="${coutry.iso2}">${coutry.name}</option>`;
    });

    countriesListDropDown.innerHTML = countriesOptions;
  }

  // list states
  countriesListDropDown.addEventListener("change", async function () {
    const selectedCountryCode = this.value;
    const states = await getCountries("states", selectedCountryCode);
    //console.log(states);
    let statesOptions = "";
    if (states) {
      statesOptions += `<option value="">State</option>`;
      states.forEach((state) => {
        statesOptions += `<option value="${state.iso2}">${state.name}</option>`;
      });
      statesListDropDown.innerHTML = statesOptions;
      statesListDropDown.disabled = false;
      citiesListDropDown.innerHTML = "";
    }
  });
  // list cities
  statesListDropDown.addEventListener("change", async function () {
    const selectedCountryCode = countriesListDropDown.value;
    const selectedStateCode = this.value;
    const cities = await getCountries(
      "cities",
      selectedCountryCode,
      selectedStateCode
    );
    //  console.log(cities);
    let citiesOptions = "";
    if (cities) {
      citiesOptions += `<option value="">City</option>`;
      cities.forEach((city) => {
        citiesOptions += `<option value="${city.name}">${city.name}</option>`;
      });
      citiesListDropDown.innerHTML = citiesOptions;
      citiesListDropDown.disabled = false;
    }
  });

  // select city
  citiesListDropDown.addEventListener("change", async function () {
    const selectedCountryCode = countriesListDropDown.value;
    const selectedCity = this.value;
    weatherDiv.innerHTML = getLoader();
    const weatherInfo = await getWeather(selectedCity, selectedCountryCode);
    displayWeather(weatherInfo);
  });
});
