const express = require('express');
const fs = require('fs');

const router = express.Router();
const carrito = './data/carrito.txt';
const productos = './data/products.txt';

// /api/carrito - Obtener el listado de carritos
  router.get('/', (req, res) => {
    fs.readFile(carrito, 'utf-8', (error, contenido) => {
      if(error) throw new Error(`Hubo un error: ${error.message}`)
      res.json(JSON.parse(contenido));
    });
  });
  
  // api/carrito/id - Obtener un carrito según su ID
  router.get('/:id', (req, res) => {
    fs.readFile(carrito, 'utf-8', (error, contenido) => {
      if (error) throw new Error(`Hubo un error: ${error.message}`)

      const cart = JSON.parse(contenido)
      const { id } = req.params;  
      const carro = cart.find(carro => carro.id === +id);
      if (!carro) {
        return res.status(404).json({ success: false, error: `Cart with id: ${id} does not exist!`});
      } 
      return res.json({ success: true, result: carro });
    });
  });

  //api/carrito/:id/productos - Obtener todos los productos de un carrito según su ID
  router.get('/:id/productos', (req, res) => {
    fs.readFile(carrito, 'utf-8', (error, contenido) => {
      if (error) throw new Error(`Hubo un error: ${error.message}`)

      const cart = JSON.parse(contenido)
      const { id } = req.params;
      const carro = cart.find(carro => carro.id === +id);
      if (!carro) {
        return res.status(404).json({ success: false, error: `Cart with id: ${id} does not exist!`});
      } 
      return res.json({ success: true, result: carro.productos });
    });
  });
 
  // api/carrito - Agregar un nuevo carrito
  router.post('/', (req, res) => {
    fs.readFile(carrito, 'utf-8', (error, contenido) =>{
      if(error) throw new Error(`Hubo un error: ${error.mesage}`)

      const arrayCarrito = JSON.parse(contenido);
  
      const newCart = {
        id: arrayCarrito.length + 1,
        timestamp: Date.now(),
        productos: []
      };
      const archivo = JSON.parse(fs.readFileSync(carrito));

          fs.writeFile(carrito, JSON.stringify(archivo, null, 2), error =>{
              if(error) throw new Error(`Hubo un error: ${error.mesage}`)

              archivo.push(newCart)
              fs.writeFileSync(carrito, JSON.stringify(archivo, null, 2))
            }
          )
          return res.json({ success: true, result: `ID: ${newCart.id}`});
      });
  });
   
  // api/carrito/:id - Vaciar un carrito y eliminarlo según su ID
  router.delete('/:id', (req, res) => {
    fs.readFile(carrito, 'utf-8', (error, contenido) => {
      if (error) throw new Error(`Hubo un error: ${error.message}`)
      
      const { id } = req.params;
      const arrayCarrito = JSON.parse(contenido);
      const carro = arrayCarrito.find(carro => carro.id === +id);
      if (!carro) {
        return res.status(404).json({ success: false, error: `Cart with id: ${id} does not exist!`});
      }

      let nuevoArray = arrayCarrito.filter(carro => carro.id !== +id);

      fs.writeFile(carrito, JSON.stringify(nuevoArray, null, 2), error =>{
          if(error) throw new Error(`Hubo un error: ${error.mesage}`);
        });
      return res.json({ success: true, result: 'cart correctly eliminated' });
    });
  });

  // api/carrito/:id/productos - Agregar un nuevo producto al carrito
  router.post('/:id/productos', (req, res) => {
    fs.readFile(carrito, 'utf-8', (error, contenido) =>{
        if(error) throw new Error(`Hubo un error: ${error.mesage}`);

        const { id } = req.params;
        const arrayCarrito = JSON.parse(contenido);
        const archivo = JSON.parse(fs.readFileSync(carrito));
        let carro = arrayCarrito.find(carro => carro.id === +id);
        const index = arrayCarrito.indexOf(carro);
        if (!carro) {
          return res.status(404).json({ success: false, error: `Cart with id: ${id} does not exist!`});
        } 
        fs.readFile(productos, 'utf-8', (error, contenido) => {
          if(error) throw new Error(`Hubo un error: ${error.message}`);
          const arrayProductos = JSON.parse(contenido);
          const { id } = req.body;
          const prod = arrayProductos.find(prod => prod.id === +id);
          const prodCart = carro.productos;
          
          fs.writeFile(carrito, JSON.stringify(archivo, null, 2), error =>{
            if(error) throw new Error(`Hubo un error: ${error.mesage}`)
            if (!prod) {
              return res.status(404).json({ success: false, error: `Product with id: ${id} does not exist!`});
            }
              prodCart.push(prod);
              arrayCarrito[index] = carro;
                
              fs.writeFileSync(carrito, JSON.stringify(arrayCarrito, null, 2))
              return res.json({ success: true, result: 'Product was succesfully added!'});
            });
      });
    });
  });

  // api/carrito/:id/productos/:id_prod - eliminar un producto de un carrito indicando sus IDs
  router.delete('/:id/productos/:id_prod', (req, res) => {
      fs.readFile(carrito, 'utf-8', (error, contenido) => {
          if (error) throw new Error(`Hubo un error: ${error.message}`)

          const { id } = req.params;
          const { id_prod } = req.params;
          let arrayCarrito = JSON.parse(contenido);
          const carro = arrayCarrito.find(carro => carro.id === +id);
          const prodCart = carro.productos;
          const indexCart = arrayCarrito.indexOf(carro);

          if (!carro) {
              return res.status(404).json({ success: false, error: `Cart with id: ${id} does not exist!` });
          }
          const prod = carro.productos.find(prod => prod.id === +id_prod);
          const indexProd = prodCart.indexOf(prod);
          if(!prod){
            return res.status(404).json({ success: false, error: `Product with id: ${id} does not exist!` });
          }
                   
          prodCart.splice(indexProd, 1);
          arrayCarrito[indexCart] = carro

          fs.writeFile(carrito, JSON.stringify(arrayCarrito, null, 2), error => {
              if (error) throw new Error(`Hubo un error: ${error.mesage}`);
          });
          return res.json({ success: true, result: 'Product correctly eliminated' });
      });
  });
  
  
  module.exports = router;