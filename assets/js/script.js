//DOM Elements 
var APIKey = "7191d6576aa77f63ca561fdbf6c18598";
var searchButtonEl = document.querySelector("#search-button");
var cityInputEl = document.querySelector("#city-input");
var cityHistoryContainer = document.querySelector("#city-history");

//City DOM elments
var cityNameEl = document.querySelector("#city-name");
var currentDateEl = document.querySelector("#current-date");
var weatherIconEl = document.querySelector("#weather-icon");
var temperatureEl = document.querySelector("#temperature");
var humidityEl = document.querySelector("#humidity");
var windSpeedEl = document.querySelector("#wind-speed");
var uvIndexEl = document.querySelector("#uv-index");
var cardEl = document.querySelector(".card-row")
var date = moment().format('l');



// GIVEN a weather dashboard with form inputs
//form submission event 
var formSubmitHandler = function(event) {
    //stop brower from performing the default action
    event.preventDefault();

    //get value from input element 
    var city = cityInputEl.value.trim();

    // WHEN I search for a city
    if(city === ""){
        alert("You must enter a city");
        return;
    } else {
        getWeatherData(city);
    }



};

// THEN I am presented with current and future conditions for that city and that city is added to the search history
var getWeatherData = function (city) {
    // var cityName
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
    //console.log(apiUrl);

    //make a request to the url 
    fetch(apiUrl)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    //console.log(data)
                    displayCityInfo (city, data); 


                     //add city to history 
                    var cityHistoryEl = document.createElement("card")
                    cityHistoryEl.classList = "list-item flex-row justify-space-between align-center";
                    cityHistoryEl.innerHTML = city;
                    cityHistoryContainer.appendChild(cityHistoryEl);
                });    
            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function(error) {
            alert("Unable to connect to weather API");
        });

    
   
};


// WHEN I view current weather conditions for that city
var displayCityInfo = function (city , data) {


    // THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, the wind speed, and the UV index
    //create a span element to hold  name 
    var currentCityName = document.createElement("h1")
    currentCityName.innerHTML = city;
    cityNameEl.appendChild(currentCityName);

    //create a span element to hold  date
    var currentDate = document.createElement("h1")
    currentDate.innerHTML = "(" + date + ")";
    currentDateEl.appendChild(currentDate);

    // //create a span element to hold  icon
    var weatherIcon = document.createElement("img")
    weatherIcon.innerContent = data.weather[0].icon;
    weatherIcon.setAttribute("src" , "http://openweathermap.org/img/wn/10d@2x.png");
    weatherIcon.setAttribute("alt", data.weather[0].description);
    weatherIconEl.appendChild(weatherIcon);

    //create element for the temperature
    var cityTemperature = document.createElement("p");
    cityTemperature.innerHTML = "Temperature: " + data.main.temp + " &#176F";
    temperatureEl.appendChild(cityTemperature); 

    //create element for the humidity
    var cityHumidty = document.createElement("p");
    cityHumidty.innerHTML = "Humidity: " + data.main.humidity + " %";
    humidityEl.appendChild(cityHumidty);

    //create element for the wind speed 
    var cityWindSpeed = document.createElement("p");
    cityWindSpeed.innerHTML = "Wind Speed: " + data.wind.speed + " MPH";
    windSpeedEl.appendChild(cityWindSpeed);


    //create element for UV index
    var lat =  data.coord.lat;
    var lon = data.coord.lon;
    var uvUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;
    fetch(uvUrl).then(function(response) {
        //console.log(response);
        var uvIndex = document.createElement("span")
        uvIndex.innerHTML = "UV Index: " + response.current;
        uvIndexEl.appendChild(uvIndex);

    });



    // get 5 dauy forecast data 
    var fivedayUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=" + APIKey;
    fetch(fivedayUrl).then(function(response) {
        //loop through
        for (i = 0; i < response.list.length; i+=8 ) {
            var cityObj = {
                date: response.list[i].dt_txt,
                icon: response.list[i].weather[0].icon,
                temp: response.list[i].main.temp,
                humidity: response.list[i].main.humidity
            }

            var dateStr = cityObj.date;
            var trimmedDate = dateStr.substring(0, 10); 
            var weatherIcon = `https:///openweathermap.org/img/w/${cityObj.icon}.png`;

            

            // create card date el
            var cardDateEl = document.createElement("h3");
            cardDateEl.setAttribute("class", "card-text");
            cardDate.innerHTML= trimmedDate;

            //card icon elemtnt
            var cardIconEl = document.createElement("img");
            cardIconEl.setAttribute("class", "weather-icon");
            cardIconEl.setAttribute("src", weatherIcon);

            //card temp elemtnt
            var cardTempEl = document.createElement("p");
            cardTempEl.setAttribute("class", "card-text");
            cardTempEl.innerHTML = `Temp: ${temp}  &#176F`;
            
            //card humdidty elemtnt;
            var cardHumidityEl = document.createElement("p")
            cardHumidityEl.setAttribute("class", "card-text");
            cardHumidityEl.innerHTML = `Humidity: ${humidity} %`;
            
            
            //append cards
            var fiveDayCardEl = document.createElement("div");
            fiveDayCardEl.setAttribute("class", "five-day-card");
            fiveDayCardEl.append(cardDateEl, cardIconEl, cardTempEL, cardHumidityEl);

            cardRow.appendChild(fiveDayCardEl);
            
        }  

        // for (i=0; i<forecastEls.length; i++) {
        //     forecastEls[i].innerHTML = "";
        //     var forecastIndex = i*8 + 4;
        //     var forecastDate = response.list[forecastIndex].dt;
        //     var forecastDateEl = document.createElement("p");
        //     forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date");
        //     forecastDateEl.innerHTML = forecastMonth + "/" + forecastDay + "/" + forecastYear;
        //     forecastEls[i].append(forecastDateEl);

        //     //icon of 5 weather condtions 
        //     var forecastWeatherEl = document.createElement("img");
        //     forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
        //     forecastWeatherEl.setAttribute("alt",response.data.list[forecastIndex].weather[0].description);
        //     forecastEls[i].append(forecastWeatherEl);

        //     //temp of 5 day
        //     var forecastTempEl = document.createElement("p");
        //     forecastTempEl.innerHTML = "Temp: " + k2f(response.data.list[forecastIndex].main.temp) + " &#176F";
        //     forecastEls[i].append(forecastTempEl);

        //     //humidy of 5 dat
        //     var forecastHumidityEl = document.createElement("p");
        //     forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
        //     forecastEls[i].append(forecastHumidityEl);
            
        // }
    });
    
    
}

var forecastCard = function () {

}

// WHEN I view the UV index
// THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
// WHEN I view future weather conditions for that city
// THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, and the humidity
// WHEN I click on a city in the search history
// THEN I am again presented with current and future conditions for that city







//event listeners 

searchButtonEl.addEventListener("click", formSubmitHandler);
    

