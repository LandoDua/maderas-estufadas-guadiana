const { Router } = require("express");
const { db, storage, bucket, admin } = require("./firebase.config");
const { UserRepository} = require('./UserRepository')
const multer = require("multer");
const moment = require("moment");

const path = require("path");

const router = Router(); // router de Express
const upload = multer({}); // sirve para recibir archivos


////////////////////////// ACCIONES CON REDENDERIZADO  //////////////////////////

// entrega una lista de productos (rederizada con hbs)
router.get("/productos", (req, res) => {
  const productosRef = db.ref("productos");

  productosRef
    .once("value", async (snapshot) => {
      const productos = snapshot.val();
      console.log(productos);

      for (const producto in productos) {
        let strImagen = productos[producto].imagen;

        const file = bucket.file(strImagen);
        const dateExpires = moment().add(1, "days").unix() * 1000;
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: dateExpires, // Fecha de caducidad de la URL
        });
        productos[producto].imagen = url;
      }

      res.render("index", { productos: productos });
    })
    .catch((err) => {
      console.error("Error al obtener datos:", err);
    });
});

// entrega un producto en especifico (rederizado por hbs)
router.get("/producto/:id", async (req, res) => {
  const idProducto = req.params.id;
  const productosRef = db.ref("productos/" + idProducto);

  productosRef
    .once("value", async (snapshot) => {
      const producto = snapshot.val();
      console.log(producto);

      let strImagen = producto.imagen;

      const file = bucket.file(strImagen);
      const dateExpires = moment().add(1, "days").unix() * 1000;
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: dateExpires, // Fecha de caducidad de la URL
      });

      producto.imagen = url;

      res.render("producto", { producto: producto });
    })
    .catch((err) => {
      console.error("Error al obtener datos:", err);
    });
});

////////////////////////// ACCIONES DE API //////////////////////////
// entrega un JSON con cada uno de los productos como objeto
router.get("/api", async (req, res) => {
  const productosRef = db.ref("productos");

  productosRef
    .once("value", async (snapshot) => {
      const productos = snapshot.val();
      console.log(productos);

      for (const producto in productos) {
        let strImagen = productos[producto].imagen;

        const file = bucket.file(strImagen);
        const dateExpires = moment().add(1, "days").unix() * 1000;
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: dateExpires, // Fecha de caducidad de la URL
        });
        productos[producto].imagen = url;
      }

      res.json(productos);
    })
    .catch((err) => {
      console.error("Error al obtener datos:", err);
    });
});

// agrega un producto nuevo a la base de datos
/* recibe JSON
 {nombre: text,
 n_moldura: text,
 descripcionCorta: text,
 descripcion: text,
 descripcion2: text,
 categorias: text,
 imagen: file,
 }
 Exactamente esos nombres
 */
router.post("/api/nuevoProducto", upload.single("imagen"), async (req, res) => {
  const file = req.file;
  const direccion = "productos/" + file.originalname;

  // Subir el archivo a Firebase

  try {
    const fileBucket = bucket.file(direccion);
    await fileBucket.save(file.buffer);
  } catch (err) {
    res.json({
      status: "ERROR al subir imagenes",
    });
  }

  try {
    const file = bucket.file(direccion);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2522", // Fecha de caducidad de la URL
    });

    nuevoProducto = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      descripcionCorta: req.body.descripcionCorta,
      categorias: req.body.categorias,
      imagen: direccion,
    };

    await db.ref("productos").push(nuevoProducto);

    res.json({
      status: "producto agregado",
    });
  } catch (error) {
    console.error("Error al obtener la URL de imagen:", error);
    res.status(500).send("Error");
  }

  try {
  } catch (err) {
    res.json({
      status: "ERROR al subir datos",
    });
  }
});

// retorna el JSON de un producto especifico, busca por ID
router.get("/api/producto/:id", async (req, res) => {
  const idProducto = req.params.id;
  const productosRef = db.ref("productos/" + idProducto);

  productosRef
    .once("value", async (snapshot) => {
      const producto = snapshot.val();
      console.log(producto);

      let strImagen = producto.imagen;

      const file = bucket.file(strImagen);
      const dateExpires = moment().add(1, "days").unix() * 1000;
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: dateExpires, // Fecha de caducidad de la URL
      });

      producto.imagen = url;

      res.json(producto);
    })
    .catch((err) => {
      console.error("Error al obtener datos:", err);
    });
});

router.delete("/api/producto/:id", (req, res) => {
  const idProducto = req.params.id;
  const productosRef = db.ref("productos/" + idProducto);
  var urlImagen = "";

  productosRef.once("value", (snapshot) => {
    const producto = snapshot.val();
    const urlImagen = producto.imagen;
    const bucketName = "c-and-f";

    const storageRef = bucket.file(urlImagen);

    storageRef
      .delete()
      .then(() => {
        console.log("Imagen eliminada correctamente");
        
          
      })
      .then(()=>{
        productosRef
        .remove()
        .then(() => {
          res.json({
            status: `${idProducto} eliminado correctamente`,
          });
        })
        .catch(() => {
          res.json({
            status: "Error al intentar eliminar producto",
          });
        });
      })
      .catch((error) => {
        console.error("Error al eliminar la imagen:", error);
      });
  });

  // productosRef
  //   .remove()
  //   .then(() => {
  //     res.json({
  //       status: `${idProducto} eliminado correctamente`,
  //     });
  //   })
  //   .catch(() => {
  //     res.json({
  //       status: "Error al intentar eliminar producto",
  //     });
  //   });
});

