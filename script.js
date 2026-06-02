const apiKey = "a6bb1c83d5d04b0086870533260106";

// DOM Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeBtn = document.getElementById("themeBtn");
const recentBtn = document.getElementById("recentBtn");
const recentDropdown = document.getElementById("recentDropdown");
const clearRecentBtn = document.getElementById("clearRecentBtn");
const saveFavBtn =document.getElementById("saveFavBtn");
const favoriteBtn =document.getElementById("favoriteBtn");
const clearFavBtn =document.getElementById("clearFavBtn");
const favoritesDropdown =document.getElementById("favoritesDropdown");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const aqi = document.getElementById("aqi");
const uv = document.getElementById("uv");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const weatherIcon = document.getElementById("weatherIcon");
const forecastContainer = document.getElementById("forecastContainer");
const hourlyContainer =document.getElementById("hourlyContainer");
const loader = document.getElementById("loader");
const maxTemp =document.getElementById("maxTemp");
const minTemp =document.getElementById("minTemp");
const rainChance =document.getElementById("rainChance");
const maxWind =document.getElementById("maxWind");
const visibility =document.getElementById("visibility");
const cloudCover =document.getElementById("cloudCover");
let lightningInterval = null;
let forecastData = null;
// Dark Mode
if (localStorage.getItem("theme") === "true") {
    document.body.classList.add("dark");
}
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
    );
});

// Search Button
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city !== "") {
        getWeather(city);
    }
});

// Enter Key
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

// Recent Dropdown Toggle
recentBtn.addEventListener("click", () => {
    recentDropdown.classList.toggle("show");

});

// Clear Recent Searches
clearRecentBtn.addEventListener("click", () => {
    localStorage.removeItem("cities");
    recentDropdown.innerHTML = "";

});

clearFavBtn.addEventListener(
    "click",
    () => {
        const confirmDelete =
        confirm(
            "Clear all favorite cities?"
        );
        if(confirmDelete){
            localStorage.removeItem(
                "favorites"
            );
            favoritesDropdown.innerHTML = "";
            alert(
                "Favorites cleared ✅"
            );
        }
    }
);

// Close Dropdown When Clicking Outside
document.addEventListener("click", (e) => {
    if (
        !recentBtn.contains(e.target) &&
        !recentDropdown.contains(e.target)
    ) {
        recentDropdown.classList.remove("show");
    }
});

// Save Search
function saveSearch(city) {
    let searches =
        JSON.parse(
            localStorage.getItem("cities")
        ) || [];
    if (!searches.includes(city)) {
        searches.push(city);
        localStorage.setItem(
            "cities",
            JSON.stringify(searches)
        );
        displayRecentSearches();
    }
}

// Display Recent Searches
function displayRecentSearches() {
    let searches =
        JSON.parse(
            localStorage.getItem("cities")
        ) || [];
    recentDropdown.innerHTML = "";
    searches
        .slice()
        .reverse()
        .forEach(city => {
            const item =
                document.createElement("div");
            item.textContent = city;
            item.addEventListener("click", () => {
                getWeather(city);
                recentDropdown.classList.remove("show");
            });
            recentDropdown.appendChild(item);
        });
}

function displayFavorites(){
    let favorites =
        JSON.parse(
            localStorage.getItem(
                "favorites"
            )
        ) || [];
    favoritesDropdown.innerHTML = "";
    favorites.forEach(city=>{
        const item =
            document.createElement(
                "div"
            );
        item.innerHTML = `
            ${city}
            <span class="remove-fav">
                ❌
            </span>
        `;
        item.addEventListener(
            "click",
            ()=>{
                getWeather(city);
                favoritesDropdown
                    .classList
                    .remove("show");
            }
        );
        
        favoritesDropdown
            .appendChild(item);
        
        item.querySelector(
            ".remove-fav"
        ).addEventListener(
            "click",
            (e)=>{

                e.stopPropagation();

                removeFavorite(city);
            }
        );
    });
}

favoriteBtn.addEventListener(
    "click",
    ()=>{
        displayFavorites();
        favoritesDropdown
            .classList
            .toggle("show");
    }
);

// Update Weather UI
function updateWeatherUI(data) {
    cityName.textContent =data.location.name;
    temperature.textContent =`${data.current.temp_c}°C`;
    description.textContent =data.current.condition.text;
    console.log("Weather Condition:",data.current.condition.text);
    humidity.textContent =`${data.current.humidity}%`;
    wind.textContent =`${data.current.wind_kph} km/h`;
    feelsLike.textContent =`${data.current.feelslike_c}°C`;
    aqi.textContent =
        data.current.air_quality
            ? data.current.air_quality["us-epa-index"]
            : "N/A";
    uv.textContent =
        data.current.uv;
    weatherIcon.src =
        "https:" +
        data.current.condition.icon;
    weatherIcon.style.display =
        "block";
    updateBackground(
        data.current.condition.text
    );
}

