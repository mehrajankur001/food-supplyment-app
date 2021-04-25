const express = require('express');
const route = express.Router();
const Member = require('../model/members');
const Package = require('../model/packages');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadPath = path.join('public', Member.memberImageBasePath);
const imageMimeType = ['image/jpeg', 'image/png', 'image/gifs'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeType.includes(file.mimetype));
    }
});

//index
route.get('/', async (req, res) => {
    let query = Member.find();
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'));
    }
    try {
        const members = await query.populate('package').exec();
        res.render('members/members', {
            members: members,
            searchOptions: req.query
        });
    } catch {
        res.redirect('/');
    }
});

//index + edit + delete
route.get('/edit', async (req, res) => {
    let query = Member.find();
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'));
    }
    try {
        const members = await query.exec();
        res.render('members/membersEdit', {
            members: members,
            searchOptions: req.query
        });
    } catch {
        res.redirect('/');
    }
});

//new
route.get('/new', async (req, res) => {
    renderFormPage(res, new Member(), 'new');
});

//post
route.post('/', upload.single('memberImage'), async (req, res) => {

    const fileName = req.file == null ? null : req.file.filename;
    const member = new Member({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
        gender: req.body.gender,
        package: req.body.package,
        memberImage: fileName
    });
    try {
        const newMember = await member.save();
        res.redirect(`/members/${newMember.id}`);
    } catch {
        if (member.memberImage != null) {
            fs.unlink(path.join(uploadPath, fileName), err => {
                if (err) {
                    console.error(err);
                }
            });
        }
        renderFormPage(res, member, true);
    }
});

//show
route.get('/:id', async (req, res) => {
    const member = await Member.findById(req.params.id).populate('package').exec();
    const packagesByThisMember = await Package.find({ member: member });
    try {
        res.render(`members/show`, { member: member, packagesByThismember: packagesByThisMember });
    } catch (error) {
        res.redirect('/members');
    }
});
//show + Edit + Delete
route.get('/:id/showEdit', async (req, res) => {
    const member = await Member.findById(req.params.id);
    const packagesByThisMember = await Package.find({ member: member });
    try {
        res.render(`members/showEdit`, { member: member, packagesByThismember: packagesByThisMember });
    } catch (error) {
        res.redirect('/members');
    }
});

//edit
route.get('/:id/edit', async (req, res) => {
    const member = await Member.findById(req.params.id);
    renderFormPage(res, member, 'edit');
});

//update
route.put('/:id', upload.single('memberImage'), async (req, res) => {

    let member;
    const fileName = req.file == null ? null : req.file.filename;
    try {
        member = await Member.findById(req.params.id);
        member.name = req.body.name;
        member.age = req.body.age;
        member.email = req.body.email;
        member.gender = req.body.gender;
        member.package = req.body.package;
        if (fileName != null) {
            member.memberImage = fileName;
        } else {

        }
        await member.save();
        res.redirect(`/members/${member.id}`);
    } catch (error) {
        if (member == null) {
            res.redirect('/')
        } else {
            if (member.memberImage != null) {
                fs.unlink(path.join(uploadPath, fileName), err => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
            renderFormPage(res, member, 'edit')
        }
    }
});

//delete
route.delete('/:id', async (req, res) => {
    let member;
    try {
        member = await Member.findById(req.params.id);
        await member.remove();
        res.redirect('/members');
    } catch (error) {
        if (member == null) {
            res.redirect('/');
        } else {
            let alert = require('alert')
            alert("This member Has packages");
            res.redirect(`/members/${member.id}/showEdit`);
        }
    }
});

const renderFormPage = async (res, member, form, hasError = false) => {
    const packages = await Package.find();
    try {
        const params = { member: member, packages: packages }
        if (hasError) {
            params.errorMessage = 'আবার চেষ্টা করুন'
        }
        res.render(`members/${form}`, params);

    } catch {
        res.redirect('/')
    }
}

module.exports = route;
