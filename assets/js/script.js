//DOM Elements 
var APIKey = "7191d6576aa77f63ca561fdbf6c18598";
var searchButtonEl = document.querySelector("#search-button");
var cityInputEl = document.querySelector("#city-input");
var weatherContainerEl = document.querySelector("#weather-container");
var cityHistoryContainer = document.querySelector("#city-history");
var currentWeatherContEl = document.querySelector("#current-weather-cont")

//City DOM elments
var cityNameEl = document.querySelector("#city-name");
var currentDateEl = document.querySelector("#current-date");
var weatherIconEl = document.querySelector("#weather-icon");
var temperatureEl = document.querySelector("#temperature");
var humidityEl = document.querySelector("#humidity");
var windSpeedEl = document.querySelector("#wind-speed");
var uvIndexEl = document.querySelector("#uv-index");
var cardEl = document.querySelector("#card-row");
var fiveTitelEl = document.querySelector("#five-title");
var date = moment().format('l');



// GIVEN a weather dashboard with form inputs
var formSubmitHandler = async function (event) {
    //stop brower from performing the default action
    event.preventDefault();

    //clear  div data before next city is searched
    clear();

    //get value from input element 
    var city = cityInputEl.value.trim();

    // WHEN I search for a city
    if (city === "") {
        alert("You must enter a city");
        return;
    } else {
        await getWeatherData(city);
        displayWeatherData(city);
        renderSearchHistory();

        // clear old content in form
        cityInputEl.value = "";
    }
};

// THEN I am presented with current and future conditions for that city and that city is added to the search history
var getWeatherData = async function (city) {
    
    // api url for current city information 
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&appid=" + APIKey;

    //make a request to the url 
    var weather = new Promise((resolve, reject) => {
        //fetchin for all current city information 
        fetch(apiUrl)
            .then(function (response) {
                if (response.ok) {
                    response.json().then(function (data) {

                        //fetching for UVI data given lat/lot 
                        var lat = data.coord.lat;
                        var lon = data.coord.lon;
                        var uvUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial" + "&appid=" + APIKey;
                        fetch(uvUrl).then(function (response) {
                            response.json().then(function (uvdata) {
                                //all city information
                                var formatedData = {
                                    city,
                                    icon: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                                    windSpeed: data.wind.speed,
                                    humidity: data.main.humidity,
                                    cityTemperature: data.main.temp,
                                    uvi: uvdata.current.uvi
                                }
                                //store to local storage
                                store.update(formatedData);
                                resolve(formatedData)
                            });

                        });

                    });
                } else {
                    alert("Error: " + response.statusText);
                    reject()
                }
            })
            .catch(function (error) {
                alert("Unable to connect to weather API");
                reject()
            });
    })

    // fetching for five day forecast for given city 
    var fivedayUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&appid=" + APIKey;
    var forecast = new Promise((resolve, reject) => {
        //fetch five data data
        fetch(fivedayUrl).then(function (response) {
            if (response.ok) {
                response.json().then(function (fiveDayData) {
                    //five data data 
                    var fidayFormatedData = {
                        city,
                        fiveDayForecast: []
                    }
                    //loop through all the days and hours of data
                    for (i = 0; i < fiveDayData.list.length; i += 8) {
                        var day = fiveDayData.list[i];
                        fidayFormatedData.fiveDayForecast.push({
                            date: day.dt_txt.substring(0, 10),
                            icon: `https:///openweathermap.org/img/w/${day.weather[0].icon}.png`,
                            temp: day.main.temp,
                            humidity: day.main.humidity

                        })
                    }
                    //store in local storage
                    store.update(fidayFormatedData);
                    resolve(fidayFormatedData)
                });
            } else {
                alert("Error: " + response.statusText);
                reject()
            }
        }).catch(function (error) {
            alert("Unable to connect to weather API");
            reject()
        });
    })
    // return at the same time
    return await Promise.all([weather, forecast]);

};

//display all weather data for current city information and 5 day forecast 
var displayWeatherData = function (city) {
    //get current city information from storage
    var currentCity = store.getCurrentCity(city);

    //display that city's information
    displayCityInfo(currentCity)

    //loop through the days for five day forecast.
    currentCity && currentCity.fiveDayForecast && currentCity.fiveDayForecast.forEach(
        (day) => {
            createForecastCard(day)
        }
    )

}

