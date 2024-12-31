const express = require('express');
const morgan = require('morgan');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookierParser = require("cookie-parser")

require('dotenv').config()

console.log("variable: ");

// console.log(process.env.FIREBASE_CONFIG);


const {DEAFULT_PORT} = require('./config.js')
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();

// asiganamos el puerto correspondiente del servidor, o 3000 en caso de no tener
app.set('port', process.env.PORT || DEAFULT_PORT);

// configuracion de express-handle-bars
// es una herramienta de renderizado de html con datos incrustados
// // en deshuso, sustituido por app de REACT
app.set('views', path.join(__dirname, 'src','views'));
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// se asigna una carpeta estatica
app.use(express.static(path.join(__dirname, 'public')));
// la ruta por defecto entregará la aplicacion de REACT al cliente (build de React)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// middlewares

app.use(morgan('dev')); // sirve para tener control de las peticiones
app.use(express.json({ limit: '50mb'}))
app.use(cookierParser())
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://www.megnasa.com']
}))

app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));


// routes
// asignamos el resto de rutas
app.use(require('./src/routes/index'));





// console.log('-----');
// console.log(path.join(__dirname, 'public'));
// console.log('-----');

module.exports = app;