// Update Sunrise / Sunset
function updateAstroData(data) {
    sunrise.textContent =
        data.forecast.forecastday[0]
            .astro.sunrise;
    sunset.textContent =
        data.forecast.forecastday[0]
            .astro.sunset;
}

function updateHighlights(data){
    const today =data.forecast.forecastday[0];
    maxTemp.textContent =`${today.day.maxtemp_c}°C`;
    minTemp.textContent =`${today.day.mintemp_c}°C`;
    rainChance.textContent =`${today.day.daily_chance_of_rain}%`;
    maxWind.textContent =`${today.day.maxwind_kph} km/h`;
    visibility.textContent =`${today.day.avgvis_km} km`;
    cloudCover.textContent =`${data.current.cloud}%`;
}

// Dynamic Background
function updateBackground(condition) {
    console.log("Background Updated:", condition);
    document.title ="Weather - " + condition;
    // Remove old weather effects
    document
        .querySelectorAll(
            ".cloud,.rain-drop,.snowflake"
        )
        .forEach(el => el.remove());
    // Remove old weather classes
    document.body.classList.remove(
        "sunny",
        "cloudy",
        "rainy",
        "snowy",
        "hot",
        "night"
    );
    condition = condition.toLowerCase();
    const temp =
        parseInt(
            temperature.textContent
        );
    const hour =
        new Date().getHours();
    // Remove old stars
    document
        .querySelectorAll(".star")
        .forEach(star => star.remove());
    document.body.classList.remove("night");
    if(hour >= 19 || hour <= 5){
        document.body.classList.add(
            "night"
        );
        createStars();
    }
    if(temp >= 35){
        document.body.classList.add(
            "hot"
        );
    }
    else if(
        condition.includes("thunder")
    ){
        document.body.classList.add(
            "rainy"
        );
        createClouds();
        createRain();
        createLightning();
    }
    else if(
        condition.includes("rain") ||
        condition.includes("drizzle")
    ){
        document.body.classList.add(
            "rainy"
        );
        createClouds();
    createRain();
    }
    else if(
        condition.includes("cloud") ||
        condition.includes("mist") ||
        condition.includes("overcast")
    ){
        document.body.classList.add(
            "cloudy"
        );
        createClouds();
    }
    else if(
        condition.includes("snow")
    ){
        document.body.classList.add(
            "snowy"
        );
        createSnow();
    }
    else{
        document.body.classList.add(
            "sunny"
        );
    }
    console.log("Current Body Class:",document.body.className);
}
// Get Weather by City
async function getWeather(city) {
    loader.style.display = "block";
    try {
        const url =
            `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`;
        const response =await fetch(url);
        const data =await response.json();
        if (data.error) {
            loader.style.display = "none";
            alert(data.error.message);
            return;
        }
        updateWeatherUI(data);
        saveSearch(city);
        await getForecast(city);
        loader.style.display = "none";
    }

    catch (error) {
        loader.style.display = "none";
        console.error(error);
        alert(
            "Failed to fetch weather data"
        );
    }
}

// Forecast
async function getForecast(location) {
    try {
        const url =
            `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3`;
        const response =await fetch(url);
        const data =await response.json();
        forecastData = data;
        updateAstroData(data);
        updateHighlights(data);
        updateHourlyForecast(data.forecast.forecastday[0]);
        forecastContainer.innerHTML = "";
        data.forecast.forecastday.forEach((day,index) => {
            const date =new Date(day.date);
            const dayName =
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday: "short"
                    }
                );
            forecastContainer.innerHTML += `
            <div class="forecast-card"
                onclick="showDayForecast(${index})">
                    <h4 class="forecast-day">
                        ${
                            index === 0
                            ? "Today"
                            : index === 1
                            ? "Tomorrow"
                            : dayName
                        }
                    </h4>
                    <img
                        src="https:${day.day.condition.icon}"
                        alt="Weather">
                    <p>
                        ${day.day.avgtemp_c}°C
                    </p>
                </div>
            `;
        } );
        showDayForecast(0);
    }
    catch (error) {
        console.error(
            "Forecast Error:",
            error
        );
    }
}

// Current Location
locationBtn.addEventListener(
    "click",
    getCurrentLocation
);

function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            loader.style.display = "block";
            const lat =position.coords.latitude;
            const lon =position.coords.longitude;
            try {
                const url =
                    `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=yes`;
                const response =await fetch(url);
                const data =await response.json();
                updateWeatherUI(data);
                await getForecast(
                    `${lat},${lon}`
                );
                loader.style.display = "none";
            }
            catch (error) {
                loader.style.display = "none";
                console.error(error);
                alert(
                    "Unable to fetch location weather"
                );
            }
        },
        () => {
            alert(
                "Location access denied."
            );
        }
    );
}

// Auto Load
window.addEventListener("load", () => {
    displayRecentSearches();
    getCurrentLocation();
    displayFavorites();

});

