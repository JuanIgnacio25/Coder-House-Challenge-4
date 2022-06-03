const express = require('express');
const { engine } = require("express-handlebars");
const { Server: HttpServer } = require('http');
const { Server: SocketServer } = require('socket.io');
const fs = require('fs');

const app = express();

app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'index.hbs', 
  })
);

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.set('views', './public/hbs_views');
app.set('view engine', 'hbs');

const checkFile = async (nombreArchivo) => {
  const stats = fs.existsSync(nombreArchivo);

  if (stats == false) {
      try {
          await fs.promises.writeFile(nombreArchivo, "[]");
      } catch (error) {
          throw error;
      }
  }
}

class Contenedor{
  constructor(nombreArchivo){
      this.nombreArchivo = nombreArchivo;
  }
  
  async save(objeto) {
      try {
          await checkFile(this.nombreArchivo);
          let contenido = JSON.parse(await fs.promises.readFile(this.nombreArchivo));
          if(contenido.length == 0){
              objeto.id = 1;
          }else{
              objeto.id = contenido[contenido.length-1].id +1;
          }           
          contenido.push(objeto);
          await fs.promises.writeFile(this.nombreArchivo, JSON.stringify(contenido));
      } catch (error) {
          throw error;
      }
  }

  async getAll(){ 
      try {
          //await checkFile(this.nombreArchivo);
          let contenido = JSON.parse(await fs.promises.readFile(this.nombreArchivo));
          return contenido;
      } catch (error) {
          throw error;
      }
  }
}

const listaProductos = new Contenedor('productos.txt');


app.get('/',async (req,res) => {
  let productos = await listaProductos.getAll();
  res.render('formulario', {productos});
}); 

app.post('/save',async (req,res) => {
  let save = listaProductos.save(req.body);
  res.redirect('/');
});

const saveMessage = (message) => {
  let json = '';
  let contenido = fs.readFileSync('./mensajes.txt','utf-8');
  if (contenido === '') {
      json = JSON.stringify([message]);
      fs.writeFileSync('./mensajes.txt',json);
  } else {
      let messages = JSON.parse(contenido);
      json = JSON.stringify([...messages,message]);
      fs.writeFileSync('./mensajes.txt',json);
  }
}

const readMessage = () => {
  let contenido = fs.readFileSync('./mensajes.txt','utf-8');
  if (contenido === '') {
      return '';
  } else {
      return JSON.parse(contenido);
  }
}

const httpServer = new HttpServer(app);
const socketServer = new SocketServer(httpServer);

socketServer.on('connection',async (socket) => {
  socket.emit('messages',await readMessage())
  socket.emit('products',await listaProductos.getAll())

  socket.on('new_message',async (mensaje) => {
      console.log(mensaje);
      saveMessage(mensaje);
      let mensajes = await readMessage();
      socketServer.sockets.emit('messages',mensajes);
  });

  socket.on('new_products',async (product) => {
      await cont1.save(product)
      let productos = await listaProductos.getAll() === '' ? '' : await listaProductos.getAll();
      socketServer.sockets.emit('products',productos);
  });
}) 


httpServer.listen(8080, () => {
  console.log('Escuchando en el puerto 8080!');
});