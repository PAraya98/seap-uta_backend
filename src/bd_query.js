const fs = require('fs');
const { makeDb } = require('mysql-async-simple');
const { JsonWebTokenError } = require('jsonwebtoken');
const { Interface } = require('readline');
const mysql = require('mysql2');
let config = require('./config'); 
var Promise = require('promise');


const connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    port: config.mysql.port,
    dateStrings: 'date'
});

const bd = makeDb();
bd.connect(connection);

module.exports = { crear_mv, eliminar_mv, actualizar_uso_mv, get_mv_state, rm_mvs, get_mvs, crear_repositorio, get_current_time, set_mv_funcionando, set_mv_id, get_mv_info }


async function crear_repositorio(id_convergence, name, id_lenguaje)
{   try {
        await bd.query(connection, "insert into repositorio (id_convergence, name, id_lenguaje) values ('"+id_convergence+"', '"+name+"', '"+id_lenguaje+"')");
        return false;
    } catch (err) {
        return true;
    }
}

async function crear_mv(docker_port, id_repositorio)
{   return new Promise(async resolve => {
        try
        {   var id_repositorio_ = await  bd.query(connection, "select id_repositorio from repositorio where id_convergence = '"+id_repositorio+"'");
            port = docker_port.value;
            await bd.query(connection, "insert into maquina_virtual (id, port, last_use, state, id_repositorio) values ('inicializando..', '"+port+"', CURRENT_TIMESTAMP, '0','"+id_repositorio_[0]['id_repositorio']+"')");
            docker_port.value++;
            resolve({creada: true, port_machine: port});
        }
        catch(err)
        {   if(err['errno'] === 1062 && err['sqlMessage'].includes("maquina_virtual.id_repositorio_UNIQUE"))
            { resolve({creada: false});
            }
            else if(err['errno'] === 1062 && err['sqlMessage'].includes("maquina_virtual.port_UNIQUE"))
            {   resolve(crear_mv(docker_port, id_repositorio));
            }
            else
            { console.log("Error en la consulta a la base de datos (crear_mv): ",err);
            }
        }
    });
}




async function set_mv_id(port, id)
{   try
    {   id_set = await bd.query(connection, "update maquina_virtual set id = '"+id+"' where port = '"+port+"'");
        return id_set;
    }
    catch
    {   console.log("Error en la consulta a la base de datos (init_mv): ", err);
    }
}

async function get_mv_info(id_repositorio)
{   try 
    {   mvdata = await bd.query(connection, "select state, port from maquina_virtual inner join repositorio on maquina_virtual.id_repositorio = repositorio.id_repositorio where id_convergence = '"+id_repositorio+"'");
        return mvdata;
    } 
    catch (err) 
    {    console.log("Error en la consulta a la base de datos (get_mv_by_convergence_id): ", err);
    }

}


async function set_mv_funcionando(port)
{   try
    {   state_change = await bd.query(connection, "update maquina_virtual set state = '1' where port = '"+port+"'");
        return state_change;
    }
    catch
    {   console.log("Error en la consulta a la base de datos (init_mv): ", err);
    }
}

async function eliminar_mv(id) 
{   try
    {   deleted = await bd.query(connection, "delete from maquina_virtual where id = '"+id+"'");
        return deleted;
    }
    catch(err)
    {   console.log("Error en la consulta a la base de datos (eliminar_mv): ", err);
    }
}

async function actualizar_uso_mv(port)
{    try
    {   updated = await bd.query(connection, "update maquina_virtual set last_use = CURRENT_TIMESTAMP where port = '"+port+"'");
        return updated;
    }
    catch(err)
    {   console.log("Error en la consulta a la base de datos (actualizar_uso_mv): ", err);
    }
}

async function get_mv_state(port)
{   try 
    {   mv_state = await bd.query(connection, "select state from maquina_virtual where port = '"+port+"'");
        return mv_state[0]['state'];
    } 
    catch (err) 
    {   return false;   
    }
}

async function get_current_time()
{   try {
        current_time = await bd.query(connection, "select CURRENT_TIMESTAMP");

        return current_time[0]['CURRENT_TIMESTAMP'];
    } catch (error) {
        console.log("Error en la base de datos: ", err);
    }

}

async function get_mvs()
{   try
    {   machines = await bd.query(connection, "select id, last_use from maquina_virtual");
        return machines;
    }
    catch(err)
    {   return new Array();
    }
}

async function rm_mvs()
{   try
    {   machines = await bd.query(connection, "delete from maquina_virtual");
        return true;
    }
    catch(err)
    {   return false;
    }    
}
