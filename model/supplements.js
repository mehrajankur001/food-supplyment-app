const mongoose = require('mongoose');
const coverImageBasePath = 'uploads/supplementcovers';
const path = require('path');
const supplementSchema = mongoose.Schema({
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

supplementSchema.virtual('coverImagePath').get(function () {
    if (this.coverImage != null) {
        return path.join('/', coverImageBasePath, this.coverImage);
    }
})

module.exports = mongoose.model('Supplement', supplementSchema);
module.exports.coverImageBasePath = coverImageBasePath;
