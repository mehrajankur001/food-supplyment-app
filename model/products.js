const mongoose = require('mongoose');
const coverImageBasePath = 'uploads/productcovers';
const path = require('path');
const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Brand'
    },
    price: {
        type: Number,
        required: true
    },
    publishDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
        required: true
    }
});

productSchema.virtual('coverImagePath').get(function () {
    if (this.coverImage != null) {
        return path.join('/', coverImageBasePath, this.coverImage);
    }
})

module.exports = mongoose.model('Product', productSchema);
module.exports.coverImageBasePath = coverImageBasePath;
