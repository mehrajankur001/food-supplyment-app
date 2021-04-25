const express = require('express');
const router = express.Router();

const Supplement = require('../model/supplements');
const Brand = require('../model/brands');

const fs = require('fs');
const path = require('path');

const uploadPath = path.join('public', Supplement.coverImageBasePath);
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

    let query = Supplement.find();
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

    let recentSupplement, oldSupplement

    try {
        const supplements = await query.exec();
        recentSupplement = await Supplement.find().sort({ createdAt: 'desc' }).limit(12).exec();
        oldSupplement = await Supplement.find().sort({ createdAt: 'asc' }).limit(12).exec();

        res.render('supplements/supplements', {
            supplements: supplements,
            brands: brands,
            recentSupplement: recentSupplement,
            oldSupplement: oldSupplement,
            searchOptions: req.query
        });
    } catch {
        recentSupplement = []
        oldSupplement = []
        res.redirect('/');
    }
});

//index + edit 
router.get('/edit', async (req, res) => {

    let query = Supplement.find();
    const brands = await Brand.find();

    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }

    try {
        const supplements = await query.exec();

        res.render('supplements/supplementsEdit', {
            supplements: supplements,
            brands: brands,
            searchOptions: req.query
        });
    } catch {
        res.redirect('/');
    }
});


//new
router.get('/new', async (req, res) => {
    renderFormPage(res, new Supplement(), 'new');
})


//post
router.post('/', upload.single('coverImage'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const supplement = new Supplement({
        title: req.body.title,
        brand: req.body.brand,
        price: req.body.price,
        description: req.body.description,
        coverImage: fileName
    });

    try {
        const newSupplement = await supplement.save();
        res.redirect(`/supplements/${newSupplement.id}`);
    } catch {
        if (supplement.coverImage != null) {
            fs.unlink(path.join(uploadPath, fileName), err => {
                if (err) {
                    console.error(err);
                }
            })
        }
        renderFormPage(res, supplement, 'new', true);
    }

});

//show
router.get('/:id', async (req, res) => {
    const supplement = await Supplement.findById(req.params.id).populate('brand').exec();
    try {
        res.render('supplements/show', { supplement: supplement });
    } catch (error) {
        res.redirect('/supplements');
    }
});

//show + edit
router.get('/:id/showEdit', async (req, res) => {
    const supplement = await Supplement.findById(req.params.id).populate('brand').exec();
    try {
        res.render('supplements/showEdit', { supplement: supplement });
    } catch (error) {
        res.redirect('/supplements');
    }
});


//edit
router.get('/:id/edit', async (req, res) => {
    const supplement = await Supplement.findById(req.params.id);
    renderFormPage(res, supplement, 'edit');
});

//update
router.put('/:id', upload.single('coverImage'), async (req, res) => {
    const imageFile = req.file != null ? req.file.filename : null
    let supplement;
    try {
        supplement = await Supplement.findById(req.params.id);
        supplement.title = req.body.title;
        supplement.brand = req.body.brand;
        supplement.price = req.body.price;
        supplement.description = req.body.description;

        if (imageFile != null) {
            supplement.coverImage = imageFile;
        }

        await supplement.save();
        res.redirect(`/supplements/${supplement.id}`);
    } catch (error) {
        console.log(error);
        if (supplement == null) {
            res.redirect('/');
        } else {
            if (imageFile != null) {
                fs.unlink(path.join(uploadPath, imageFile), err => {
                    if (err) {
                        console.error(err);
                    }
                })
            }
            renderFormPage(res, supplement, 'edit', true);
        }
    }
});

//delete
router.delete('/:id', async (req, res) => {
    let supplement;
    try {
        supplement = await Supplement.findByIdAndDelete(req.params.id);
        res.redirect('/supplements')
    } catch (error) {
        if (supplement == null) {
            res.redirect('/');
        } else {
            res.render(`/supplements/${supplement.id}`);
        }
    }

});



const renderFormPage = async (res, supplement, form, hasError = false) => {
    try {
        const brands = await Brand.find({});
        const params = {
            brands: brands,
            supplement: supplement
        }
        if (hasError) {
            params.errorMessage = 'আপনার ভুল হয়েছে, আবার চেষ্টা করুন'
        };
        res.render(`supplements/${form}`, params);

    } catch {
        res.redirect('/supplement');
    }
}

module.exports = router;
