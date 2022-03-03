const mongoose = require('mongoose');
const {translierate, slugify} = require('transliteration');

const BookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please input your name'],
        trim: true,
    },
    cover_photo: {
        type: String,
        default: 'no-photo.jpg',
    },
    author_name: {
        type: String,
        trim: true,
        required: [true, 'Please input your author name'],
        maxlength: [500, 'Author name length must be less than 500 characters.'],
    },
    rating: {
        type: Number,
        min: [0, 'The lowest rating is 0.'],
        max: [10, 'The highest rating is 10']
    },
    price: {
        type: Number,
        required: [true, 'Please input your price'],
    },
    discount_percent: Number,
    total_balance: Number,
    short_content: {
        type: String,
        trim: true,
    },
    bestseller: {
        type: Boolean,
        default: false
    },
    available: [String],
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

BookSchema.pre('save', function(next){
    next();
});

module.exports = mongoose.model('Book', BookSchema);