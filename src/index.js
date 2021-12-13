const express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
const config = require('./config');
const ssh_manager = require('./ssh_manager');
const mv_manager = require('./mv_manager');


///////////////////////////
// - SERVIDOR EXPRESS - //
/////////////////////////
const app = express();

app.listen(8101, () => {
	console.log('Server on port ', config.express.port);
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => { //CORS
    console.log("Recibiendo solicitud de la dirección: ", req.headers.origin);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DEvarE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DEvarE');
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

/////////////////////////
//   - RUTAS HTTP -   //
///////////////////////

/// - RUTA PARA CREAR MV DE UN REPOSITORIO
app.post('/create_mv', async (req, res) => {
    //res.status(200).json({ port_machine: await mv_manager.}) TODO: por hacer!!
});

// - RUTAS PARA MANEJO DE REPOSITORIOS - 
// FIXME: Agregar JWT web token para identificación de usuario
app.post('/folder_on_create' , async (req , res)=>{
    res.status(200).json({ message: await ssh_manager.update_use_mv(req.body.port_machine, ssh_manager.create_folder_ssh(req.body.path, req.body.port_machine))});
});

app.post('/file_on_create' , async (req , res)=>{
    res.status(200).json({ message: await ssh_manager.update_use_mv(req.body.port_machine, ssh_manager.create_file_ssh(req.body.path, req.body.port_machine))});
});

// Se recibe una solicitud por cada cambio en un documento FIXME: Para hacerlo más eficiente se tiene que mudar el servicio de manager a la máquina virtual y utilizarlo en conjunto a convergence O optimizar el envío de solicitudes del frontend.
app.post('/file_on_update' , async (req , res)=>{
    console.log(req.body.id_element, req.body.path, req.body.port_machine);
    res.status(200).json({message: await ssh_manager.update_use_mv(req.body.port_machine, ssh_manager.update_file_ssh(req.body.id_element, req.body.path, req.body.port_machine))});
});

app.post('/element_on_rename' , async (req , res)=>{
    res.status(200).json({message: await ssh_manager.update_use_mv(req.body.port_machine, ssh_manager.rename_element_ssh(req.body.old_dir, req.body.new_dir, req.body.port_machine))});
});

app.post('/element_on_delete' , async (req , res)=>{
    res.status(200).json({message: await ssh_manager.update_use_mv(req.body.port_machine, ssh_manager.delete_element_ssh(req.body.direction, req.body.port_machine))});
});

app.post('/repository_on_open' , async(req, res) =>{
    res.status(200).json({message: await mv_manager.create_mv(req.body.repository_id, req.body.name)});
});


//TODO: Agregar mover elemento - similar a rename - complejo de implementar en el frontend

//------------------------------------------------