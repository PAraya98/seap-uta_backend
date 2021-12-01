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
    port: config.mysql.port
});

const bd = makeDb();
bd.connect(connection);

module.exports = { crear_mv, eliminar_mv, actualizar_uso_mv }

async function crear_mv(id, port, id_repositorio)
{   return new Promise(async resolve => {
        try
        {   var id_repositorio_ = await  bd.query(connection, "select id_repositorio from repositorio where id_convergence = '"+id_repositorio+"'");
            var inserted = await bd.query(connection, "insert into maquina_virtual (id, port, last_use, id_repositorio) values ('"+id+"', '"+port+"', CURRENT_TIME(), '"+id_repositorio_[0]['id_repositorio']+"')");
            resolve(inserted);
        }
        catch(err)
        {   console.log("Error en la consulta a la base de datos (crear_mv): ", err);
            resolve(err);
        }
    });
}

async function eliminar_mv(id_repositorio) 
{   try
    {   deleted = await bd.query(connection, "delete from seap_uta.maquina_virtual where id_maquina_virtual in (select * from (select id_maquina_virtual from maquina_virtual inner join repositorio on repositorio.id_repositorio = maquina_virtual.id_repositorio where id_convergence = '"+id_repositorio+"') as p)");
        return deleted;
    }
    catch(err)
    {   console.log("Error en la consulta a la base de datos (eliminar_mv): ", err);
    }
}

async function actualizar_uso_mv(id_repositorio)
{    try
    {   updated = await bd.query(connection, "update maquina_virtual set last_use = CURRENT_TIME() where id_maquina_virtual in (select * from (select id_maquina_virtual from maquina_virtual inner join repositorio on repositorio.id_repositorio = maquina_virtual.id_repositorio where id_convergence = '"+id_repositorio+"') as p)");
        return updated;
    }
    catch(err)
    {   console.log("Error en la consulta a la base de datos (actualizar_uso_mv): ", err);
    }
}