const express = require('express');
const router = express.Router();

const Product = require('../model/products');
const Brand = require('../model/brands');

const fs = require('fs');
const path = require('path');

const uploadPath = path.join('public', Product.coverImageBasePath);
const imageMimeType = ['image/jpeg', 'image/png', 'image/gifs'];

const multer = require('multer');
const upload = multer({
    dest: uploadPath,
    fileFilter: (res, file, callBack) => {
        callBack(null, imageMimeType.includes(file.mimetype));
    }
})

//index
router.get('/', async (req, res) => {

    let query = Product.find();
    const brands = await Brand.find();

    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.lowerThan != null && req.query.lowerThan != '') {
        query = query.lte('price', req.query.lowerThan);
    }
    if (req.query.greaterThan != null && req.query.greaterThan != '') {
        query = query.gte('price', req.query.greaterThan);
    }

    let recentProducts, oldProducts

    try {
        const products = await query.exec();
        recentProducts = await Product.find().sort({ createdAt: 'desc' }).limit(12).exec();
        oldProducts = await Product.find().sort({ createdAt: 'asc' }).limit(12).exec();

        res.render('products/products', {
            products: products,
            brands: brands,
            recentProducts: recentProducts,
            oldProducts: oldProducts,
            searchOptions: req.query
        });
    } catch {
        recentProducts = []
        oldProducts = []
        res.redirect('/');
    }
});

//index + edit 
router.get('/edit', async (req, res) => {

    let query = Product.find();
    const brands = await Brand.find();

    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    let recentProducts, oldProducts

    try {
        const products = await query.exec();
        recentProducts = await Product.find().sort({ createdAt: 'desc' }).limit(12).exec();
        oldProducts = await Product.find().sort({ createdAt: 'asc' }).limit(12).exec();

        res.render('products/productsEdit', {
            products: products,
            brands: brands,
            recentProducts: recentProducts,
            oldProducts: oldProducts,
            searchOptions: req.query
        });
    } catch {
        recentProducts = []
        oldProducts = []
        res.redirect('/');
    }
});


//new
router.get('/new', async (req, res) => {
    renderFormPage(res, new Product(), 'new');
})


//post
router.post('/', upload.single('coverImage'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const product = new Product({
        title: req.body.title,
        brand: req.body.brand,
        publishDate: req.body.publishDate,
        price: req.body.price,
        description: req.body.description,
        coverImage: fileName
    });

    try {
        const newproduct = await product.save();
        res.redirect(`/products/${newproduct.id}`);
    } catch {
        if (product.coverImage != null) {
            fs.unlink(path.join(uploadPath, fileName), err => {
                if (err) {
                    console.error(err);
                }
            })
        }
        renderFormPage(res, product, 'new', true);
    }

});

//show
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('brand').exec();
    try {
        res.render('products/show', { product: product });
    } catch (error) {
        res.redirect('/products');
    }
});

//show + edit
router.get('/:id/showEdit', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('brand').exec();
    try {
        res.render('products/showEdit', { product: product });
    } catch (error) {
        res.redirect('/products');
    }
});


//edit
router.get('/:id/edit', async (req, res) => {
    const product = await Product.findById(req.params.id);
    renderFormPage(res, product, 'edit');
});

//update
router.put('/:id', upload.single('coverImage'), async (req, res) => {
    const imageFile = req.file != null ? req.file.filename : null
    let product;
    try {
        product = await Product.findById(req.params.id);
        product.title = req.body.title;
        product.brand = req.body.brand;
        product.publishDate = req.body.publishDate;
        product.description = req.body.description;
        product.price = req.body.price;

        if (imageFile != null) {
            product.coverImage = imageFile;
        }
        await product.save();
        res.redirect(`/products/${product.id}`);
    } catch (error) {
        console.log(error);
        if (product == null) {
            res.redirect('/');
        } else {
            if (imageFile != null) {
                fs.unlink(path.join(uploadPath, imageFile), err => {
                    if (err) {
                        console.error(err);
                    }
                })
            }
            renderFormPage(res, product, 'edit', true);
        }
    }
});

//delete
router.delete('/:id', async (req, res) => {
    let product;
    try {
        product = await Product.findByIdAndDelete(req.params.id);
        res.redirect('/products')
    } catch (error) {
        if (product == null) {
            res.redirect('/');
        } else {
            res.render(`/products/${product.id}`);
        }
    }

});



const renderFormPage = async (res, product, form, hasError = false) => {
    try {
        const brands = await Brand.find({});
        const params = {
            brands: brands,
            product: product
        }
        if (hasError) {
            params.errorMessage = 'আপনার ভুল হয়েছে, আবার চেষ্টা করুন'
        };
        res.render(`products/${form}`, params);

    } catch {
        res.redirect('/products');
    }
}

module.exports = router;