function createClouds(){
    document
        .querySelectorAll(".cloud")
        .forEach(cloud => cloud.remove());
    for(let i=0;i<6;i++){
        const cloud =
            document.createElement("div");
        cloud.classList.add("cloud");
        cloud.style.top =
            (50 + Math.random() * 250) + "px";
        cloud.style.left =
            (-300 - Math.random() * 500) + "px";
        cloud.style.animationDuration =
            (20 + Math.random() * 20) + "s";
        cloud.style.animationDelay =
            (Math.random() * 10) + "s";
        document.body.appendChild(cloud);
    }
}

function createRain(){
    document
        .querySelectorAll(".rain-drop")
        .forEach(drop => drop.remove());
    for(let i=0;i<120;i++){
        const drop =
            document.createElement("div");
        drop.classList.add("rain-drop");
        drop.style.left =
            Math.random() * window.innerWidth + "px";
        drop.style.top =
            (-Math.random() * 500) + "px";
        drop.style.animationDuration =
            (0.5 + Math.random() * 0.7) + "s";
        drop.style.animationDelay =
            Math.random() * 2 + "s";
        document.body.appendChild(drop);
    }
}

function createLightning(){
    let flash =
        document.querySelector(".lightning");
    if(!flash){
        flash =
            document.createElement("div");
        flash.classList.add(
            "lightning"
        );
        document.body.appendChild(
            flash
        );
    }
    // Stop previous lightning timer
    if(lightningInterval){
        clearInterval(
            lightningInterval
        );
    }
    lightningInterval =
        setInterval(()=>{
            flash.classList.add(
                "flash"
            );
            setTimeout(()=>{
                flash.classList.remove(
                    "flash"
                );
            },300);
        },3000 + Math.random() * 7000);
}

function createSnow(){
    document
        .querySelectorAll(".snowflake")
        .forEach(flake => flake.remove());
    for(let i=0;i<60;i++){
        const flake =
            document.createElement("div");
        flake.classList.add(
            "snowflake"
        );
        flake.innerHTML = "❄";
        flake.style.left =
            Math.random() *
            window.innerWidth + "px";
        flake.style.animationDuration =
            (5 + Math.random()*5) + "s";
        flake.style.animationDelay =
            Math.random()*5 + "s";
        document.body.appendChild(
            flake
        );
    }
}

function updateHourlyForecast(dayData){
    hourlyContainer.innerHTML = "";
    let startHour = 0;
    const today =
        forecastData.forecast.forecastday[0].date;
    if(dayData.date === today){
        startHour =
            new Date().getHours();
    }
    const hours =
        dayData.hour.slice(
            startHour,
            startHour + 12
        );
    hours.forEach((hour,index)=>{
        const time =
            index === 0 &&
            dayData.date === today
            ? "Now"
            : hour.time.split(" ")[1];
        hourlyContainer.innerHTML += `
            <div class="hour-card">
                <div class="temp-value">
                    ${Math.round(hour.temp_c)}°
                </div>
                <img
                    src="https:${hour.condition.icon}"
                    alt="weather">
                <div class="condition-text">
                    ${hour.condition.text}
                </div>
                <div class="time-label">
                    ${time}
                </div>
            </div>
        `;
    });
}

function showDayForecast(index){
    updateHourlyForecast(
        forecastData
            .forecast
            .forecastday[index]
    );

    document
        .querySelectorAll(
            ".forecast-card"
        )
        .forEach(card=>{
            card.classList.remove(
                "active-day"
            );
        });
    document
        .querySelectorAll(
            ".forecast-card"
        )[index]
        .classList.add(
            "active-day"
        );
}

function createStars(){
    document
        .querySelectorAll(".star")
        .forEach(star => star.remove());

    for(let i=0;i<120;i++){
        const star =
            document.createElement("div");
        star.classList.add("star");
        star.style.left =
            Math.random() * window.innerWidth + "px";
        star.style.top =
            Math.random() * window.innerHeight + "px";
        document.body.appendChild(star);
    }
}

saveFavBtn.addEventListener(
    "click",
    ()=>{
        const city =
            cityName.textContent;
        if(
            !city ||
            city === "City Name"
        ){
            return;
        }
        let favorites =
            JSON.parse(
                localStorage.getItem(
                    "favorites"
                )
            ) || [];
        if(
            !favorites.includes(city)
        ){
            favorites.push(city);
            localStorage.setItem(
                "favorites",
                JSON.stringify(
                    favorites
                )
            );
            alert(
                city +
                " added to favorites ⭐"
            );
        }
    }
);

function removeFavorite(city){
    let favorites =
    JSON.parse(
        localStorage.getItem(
            "favorites"
        )
    ) || [];
    favorites =
    favorites.filter(
        fav => fav !== city
    );
    localStorage.setItem(
        "favorites",
        JSON.stringify(
            favorites
        )
    );
    displayFavorites();
}