// WHEN I view current weather conditions for that city
var displayCityInfo = function ({ city, icon, cityTemperature, humidity, windSpeed, uvi }) {

    // THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index

    //create a span element to hold  name 
    var currentCityName = document.createElement("h1")
    currentCityName.innerHTML = city;
    cityNameEl.appendChild(currentCityName);

    //create a span element to hold  date
    var currentDate = document.createElement("h1")
    currentDate.innerHTML = "   (" + date + ")";
    currentDateEl.appendChild(currentDate);

    // //create a span element to hold  icon
    var weatherIcon = document.createElement("img")
    weatherIcon.setAttribute("src", icon);
    weatherIconEl.appendChild(weatherIcon);

    //create element for the temperature
    var temp = document.createElement("p");
    temp.innerHTML = "Temperature: " + cityTemperature + " &#176F";
    temperatureEl.appendChild(temp);

    //create element for the humidity
    var cityHumidty = document.createElement("p");
    cityHumidty.innerHTML = "Humidity: " + humidity + " %";
    humidityEl.appendChild(cityHumidty);

    //create element for the wind speed 
    var cityWindSpeed = document.createElement("p");
    cityWindSpeed.innerHTML = "Wind Speed: " + windSpeed + " MPH";
    windSpeedEl.appendChild(cityWindSpeed);


    // WHEN I view the UV index
    // THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
    var uvIndex = document.createElement("span")
    uvIndex.setAttribute("class", "uv-index");
    uvIndex.style.backgroundColor = "green", "yellow", "orange", "red";
    uvIndex.innerHTML = "UV Index: " + uvi;
    //https://www.epa.gov/sunsafety/uv-index-scale-0
    if (uvi <= 2) {
        backgroundColor = "light green";
    }
    else if (uvi >= 3 || uvi <= 5) {
        backgroundColor = "yellow";
    }
    else if (uvi >= 6 || uvi <= 7) {
        backgroundColor = "orange";
    }
    else {
        backgroundColor = "red";
    }

    uvIndexEl.appendChild(uvIndex);
}

// WHEN I view future weather conditions for that city
var createForecastCard = function ({ date, icon, temp, humidity }) {
    // THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity

    // create card date el
    var cardDateEl = document.createElement("p");
    cardDateEl.setAttribute("class", "card-date mt-2");
    cardDateEl.innerHTML = date;

    //card icon element
    var cardIconEl = document.createElement("img");
    cardIconEl.setAttribute("class", "weather-icon");
    cardIconEl.setAttribute("src", icon);

    //card temp element
    var cardTempEl = document.createElement("p");
    cardTempEl.setAttribute("class", "card-text");
    cardTempEl.innerHTML = "Temp: " + temp + " &#176F";

    //card humdidty element;
    var cardHumidityEl = document.createElement("p")
    cardHumidityEl.setAttribute("class", "card-text mb-2");
    cardHumidityEl.innerHTML = "Humidity: " + humidity + " %";


    //append cards
    var fiveDayCardEl = document.createElement("div");
    fiveDayCardEl.setAttribute("class", "five-day-card col card text-white bg-primary mb-3");
    fiveDayCardEl.append(cardDateEl, cardIconEl, cardTempEl, cardHumidityEl);

    
    cardEl.appendChild(fiveDayCardEl);
    

};

// WHEN I click on a city in the search history
var renderSearchHistory = function () {
    
    var storage = store.getStore();

    //add city to history 
    storage.forEach(({ city }) => {
        var buttonExists = Array.from(cityHistoryContainer.childNodes).find((button) => button.innerText === city)
        if (!buttonExists) {
            var cityHistoryButton = document.createElement("button")
            cityHistoryButton.setAttribute("class", " flex-row list-group history-button card-body");
            cityHistoryButton.setAttribute("type", "submit")
            cityHistoryButton.innerHTML = city;
            cityHistoryContainer.appendChild(cityHistoryButton);
            cityHistoryButton.addEventListener("click", () => {
                clear();
                displayWeatherData(city)
            });
        }

    });

};


// THEN I am again presented with current and future conditions for that city
//set, get, and update local starage 
var store = {
    //gete current city  from local storage 
    getCurrentCity: function (city) {
        var dataStor = JSON.parse(localStorage.getItem("savedHistory")) || [];
        var currentCity = {}
        for (i = 0; i < dataStor.length; i++) {
            if (city === dataStor[i].city) {
                currentCity = dataStor[i];
            }
        }
        return currentCity;
    },
    //update the information in local storage to include five day forecase all all city informaiton
    update: function (data) {
        var dataStor = JSON.parse(localStorage.getItem("savedHistory")) || [];
        var cityObj = {};
        var foundCity = dataStor.find((item) => data.city === item.city)
        if (foundCity) {
            //assign object to new variable 
            cityObj = Object.assign(foundCity, data); 
            //merge dataStor city with new city information
            dataStor.concat([cityObj])
        } else {
            dataStor.push(data)
        }

        //set all information in storage so it persists on reload 
        localStorage.setItem("savedHistory", JSON.stringify(dataStor));
    },
    
    
    getStore: function () {
        var dataStor = JSON.parse(localStorage.getItem("savedHistory")) || [];
        return dataStor;
    }

}

//clear data before next search
var clear = function () {
    cityNameEl.innerHTML = "";
    cityNameEl.innerHTML = "";
    currentDateEl.innerHTML = "";
    weatherIconEl.innerHTML = "";
    temperatureEl.innerHTML = "";
    humidityEl.innerHTML = "";
    windSpeedEl.innerHTML = "";
    uvIndexEl.innerHTML = "";
    cardEl.innerHTML = "";
};

//event listeners for search click
searchButtonEl.addEventListener("click", formSubmitHandler);

//make sure search history is visible even on refresh
renderSearchHistory();



