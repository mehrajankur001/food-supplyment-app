const mongoose = require('mongoose');
const coverImageBasePath = 'uploads/packagecovers';
const path = require('path');
const packageSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
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
    packageImage: {
        type: String,
        required: true
    }
});

packageSchema.virtual('coverImagePath').get(function () {
    if (this.packageImage != null) {
        return path.join('/', coverImageBasePath, this.packageImage);
    }
})

module.exports = mongoose.model('Package', packageSchema);
module.exports.coverImageBasePath = coverImageBasePath;
