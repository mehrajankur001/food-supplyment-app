if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(express.static('public'));

const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(methodOverride('_method'));

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection
db.on('error', err => console.error(err));
db.once('open', () => console.log('Connected to Mongoose'));

//home route
const homeRoute = require('./route/home');
app.use('/', homeRoute);

//Members route
const membersRoute = require('./route/members');
app.use('/members', membersRoute);

//Packages route
const packagesRoute = require('./route/packages');
app.use('/packages', packagesRoute);

//Brand route
const brandsRoute = require('./route/brands');
app.use('/brands', brandsRoute);

//Product route
const productsRoute = require('./route/products');
app.use('/products', productsRoute);

//Supplement route
const supplementsRoute = require('./route/supplements');
app.use('/supplements', supplementsRoute);

//weather route
const weatherRoute = require('./route/weather');
app.use('/weather', weatherRoute);



app.listen(5000, () => console.log("Server Running"));
