const socket = io();

const enviarMensaje = (e) => {
    const autor = document.getElementById('autor').value;
    const text = document.getElementById('text').value;
    const fyh = String(new Date().toDateString() + ' ' + new Date().toLocaleTimeString())
    const mensaje = { autor,text,fyh };
    socket.emit('new_message',mensaje);
    return false;
}

const crearEtiquetasMensaje = (mensaje) => {
    const { autor,text,fyh } = mensaje;
    return `
    <div>
        <strong style='color:blue'>${autor}</strong>
        <p style='color:brown'>${fyh}</p>
        <i style='color:green'>${text}</i>
    </div>
    `;
}

const agregarMensajes = (mensajes) => {
    if (mensajes !== '') {
        const mensajesFinal = mensajes.map(mensaje => crearEtiquetasMensaje(mensaje)).join(' ');
        document.getElementById('messages').innerHTML = mensajesFinal;
    }
}

socket.on('messages',(messages) => agregarMensajes(messages));

const enviarProducto = (e) => {
    const title = document.getElementById('title').value;
    const price = document.getElementById('price').value;
    const thumbnail = document.getElementById('thumbnail').value;
    const producto = { title,price,thumbnail };
    title = '';
    price = '';
    thumbnail = '';
    socket.emit('new_products',producto);
    return false;
}

const crearEtiquetasProductos = (producto) => {
    const { title,thumbnail,price } = producto;
    return `
    <tr>
        <td>${title}</td>
        <td>$ ${price}</td>
        <td><img style="width: 50px; height:50px" src=${thumbnail} alt=""></td>
    </tr>
    `;
}

const agregarProducto = (producto) => {
    console.log(producto);
    if (producto !== '') {
        const productoFinal = producto.map(producto => crearEtiquetasProductos(producto)).join('<br>');
        console.log(productoFinal);
        console.log(document.getElementById('productsContainer'));
        document.getElementById('productsContainer').innerHTML = productoFinal;
    }
}

socket.on('products',(products) => agregarProducto(products)); 
