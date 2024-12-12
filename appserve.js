const express = require('express');
const morgan = require('morgan');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();

// asiganamos el puerto correspondiente del servidor, o 3000 en caso de no tener
app.set('port', process.env.PORT || 3000);

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
app.use(express.json())
app.use(express.urlencoded({
    extended: true,
}));


// routes
// asignamos el resto de rutas
app.use(require('./src/routes/index'));





// console.log('-----');
// console.log(path.join(__dirname, 'public'));
// console.log('-----');

module.exports = app;
