const express = require('express');
const route = express.Router();

const Package = require('../model/packages');
const Supplement = require('../model/supplements');
const Product = require('../model/products');
const Brand = require('../model/brands');

route.get('/', async (req, res) => {
    const products = await Product.find({});
    const brands = await Brand.find({});
    const packages = await Package.find({});

    let recentSupplement, oldSupplement, recentProducts, oldProducts

    recentProducts = await Product.find().sort({ createdAt: 'desc' }).limit(12).exec();
    oldProducts = await Product.find().sort({ createdAt: 'asc' }).limit(12).exec();
    recentSupplement = await Supplement.find().sort({ createdAt: 'desc' }).limit(12).exec();
    oldSupplement = await Supplement.find().sort({ createdAt: 'asc' }).limit(12).exec();
    try {
        const params = {
            products: products,
            brands: brands,
            packages: packages,
            recentSupplement: recentSupplement,
            oldSupplement: oldSupplement,
            recentProducts: recentProducts,
            oldProducts: oldProducts,
        }
        res.render('home.ejs', params)
    } catch (error) {
        recentSupplement = [];
        oldSupplement = [];
        recentProducts = [];
        oldProducts = [];
        res.redirect('/products');
    }
});
route.get('/api', async (req, res) => {
    const products = await Product.find({});
    const brands = await Brand.find({});
    try {
        const params = { products: products, brands: brands }
        res.json(params);

    } catch (error) {
        res.redirect('/products');
    }
});

module.exports = route;
