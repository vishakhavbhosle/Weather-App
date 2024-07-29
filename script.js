const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

// variables
let currentTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
currentTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(clickedTab) {

    if (clickedTab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            getfromSessionStorage();
        }
    }
} 

userTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});


searchTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// check if coordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if(!localCoordinates) {
        // if no local coordinates are there
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}


async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates; 

    // make grant container invisible
    grantAccessContainer.classList.remove("active");

    // make loader visible
    loadingScreen.classList.add("active");

    // api call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        if(!data.sys) {
            throw data;
        }

        loadingScreen.classList.remove("active");

        userInfoContainer.classList.add("active");

        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        notFound.classList.add("active");
        errorImage.style.display = "none";
        errorText.innerText = `Error: ${err?.message}`;
        errorBtn.style.display = "block";
        errorBtn.addEventListener("click", fetchUserWeatherInfo);
    }
}

// render weather on UI
function renderWeatherInfo(weatherInfo) {

    // fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryFlag = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");


    // fetch values from weatherInfo object and put in UI elements
    cityName.innerText = weatherInfo?.name;

    countryFlag.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;

    desc.innerText = weatherInfo?.weather?.[0]?.description;

    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;

    temp.innerText = `${weatherInfo?.main?.temp.toFixed(2)} °C`;

    windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)} m/s`;

    humidity.innerText = `${weatherInfo?.main?.humidity.toFixed(2)} %`;

    cloudiness.innerText = `${weatherInfo?.clouds?.all.toFixed(2)} %`;
}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        grantAccessButton.style.display = "none";
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));

    // show on UI
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

// search for weather
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    let cityName = searchInput.value;

    if(cityName === "")
        return;

    fetchSearchWeatherInfo(cityName);
    cityName = "";
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);

        const data = await response.json();

        if(!data.sys) {
            throw data;
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
    }
}
