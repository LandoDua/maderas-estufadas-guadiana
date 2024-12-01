var admin = require("firebase-admin");
const path = require('path')

// ../../maderas-yaqui-firebase.json"
var serviceAccount = require(path.join(__dirname, '../', '../', 'maderas-yaqui-firebase.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://c-and-f-default-rtdb.firebaseio.com/',
});


const db = admin.database();
const storage = admin.storage();
const bucket = storage.bucket("gs://c-and-f.appspot.com");

/*
const productsRef = db.ref('productos');
productsRef.once('value', (snapshot) => {
  const products = snapshot.val();
  console.log(products);
});
*/


// db.collection('productos').get()
//   .then(snapshot => {
//     snapshot.forEach(doc => {
//       console.log(doc.id, '=>', doc.data());
//     });
//   })
//   .catch(err => {
//     console.error('Error al obtener datos:', err);
//   });

module.exports = { db , storage, bucket }