////////////////////////// LOGIN y seguridad //////////////////////////

router.get('/loginscreen', (req, res)=>{
  res.render('login')
})

router.get('/validar',(req, res)=>{
  if(req.cookies.access_token){
    res.send('Sesion iniciada como '+ req.cookies.access_token)
  } else{
    res.send('Acceso denegado')

  }
})

router.post("/registrer", (req, res) => {
  // console.table(req.body);
  const {user, email, password} = req.body

  try {
    const respuesta = UserRepository.create({user, email, password})
    console.log("UID:"+respuesta)
    res.json({
      status: "usuario agregado correctamente"
    }) 
  } catch (error) {
    res.json({
      error: "Error al crear usuario"
    })
  }

  
});

router.post("/login", async (req, res) => {
  // console.table(req.body);
  const {email, password} = req.body

 


  res.cookie('access_token', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 2
  })
  .json({
    status: 'sesion iniciada como: '+ email
  })

 
});

router.get("/users", async (req, res )=>{
  var usuarios = {}
  // const user_list = await UserRepository.all()
  const auth = admin.auth()

  const listUsersResult = await auth.listUsers()
  // console.log(listUsersResult);
  // console.log("Lista usuarios: ");
  
  // console.log(user_list);
  
  for (const user in listUsersResult.users){
    // console.log(listUsersResult.users[user]);

    const {uid, email, displayName,} = listUsersResult.users[user]
    const fechaCreacion = listUsersResult.users[user].metadata.creationTime

    // console.log({
    //   uid: uid,
    //   email: email,
    //   user: displayName,
    //   creacion: fechaCreacion

    // })
    usuarios[uid] = {
      uid: uid,
      email: email,
      user: displayName,
      creacion: fechaCreacion

    }
  }
  
  // console.log(usuarios);
  
  // res.send("RecibidoJSON1")
  res.json(usuarios)

})

router.delete("/users/:id", (req, res)=>{
  const ID = req.params.id

  const auth = admin.auth()
  auth.deleteUser(ID)
  .then(()=>{
    res.json({
      status: "Usuario eliminado correctamente"
    })
  })
  .catch((err)=>{
    res.json({
      error: "Error al eliminar "+err
    })
  })

  // res.status('Recibido')
})

////////////////////////////// control de token //////////////////////////////////
router.post('/nuevo-token', async (req, res)=>{
  const {token, name, email, expirationDate} = req.body


  // const daysExpires = days? days : 15;
  
  const docRef = db.ref('/tokens/'+token)

  // const fecha_limite = moment(fecha, 'YYYY-MM-DD').unix()


  const nuevo_token = {
    token : token,
    usuario : name,
    email: email,
    fechaLimite : expirationDate,
    estado : 'Pendiente'
  }
  // console.table(req.body)

  console.table(nuevo_token)
  
  
  docRef.set(nuevo_token)
  .then((snapshot)=>{
    res.json({
      status: "Token generado correctamente"
    }
    )
  })
  .catch((err)=>{
    res.json({
      error : "erorr al crear token: "+err
    })
  })
  


})


router.get('/validar-token/:token', (req, res)=>{
  const {token} = req.params
  



  res.send(token)
})
////////////////////////// control de imagenes //////////////////////////

// redireccion a subirImagen // desuso
router.get("/subir", (req, res) => {
  res.render("subirFoto");
});

// accion a a subir imagen individual (listo)
// recibe
// {imagen: file}
router.post("/api/subirImagen", upload.single("imagen"), async (req, res) => {
  direccion = "productos/" + req.file.originalname;

  console.log(req.file);
  const file = req.file;

  // Subir el archivo a Firebase
  const fileBucket = bucket.file("productos/" + file.originalname);
  await fileBucket.save(file.buffer);

  res.send("recibida productos/" + file.originalname);
});

// consulta una imagen de PRODUCTOS por su nombre
router.get("/imagen/productos/:imagen?", async (req, res) => {
  if (req.params.imagen) {
    try {
      const { imagen } = req.params;
      // console.log('PARAMETROS '+ imagen)
      const file = bucket.file("productos/" + imagen);
      // const file = bucket.file("productos/moldura2.jpeg");
      const dateExpires = moment().add(1, "days").unix() * 1000;

      const [url] = await file.getSignedUrl({
        action: "read",
        expires: dateExpires, // Fecha de caducidad de la URL
      });
      res.send(`<h1>${req.params.imagen}</h1><img src="${url}">`);
    } catch (error) {
      console.error("Error al obtener la URL:", error);
      res.status(500).send("Error");
    }
  } else {
    res.send("IMAGEN NO ENCONTRADA EN STORAGE");
  }
});

module.exports = router;