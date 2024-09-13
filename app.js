// Replace with your OpenWeatherMap API key
const apiKey = '9505fd1df737e20152fbd78cdb289b6a';
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${apiKey}`;
const hourlyForecastUrl = `https://api.openweathermap.org/data/2.5/onecall?exclude=daily,minutely,alerts&units=metric&appid=${apiKey}`;
const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid=${apiKey}`;

// DOM Elements
const cityElement = document.querySelector('.name');
const form = document.querySelector("#weather-form");
const temperatureElement = document.querySelector('.temperature');
const descriptionElement = document.querySelector('.description');
const valueSearch = document.getElementById('name');
const cloudsElement = document.getElementById('clouds');
const humidityElement = document.getElementById('humidity');
const pressureElement = document.getElementById('pressure');
const pollutionElement = document.getElementById('pollution');
const playlistItem = document.getElementById('playlist-item');
const recommendationsElement = document.querySelector('.recommendations');
const main = document.querySelector('main');
const themeToggle = document.querySelector('.theme-toggle');

// Default location
const defaultLocation = 'Coimbatore';

// Event listener for form submission
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (valueSearch.value.trim() !== '') {
        searchWeather(valueSearch.value.trim());
    } else {
        showError("Please enter a city name.");
    }
});

// Function to fetch weather data
const searchWeather = (cityName) => {
    fetch(`${weatherUrl}&q=${cityName}`)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                updateWeatherInfo(data);
                fetchPollutionData(data.coord.lat, data.coord.lon);
                updateRecommendations(data);
            } else {
                showError("City not found.");
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            showError("An error occurred while fetching the weather data.");
        });
};

// Function to fetch pollution data
const fetchPollutionData = (lat, lon) => {
    const formattedPollutionUrl = pollutionUrl.replace('{lat}', lat).replace('{lon}', lon);
    fetch(formattedPollutionUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.list && data.list.length > 0) {
                pollutionElement.innerText = data.list[0].components.pm10 || 'Data not available';
            } else {
                pollutionElement.innerText = 'Data not available';
            }
        })
        .catch(error => {
            console.error('Error fetching pollution data:', error);
            pollutionElement.innerText = 'Error';
        });
};

// Function to update weather info
const updateWeatherInfo = (data) => {
    cityElement.querySelector('figcaption').innerHTML = data.name;
    cityElement.querySelector('img').src = `https://flagsapi.com/${data.sys.country}/shiny/32.png`;
    temperatureElement.querySelector('img').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    temperatureElement.querySelector('span').innerText = data.main.temp;
    descriptionElement.innerText = data.weather[0].description;

    cloudsElement.innerText = data.clouds.all;
    humidityElement.innerText = data.main.humidity;
    pressureElement.innerText = data.main.pressure;

    // Dynamic background change based on weather conditions
    const weatherMain = data.weather[0].main.toLowerCase();
    if (weatherMain.includes('clear')) {
        main.style.backgroundImage = "url('https://example.com/sunny-image.jpg')";
    } else if (weatherMain.includes('rain')) {
        main.style.backgroundImage = "url('https://example.com/rainy-image.jpg')";
    } else if (weatherMain.includes('cloud')) {
        main.style.backgroundImage = "url('https://example.com/cloudy-image.jpg')";
    } else {
        main.style.backgroundImage = "url('https://example.com/default-climate-image.jpg')";
    }
};

// Function to update recommendations based on weather
const updateRecommendations = (data) => {
    recommendationsElement.innerHTML = ''; // Clear previous recommendations
    const temp = data.main.temp;

    let clothingRecommendation = '';
    let activityRecommendation = '';
    let playlist = '';

    if (temp > 25) {
        clothingRecommendation = 'Wear light clothing like shorts and a t-shirt.';
        activityRecommendation = 'Great day for a walk in the park or a bike ride.';
        playlist = 'https://open.spotify.com/search/summer'; // Replace with your summer playlist URL
    } else if (temp > 15) {
        clothingRecommendation = 'Wear a light jacket or sweater.';
        activityRecommendation = 'Ideal for outdoor activities like hiking or jogging.';
        playlist = 'https://open.spotify.com/search/moody'; // Replace with your fall playlist URL
    } else if (temp > 5) {
        clothingRecommendation = 'Dress warmly with a coat and layers.';
        activityRecommendation = 'Perfect for cozy indoor activities or a brisk walk.';
        playlist = 'https://open.spotify.com/search/cool%20weather'; // Replace with your winter playlist URL
    } else {
        clothingRecommendation = 'Bundle up with heavy winter clothing and stay warm.';
        activityRecommendation = 'Best for indoor activities or a quick trip outside.';
        playlist = 'https://open.spotify.com/search/sad'; // Replace with your indoor playlist URL
    }

    // Add recommendations to the section
    recommendationsElement.innerHTML = `
        <div class="recommendation-item">${clothingRecommendation}</div>
        <div class="recommendation-item">${activityRecommendation}</div>
    `;

    // Update the playlist recommendation
    playlistItem.innerHTML = `
        <a href="${playlist}" class="playlist-link" target="_blank">YOUR SUGGESTED PLAYLIST HERE!!</a>
    `;
};

