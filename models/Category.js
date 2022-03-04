const mongoose = require('mongoose');
const {translierate, slugify} = require('transliteration');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please input your name.'],
        trim: true,
        unique: [true, 'Name is already inserted.'],
        maxlength: [50, 'Category name length must be less than 50 characters.']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please input your description.'],
        maxlength: [500, 'Category descriptiono length must be less than 500 characters.']
    },
    photo: {
        type: String,
        default: 'no-photo.jpg',
    },
    averageRating: {
        type: Number,
        min: [1, 'The lowest rating is 1.'],
        max: [10, 'The highest rating is 10']
    },
    averagePrice: Number,
    created_at: {
        type: Date,
        default: Date.now
    }
}, 
{ toJSON: {virtuals: true}, toObject: {virtuals: true} }
);

CategorySchema.virtual('books', {
    ref: 'Book',
    localField: '_id',
    foreignField: 'category',
    justOne: false // can retreive many elements
})

CategorySchema.pre('remove', async function (next){
    console.log('rmeoving ...');
    await this.model('Book').deleteMany({category: this._id});
});

CategorySchema.pre('save', function (next){
    // convert name to slugify
    // console.log("Here, there is this variable: ", this.name);
    this.slug = slugify(this.name);
    this.averageRating = Math.floor(Math.random() * 10) + 1;
    // this.averagePrice = Math.floor(Math.random() * 100000) + 3000;

    next();
});

module.exports = mongoose.model('Category', CategorySchema);