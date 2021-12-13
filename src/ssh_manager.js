const WebSocket = require('ws');
var path = require('path');
const bd = require('./bd_query')
const config = require('./config');
const { Client } = require('ssh2');
var Promise = require('promise');
const convergence = require('@convergence/convergence');
const domainUrl = config.convergence.domain_url;
module.exports = {
    exec_ssh_command, delete_element_ssh, rename_element_ssh,
    init_virtual, update_file_ssh, create_file_ssh, create_folder_ssh,
    update_use_mv
}



////////////////////////////////////////////////
//             - SSH CONNECTION -            //
//////////////////////////////////////////////

async function exec_ssh_command(command, port_machine)
{   return new Promise(resolve => {
        try {
            console.log(command, port_machine); 
            const conn = new Client();
            conn.on('ready', () => {
                conn.exec(command, (err, stream) => {
                    if (err) throw err;
                    stream.on('close', (code, signal) => {
                    //    console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                        conn.end();
                        resolve();
                    }).on('data', (data) => {
                    //    console.log('STDOUT: ' + data);
                    }).stderr.on('data', (data) => {
                    //    console.log('STDERR: ' + data);
                });
            })
            }).connect({
                host: config.virtual_machine.host,
                port: port_machine,
                username: config.virtual_machine.username,
                password: config.virtual_machine.password,
            })
            conn.on('error', (err) => {
                conn.errorHandled = true;
                conn.end();
                console.log('custom error handler', err);
            });
        } catch (error) {
            console.log(err);
        }
        
    });
} 

async function delete_element_ssh(path, port_machine)
{   return new Promise(async resolve => {
        var command = "cd ~ && rm -dr "+path.replace(/ /g, "\\ ");
        await exec_ssh_command(command, port_machine).
        then(resolve("element on_delete done."));
    });
}

async function rename_element_ssh(old_dir, new_dir, port_machine)
{   return new Promise(async resolve => {
        var command = "cd ~ && mv "+old_dir.replace(/ /g, "\\ ")+" "+new_dir.replace(/ /g, "\\ ");
        exec_ssh_command(command, port_machine).
        then(resolve("element on_rename done."));
    });
}

///////////////////////////////////////////
//             - SSH UTILS -            //
/////////////////////////////////////////

async function init_virtual(id_model, port_machine)
{   console.log("Iniciando máquina virtual... ",id_model, port_machine);
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    return new Promise(resolve => {
        convergence.connectAnonymously(domainUrl, "test", {
            webSocket: {
                factory: (u) => new WebSocket(u, { rejectUnauthorized: false}),
                class: WebSocket
            }
        }).then(async domain => {
            const modelService = domain.models();
            modelService.history(id_model).then(async model => {
                
                repository_name =  model.elementAt(['tree', 'nodes', 'root']).get('name').value();
                repository_children = model.elementAt(['tree', 'nodes', 'root']).get('children').value();

                init_machine(model, "root", repository_name, port_machine);
                resolve();
            });
        }).catch(err => {
            console.log("error: "+ err);
        })
    });
}


async function init_machine(model, id_father, direction, port_machine) //considerar pasar el token + puerto
{   return new Promise(resolve => {
        exec_ssh_command("cd ~ && mkdir "+direction.replace(/ /g, "\\ "), port_machine)
        .then(async () => {
            children = await model.elementAt(['tree', 'nodes', id_father]).get('children').value();
            await asyncForEach(children, async (id_children) => {
                direction = model.elementAt(['tree', 'nodes', id_children]).get('path').value();
                if(model.elementAt(['tree', 'nodes', id_children]).get('children').value() != undefined) 
                {   resolve(await init_machine(model, id_children, direction, port_machine));
                }
                else
                {   content = await get_content(id_children);
                    if(content != undefined)
                    {   await exec_ssh_command("echo '"+content+"' > "+direction.replace(/ /g, "\\ "), port_machine);
                    }
                    else
                    {   await exec_ssh_command("echo '' > "+direction.replace(/ /g, "\\ "), port_machine);
                    }   
                }
            });
        });
    });   
}      


// Controlador de comandos en actualización de archivo a través de una cola
let array_update_file = new Array;
send_update_file_command(1000); 

async function send_update_file_command(milliseconds)
{   setInterval(async () => {
        for (let index = 0; index < array_update_file.length; index++) {
            update = array_update_file.pop();
            exec_ssh_command(update.command, update.port_machine);
        }
    }, milliseconds)
}
//-------------------------------------------------------


async function update_file_ssh(id_element, path, port_machine)
{   new Promise(async resolve => {
        content = await get_content(id_element);
        await get_content(id_element).then(content => {
            var command = "cd ~ && echo '"+content+"' > "+path.replace(/ /g, "\\ ");
            index = array_update_file.findIndex(update => update.id_element === id_element);
            if(index == -1) array_update_file.push({id_element: id_element, port_machine: port_machine, command: command});// push
            else
            {   array_update_file[index].command = command;
                array_update_file[index].port_machine = port_machine;
            }
        });
    });
}

async function create_file_ssh(path, port_machine)
{   return new Promise(async resolve => {
        var command = "cd ~ && echo '' > "+path.replace(/ /g, "\\ ");
        await exec_ssh_command(command, port_machine).
        then(resolve("file on_create done."));
    });
}

async function create_folder_ssh(path, port_machine)
{   return new Promise(async resolve => {
        var command = "cd ~ && mkdir "+path.replace(/ /g, "\\ ");
        await exec_ssh_command(command, port_machine)
        .then(resolve("folder on_create done."));
    });
}

async function get_content(model) // TODO: considerar jwt
{   return new Promise( async resolve =>     
    {   convergence.connectAnonymously(domainUrl, "test", {
        webSocket: {
            factory: (u) => new WebSocket(u, { rejectUnauthorized: false}),
            class: WebSocket
        }
        }).then(async domain => {
            const modelService = domain.models();
            modelService.history(model).then(async model => {
                resolve(model.root().get('content').value());
            });
        });
    });
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

async function update_use_mv(port_machine, callback)
{   return new Promise(async resolve => {
        bd.actualizar_uso_mv(port_machine);
        resolve(callback);
    });
}