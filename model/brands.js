const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const Product = require('../model/products');

const brandImageBasePath = 'uploads/brands';
const path = require('path');
const brandschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brandImage: {
        type: String,
        required: true
    }
});

brandschema.virtual('brandImagePath').get(function () {
    if (this.brandImage != null) {
        return path.join('/', brandImageBasePath, this.brandImage);
    }
});

brandschema.pre('remove', function (next) {
    Product.find({ brand: this.id }, (err, products) => {
        if (err) {
            next(err);
        }
        else if (products.length > 0) {
            next(new Error('This brand has products'));
        }
        else {
            next();
        };
    })
});

module.exports = mongoose.model('Brand', brandschema);
module.exports.brandImageBasePath = brandImageBasePath;
