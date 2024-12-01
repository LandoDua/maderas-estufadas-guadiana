const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');



const app = express();

app.set('port', process.env.PORT || 3000);

// configuracion de express-handle-bars
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// middlewares

app.use(morgan('dev'));
app.use(express.urlencoded({
    extended: false,
}));

// routes
app.use(require('./routes/index'));

app.set(express.static(path.join(__dirname, '../','public')));
// console.log('-----');
// console.log(path.join(__dirname, '../','public'));
// console.log('-----');

module.exports = app;
