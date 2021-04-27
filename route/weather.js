const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
require('dotenv').config()
const apiKey = process.env.WEATHER_API_KEY;

var weatherData = {};

router.get('/:latlon', async (req, res) => {
    const latlon = req.params.latlon.split(',');
    const fetchUrl = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latlon[0]}&lon=${latlon[1]}&appid=${apiKey}&units=metric`);
    const data = await fetchUrl.json();
    weatherData = data;
    console.log(fetchUrl);
    res.json(data);

    // res.render('weather/weather');
});


router.get('/',  (req, res) => {
   
    res.render('weather/weather', { weatherData: weatherData });
});



module.exports = router;