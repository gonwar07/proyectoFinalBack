const express = require('express');
const fs = require('fs');

const router = express.Router();
const products = './data/products.txt';

// /api/productos - Obtener un listado de todos los productos
  router.get('/', (req, res) => {
    fs.readFile(products, 'utf-8', (error, contenido) => {
      if(error) throw new Error(`Hubo un error: ${error.message}`)
      res.json(JSON.parse(contenido));
    });
  });
  
  // api/productos/:id - Obtener un producto indicando su ID
  router.get('/:id', (req, res) => {
    fs.readFile(products, 'utf-8', (error, contenido) => {
      if (error) throw new Error(`Hubo un error: ${error.message}`)

      const productos = JSON.parse(contenido)
      const { id } = req.params;  
      const product = productos.find(product => product.id === +id);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product with id: ${id} does not exist!`});
      } 
      return res.json({ success: true, result: product });
    });
  });
  
  // api/productos - Agregar un nuevo producto
  router.post('/', (req, res) => {
    let administrador = true;

    if (!administrador) {
      return res.status(404).json({ success: false, error: -1, descripcion: `ruta ${req.url}, método ${req.method} no autorizada` });
    };
    fs.readFile(products, 'utf-8', (error, contenido) => {
      if (error) throw new Error(`Hubo un error: ${error.mesage}`)

      const { nombre, descripcion, foto, precio, stock } = req.body;
      if (!nombre || !descripcion || !foto || !precio || !stock) {
        return res.status(400).json({ succes: false, error: 'Wrong body format' });
      }
      const productos = JSON.parse(contenido);

      const newProduct = {
        id: productos.length + 1,
        timestamp: Date.now(),
        nombre,
        descripcion,
        codigo: 1000 + productos.length + 1,
        foto,
        precio,
        stock
      };
      const archivo = JSON.parse(fs.readFileSync(products));

      fs.writeFile(products, JSON.stringify(archivo, null, 2), error => {
        if (error) throw new Error(`Hubo un error: ${error.mesage}`)

        archivo.push(newProduct)
        fs.writeFileSync(products, JSON.stringify(archivo, null, 2))
      });
      return res.json({ success: true, result: newProduct });
    });
  });
  
  // api/productos/:id - Modificar un producto indicando su ID
  router.put('/:id', (req, res) => {
    let administrador = true;

    if (!administrador) {
      return res.status(404).json({ success: false, error: -1, descripcion: `ruta ${req.url}, método ${req.method} no autorizada` });
    };

    fs.readFile(products, 'utf-8', (error, contenido) =>{
      if(error) throw new Error(`Hubo un error: ${error.mesage}`)
      
      const { params: { id }, body: { nombre, descripcion, codigo, foto, precio, stock} } = req;
      if (!nombre || !descripcion || !foto || !precio || !stock) {
        return res.status(400).json({ succes: false, error: 'Wrong body format' });
      }
      const productos = JSON.parse(contenido);
      const productIndex = productos.findIndex((product) => product.id === +id);
      const prod = productos.find(prod => prod.id === +id)

      if (productIndex < 0) return res.status(404).json({ success: false, error: `Product with id: ${id} does not exist!`});
      const newProduct = {
        ...productos[productIndex],
        timestamp: prod.timestamp,
        nombre,
        descripcion,
        codigo: prod.codigo,
        foto,
        precio,
        stock
      };
      const archivo = JSON.parse(fs.readFileSync(products));

          fs.writeFile(products, JSON.stringify(archivo, null, 2), error =>{
              if(error) throw new Error(`Hubo un error: ${error.mesage}`);

              archivo[productIndex] = newProduct;
              fs.writeFileSync(products, JSON.stringify(archivo, null, 2))
              }
          )
          return res.json({ success: true, result: newProduct });
      });
  });
  
  // api/productos/:id - Borrar un producto indicando su ID
  router.delete('/:id', (req, res) => {
    let administrador = true;
    if (!administrador) {
      return res.status(404).json({ success: false, error: -1, descripcion: `ruta ${req.url}, método ${req.method} no autorizada` });
    }

    fs.readFile(products, 'utf-8', (error, contenido) => {
      if (error) throw new Error(`Hubo un error: ${error.message}`)
      
      const { id } = req.params;
      const productos = JSON.parse(contenido);
      const productIndex = productos.find(product => product.id === +id);
      if (!productIndex) {
        return res.status(404).json({ success: false, error: `Product with id: ${id} does not exist!`});
      }

      let nuevoArray = productos.filter(product => product.id !== +id);

      fs.writeFile(products, JSON.stringify(nuevoArray, null, 2), error =>{
          if(error) throw new Error(`Hubo un error: ${error.mesage}`);
        });
      return res.json({ success: true, result: 'product correctly eliminated' });  
    });
  });
  
  
  module.exports = router;