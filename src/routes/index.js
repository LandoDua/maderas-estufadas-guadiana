const { Router } = require("express");
const { db, storage, bucket } = require("./firebase.config");
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
 descripcionCorta: text,
 descripcion: text,
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

////////////////////////// LOGIN y seguridad //////////////////////////

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
