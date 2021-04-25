const express = require('express');
const route = express.Router();
const Brand = require('../model/brands');
const Product = require('../model/products');
const Supplement = require('../model/supplements');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadPath = path.join('public', Brand.brandImageBasePath);
const imageMimeType = ['image/jpeg', 'image/png', 'image/gifs'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeType.includes(file.mimetype));
    }
});

//index
route.get('/', async (req, res) => {
    let query = Brand.find();
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'));
    }
    try {
        const brands = await query.exec();
        res.render('brands/brands', {
            brands: brands,
            searchOptions: req.query
        });
    } catch {
        res.redirect('/');
    }
});

//index + edit + delete
route.get('/edit', async (req, res) => {
    let query = Brand.find();
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'));
    }
    try {
        const brands = await query.exec();
        res.render('brands/brandsEdit', {
            brands: brands,
            searchOptions: req.query
        });
    } catch {
        res.redirect('/');
    }
});

//new
route.get('/new', async (req, res) => {
    renderFormPage(res, new Brand(), 'new');
});

//post
route.post('/', upload.single('brandImage'), async (req, res) => {
    const fileName = req.file == null ? null : req.file.filename;

    const brand = new Brand({
        name: req.body.name,
        brandImage: fileName
    });
    try {
        const newbrand = await brand.save();
        res.redirect(`/brands/${newbrand.id}`);
    } catch {
        if (brand.brandImage != null) {
            fs.unlink(path.join(uploadPath, fileName), err => {
                if (err) {
                    console.error(err);
                }
            });
        }
        renderNewPage(res, brand, true);
    }
});

//show
route.get('/:id', async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    const productsByThisbrand = await Product.find({ brand: brand });
    const supplementsByThisbrand = await Supplement.find({ brand: brand });
    try {
        res.render(`brands/show`, {
            brand: brand,
            productsByThisbrand: productsByThisbrand,
            supplementsByThisbrand: supplementsByThisbrand
        });
    } catch (error) {
        res.redirect('/brands');
    }
});
//show + Edit + Delete
route.get('/:id/showEdit', async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    const productsByThisbrand = await Product.find({ brand: brand });
    try {
        res.render(`brands/showEdit`, { brand: brand, productsByThisbrand: productsByThisbrand });
    } catch (error) {
        res.redirect('/brands');
    }
});

//edit
route.get('/:id/edit', async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    renderFormPage(res, brand, 'edit');
});

//update
route.put('/:id', upload.single('brandImage'), async (req, res) => {

    let brand;
    const fileName = req.file == null ? null : req.file.filename;
    try {
        brand = await Brand.findById(req.params.id);
        brand.name = req.body.name;
        if (fileName != null) {
            brand.brandImage = fileName;
        } else {

        }
        await brand.save();
        res.redirect(`/brands/${brand.id}`);
    } catch (error) {
        if (brand == null) {
            res.redirect('/')
        } else {
            if (brand.brandImage != null) {
                fs.unlink(path.join(uploadPath, fileName), err => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
            renderFormPage(res, brand, 'edit')
        }
    }
});

//delete
route.delete('/:id', async (req, res) => {
    let brand;
    try {
        brand = await Brand.findById(req.params.id);
        await brand.remove()
        res.redirect('/brands');
    } catch (error) {
        if (brand == null) {
            res.redirect('/');
        } else {
            let alert = require('alert')
            alert("This Brand Has Products");
            res.redirect(`/brands/${brand.id}/showEdit`);
        }
    }
});

const renderFormPage = async (res, brand, form, hasError = false) => {
    try {
        const params = { brand: brand }
        if (hasError) {
            params.errorMessage = 'আবার চেষ্টা করুন'
        }
        res.render(`brands/${form}`, params);

    } catch {
        res.redirect('/brands')
    }
}

module.exports = route;
