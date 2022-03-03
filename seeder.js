const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Book = require('./models/Books');

dotenv.config({path: './config/config.env'});

mongoose.connect(process.env.MONGODB_URI,{});

const categories = JSON.parse( fs.readFileSync(__dirname + '/data/categories.json', 'utf-8', ) );
const books = JSON.parse( fs.readFileSync(__dirname + '/data/books.json', 'utf-8', ) );

const importData = async () => {
    try{
        await Category.create(categories);
        await Book.create(books);
        console.log('Data imported ...'.green.inverse);
    }catch(err){
        console.log(err);
    }
}

const deleteData = async () => {
    try{
        await Category.deleteMany();
        await Book.deleteMany();
        console.log('Date deleted ...'.red.inverse);
    }catch(err){
        console.log(err);
    }
}

// get third argument in console. Example: node.js seeder.js -import
if( process.argv[2] == '-i'){
    importData();
}else if( process.argv[2] == '-d' ){
    deleteData();
}
