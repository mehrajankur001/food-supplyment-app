navigator.geolocation.getCurrentPosition(async position => {
    const data = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }
    const option = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(data)
    }
    const response = await fetch(`/weather/${data.lat},${data.lon}`);
    const json = await response.json();

    //Weather Right Now

    const currentWeatherImgIrl = `http://openweathermap.org/img/wn/${json.current.weather[0].icon}@2x.png`
    $('#temp_right_now').text(json.current.temp);
    $('#your_location').text(json.timezone);
    document.getElementById('current_weather_img').src = currentWeatherImgIrl;
    console.log(currentWeatherImgIrl)

    //Hourly Weather
    var today = new Date();
    var currentHour = today.getHours();
    console.log(currentHour)

    var time = today.toLocaleString('en-US', { hour: 'numeric', hour12: true })
    console.log(time);

    var amPm;
    if (currentHour > 11) {
        amPm = 'pm';
        if (currentHour > 12) {
            currentHour -= 12;
        }
    } else amPm = 'am'
    json.hourly.forEach(hour => {

        const hourlyWeatherImgIrl = `http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`

        if (currentHour > 11 && amPm === 'am') {
            amPm = 'pm'
        }
        else if (currentHour > 11 && amPm === 'pm') {
            amPm = 'am'
        }


        $('.box')
            .append($(`<div class = 'item' >

                    <h3>Temp: <span id="temp_hourly">${hour.temp}°C &nbsp ${currentHour}${amPm}</span></h3> 
                    
                    <img src=${hourlyWeatherImgIrl} alt="weatherIcom" class="img">
                    
                    </div>`));



        if (currentHour === 12) {
            ++currentHour;
            currentHour -= 12;
        }
        else currentHour++;


    });



});

$('.owl-carousel').owlCarousel({
    autoplay: false,
    autoplayHoverPause: true,
    autoplayTimeout: 5000,
    loop: false,
    slideBy: 3,
    nav: true,
    dots: false,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 3
        },
        1200: {
            items: 7
        }
    }
})

window.screen = () => {
    if (this.screen < 600) {
        console.log(this.screen)
    }
}