// Function to show error message
const showError = (message) => {
    main.classList.add('error');
    setTimeout(() => main.classList.remove('error'), 300);
    alert(message);
};

// Event listener for theme toggle button
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});

// Set default location to Coimbatore on page load
window.addEventListener('load', () => {
    searchWeather(defaultLocation);
});

// Autocomplete functionality
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('name');
    const autocompleteContainer = document.getElementById('autocomplete-container');
    
    // API endpoint and key (replace with your own API key)
    const geoNamesAPIUrl = 'http://api.geonames.org/searchJSON';
    const geoNamesAPIKey = 'your_api_key';  // Replace with your GeoNames API key

    input.addEventListener('input', async () => {
        const query = input.value.trim();
        autocompleteContainer.innerHTML = ''; // Clear previous suggestions

        if (query) {
            try {
                const response = await fetch(`${geoNamesAPIUrl}?q=${query}&maxRows=10&username=${geoNamesAPIKey}`);
                const data = await response.json();
                const suggestions = data.geonames || [];

                suggestions.forEach(suggestion => {
                    const div = document.createElement('div');
                    div.textContent = `${suggestion.name}, ${suggestion.countryName}`;
                    div.classList.add('autocomplete-item');
                    div.addEventListener('click', () => {
                        input.value = `${suggestion.name}, ${suggestion.countryName}`;
                        autocompleteContainer.innerHTML = ''; // Clear suggestions
                    });
                    autocompleteContainer.appendChild(div);
                });
            } catch (error) {
                console.error('Error fetching city suggestions:', error);
            }
        }
    });

    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!autocompleteContainer.contains(e.target) && e.target !== input) {
            autocompleteContainer.innerHTML = '';
        }
    });
});
// Replace with your GeoNames API key
const geoNamesAPIKey = 'your_geo_names_api_key';  // Replace with your GeoNames API key
const geoNamesAPIUrl = 'http://api.geonames.org/searchJSON';

// DOM Elements
const input = document.getElementById('name');
const autocompleteContainer = document.getElementById('autocomplete-container');

// Function to fetch city suggestions
const fetchCitySuggestions = async (query) => {
    try {
        const response = await fetch(`${geoNamesAPIUrl}?q=${query}&maxRows=10&username=${geoNamesAPIKey}`);
        const data = await response.json();
        return data.geonames || [];
    } catch (error) {
        console.error('Error fetching city suggestions:', error);
        return [];
    }
};

// Function to display city suggestions
const displaySuggestions = (suggestions) => {
    autocompleteContainer.innerHTML = ''; // Clear previous suggestions

    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.textContent = `${suggestion.name}, ${suggestion.countryName}`;
        div.classList.add('autocomplete-item');
        div.addEventListener('click', () => {
            input.value = `${suggestion.name}, ${suggestion.countryName}`;
            autocompleteContainer.innerHTML = ''; // Clear suggestions
            searchWeather(suggestion.name);
        });
        autocompleteContainer.appendChild(div);
    });
};

// Event listener for input field
input.addEventListener('input', async () => {
    const query = input.value.trim();
    if (query) {
        const suggestions = await fetchCitySuggestions(query);
        displaySuggestions(suggestions);
    } else {
        autocompleteContainer.innerHTML = ''; // Clear suggestions if input is empty
    }
});

// Hide autocomplete when clicking outside
document.addEventListener('click', (e) => {
    if (!autocompleteContainer.contains(e.target) && e.target !== input) {
        autocompleteContainer.innerHTML = '';
    }
});
input.addEventListener('input', async () => {
    const query = input.value.trim();
    console.log(`Query: ${query}`); // Check if query is being captured

    if (query) {
        try {
            const suggestions = await fetchCitySuggestions(query);
            console.log('Suggestions:', suggestions); // Check fetched suggestions
            displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching city suggestions:', error);
        }
    } else {
        autocompleteContainer.innerHTML = ''; // Clear suggestions if input is empty
    }
});
