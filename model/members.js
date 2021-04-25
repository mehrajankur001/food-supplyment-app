const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const memberImageBasePath = 'uploads/member';
const path = require('path');
const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true,
        default: "Male"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    memberImage: {
        type: String,
        required: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Package'
    },
});

memberSchema.virtual('memberImagePath').get(function () {
    if (this.memberImage != null) {
        return path.join('/', memberImageBasePath, this.memberImage);
    }
});


module.exports = mongoose.model('Member', memberSchema);
module.exports.memberImageBasePath = memberImageBasePath;