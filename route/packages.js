const express = require('express');
const router = express.Router();

const Package = require('../model/packages');
const Member = require('../model/members');

const fs = require('fs');
const path = require('path');

const uploadPath = path.join('public', Package.coverImageBasePath);
const imageMimeType = ['image/jpeg', 'image/png', 'image/gifs'];

const multer = require('multer');
const upload = multer({
    dest: uploadPath,
    fileFilter: (res, file, callBack) => {
        callBack(null, imageMimeType.includes(file.mimetype));
    }
})

const mongoose = require('mongoose');
var models = mongoose.modelNames();
console.log(models);

//index
router.get('/', async (req, res) => {

    let query = Package.find().populate('members');
    const members = await Member.find();

    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore);
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    let recentpackages, oldpackages

    try {
        const packages = await query.exec();
        recentpackages = await Package.find().sort({ createdAt: 'desc' }).limit(12).exec();
        oldpackages = await Package.find().sort({ createdAt: 'asc' }).limit(12).exec();

        res.render('packages/packages', {
            packages: packages,
            members: members,
            recentpackages: recentpackages,
            oldpackages: oldpackages,
            searchOptions: req.query
        });
    } catch {
        recentpackages = []
        oldpackages = []
        res.redirect('/');
    }
});

//index + edit
router.get('/edit', async (req, res) => {

    let query = Package.find().populate('members');
    const members = await Member.find();

    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }
    if (req.query.lowerThan != null && req.query.lowerThan != '') {
        query = query.lte('price', req.query.lowerThan);
    }
    if (req.query.greaterThan != null && req.query.greaterThan != '') {
        query = query.gte('price', req.query.greaterThan);
    }

    let recentPackages, oldPackages

    try {
        const packages = await query.exec();
        recentPackages = await Package.find().sort({ createdAt: 'desc' }).limit(12).exec();
        oldPackages = await Package.find().sort({ createdAt: 'asc' }).limit(12).exec();

        res.render('packages/packagesEdit', {
            packages: packages,
            members: members,
            recentPackages: recentPackages,
            oldPackages: oldPackages,
            searchOptions: req.query
        });
    } catch {
        recentPackages = []
        oldPackages = []
        res.redirect('/');
    }
});


//new
router.get('/new', async (req, res) => {
    renderFormPage(res, new Package(), 'new');
})


//post
router.post('/', upload.single('coverImage'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const package = new Package({
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        packageImage: fileName
    });

    try {
        const newPackage = await package.save();
        res.redirect(`/packages/${newPackage.id}`);
    } catch {
        if (package.packageImage != null) {
            fs.unlink(path.join(uploadPath, fileName), err => {
                if (err) {
                    console.error(err);
                }
            })
        }
        renderFormPage(res, package, 'new', true);
    }

});

//show
router.get('/:id', async (req, res) => {
    const package = await Package.findById(req.params.id).populate('members').exec();
    try {
        res.render('packages/show', { package: package });
    } catch (error) {
        res.redirect('/packages');
    }
});

//show + edit
router.get('/:id/showEdit', async (req, res) => {
    const package = await Package.findById(req.params.id).populate('members').exec();
    try {
        res.render('packages/showEdit', { package: package });
    } catch (error) {
        res.redirect('/packages');
    }
});


//edit
router.get('/:id/edit', async (req, res) => {
    const package = await Package.findById(req.params.id);
    renderFormPage(res, package, 'edit');
});

//update
router.put('/:id', upload.single('coverImage'), async (req, res) => {
    const imageFile = req.file != null ? req.file.filename : null
    let package;
    try {
        package = await Package.findById(req.params.id);
        package.title = req.body.title;
        package.price = req.body.price;
        package.description = req.body.description;

        if (imageFile != null) {
            package.packageImage = imageFile;
        }
        await package.save();
        res.redirect(`/packages/${package.id}`);
    } catch (error) {
        console.log(error);
        if (package == null) {
            res.redirect('/');
        } else {
            if (imageFile != null) {
                fs.unlink(path.join(uploadPath, imageFile), err => {
                    if (err) {
                        console.error(err);
                    }
                })
            }
            renderFormPage(res, package, 'edit', true);
        }
    }
});

//delete
router.delete('/:id', async (req, res) => {
    let package;
    try {
        package = await Package.findByIdAndDelete(req.params.id);
        res.redirect('/packages')
    } catch (error) {
        if (package == null) {
            res.redirect('/');
        } else {
            res.render(`/packages/${package.id}`);
        }
    }

});



const renderFormPage = async (res, package, form, hasError = false) => {
    try {
        const members = await Member.find({});
        const params = {
            members: members,
            package: package
        }
        if (hasError) {
            params.errorMessage = 'আপনার ভুল হয়েছে, আবার চেষ্টা করুন'
        };
        console.log(package)
        res.render(`packages/${form}`, params);

    } catch (e) {
        console.log(e)
        res.redirect('/packages');
    }
}

module.exports = router;
