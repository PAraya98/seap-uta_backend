const fs = require('fs');
const { makeDb } = require('mysql-async-simple');
const { JsonWebTokenError } = require('jsonwebtoken');
const { Interface } = require('readline');
const mysql = require('mysql2');
let config = require('./config'); 
var Promise = require('promise');
const crypto = require('crypto');


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

module.exports =    {   crear_mv, eliminar_mv, actualizar_uso_mv, get_mv_state, rm_mvs, get_mvs, crear_repositorio, get_current_time, set_mv_funcionando, set_mv_id, get_mv_info,
                        validar_usuario, crear_usuario, validar_username,
                        agregar_miembro, listar_miembros_repositorio, listar_repositorios_publicos, listar_repositorios_usuario, listar_repositorios_usuario_participa,
                        get_rol_name, eliminar_repositorio, eliminar_miembro, modificar_miembro 

                    }


//MANEJO DE CUENTAS DE USUARIO

async function crear_usuario(username, password, email)
{ try
  {   password = crypto.createHmac('sha256', config.crypto.secret).update(password).digest('hex');
      await bd.query(connection, "insert into usuario (username, password, email) values ('"+username+"', '"+password+"', '"+email+"')");
      return(true);
  }
  catch(err)
  {   console.log("Error en la función (crear_usuario) módulo de consultas: "+ err);  
      return(false);      
  }
}

async function validar_usuario(username, password)
{try
  {   password = crypto.createHmac('sha256', config.crypto.secret).update(password).digest('hex');
      res = await bd.query(connection, "select 1 from usuario where username= '"+username+"' AND password='"+password+"'");
      if(JSON.stringify(res) != "[]") return true;
      else return false;
     
  }
  catch
  {   console.log("Error en la función (validar_usuario) módulo de consultas: "+ err);        
      return false;
  }
}

async function validar_username(username) 
{   try
    {   res = await bd.query(connection, "select id_usuario from usuario where username = '"+username+"'");
        if(JSON.stringify(res) != "[]")
        {   return {bool: true};
        }
        else
        {   return {bool: false};
        }
    }
    catch(err)
    {   console.log("Error en la función (validar_username) módulo de consultas: "+ err);     
        return({message: "Error en la base de datos."}); 
    }
}

//MANEJO DE REPOSITORIOS Y MIEMBROS

async function crear_repositorio(username,id_convergence, name, id_lenguaje, visibility)
{   try {
        
        const id_usuario = await bd.query(connection, "select id_usuario from usuario where username='"+username+"'")
        const data = await bd.query(connection, "insert into repositorio (id_convergence, name, id_lenguaje, visibility, id_usuario) values ('"+id_convergence+"', '"+name+"', '"+id_lenguaje+"', '"+visibility+"', '"+id_usuario[0]['id_usuario']+"')");

        await bd.query(connection, "insert into miembro (id_rol, id_usuario, id_repositorio) values ('1', '"+id_usuario[0]['id_usuario']+"', '"+data['insertId']+"')")
        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
}

async function eliminar_repositorio(modelId, username)
{   const id_usuario = await bd.query(connection, "select id_usuario from usuario where username='"+username+"'");
    const id_repositorio = await get_id_repositorio(modelId);
    const bool = await es_creador(id_usuario[0]['id_usuario'],id_repositorio);
    if(bool)
    {   try 
        {   
            await bd.query(connection, "delete from miembro where id_repositorio = '"+id_repositorio+"'");
            await bd.query(connection, "delete from repositorio where id_repositorio = '"+id_repositorio+"'");    
            return true;
        }
        catch(err)
        {   console.log("Error en la función (eliminar_repositorio) módulo de consultas: ", err);
            return false;
        }
    }
    else return false
    
}

async function es_creador(id_usuario, id_repositorio)
{   try {   res = await bd.query(connection, "select 1 from miembro where id_usuario = "+id_usuario+" and id_repositorio = '"+id_repositorio+"'");
        
            if(JSON.stringify(res) == "[]")
            {   return false;
            }   
            else return true;
    
    } catch (err) {
        console.log("Error en la función (es_creador) módulo de consultas: ", err);
        return false;
    }
} 

async function obtener_id_usuario(username)
{   try
    {   console.log(username);
        res = await bd.query(connection, "select id_usuario from usuario where username = '"+username+"'");
        console.log(res)
        if(JSON.stringify(res) != "[]")
        {   return res[0]['id_usuario'];
        }
        else
        { return "ERROR"
        }
    }
    catch(err)
    {   console.log("Error en la función (obtener_id_usuario) módulo de consultas: "+ err);        
    }
}

async function listar_repositorios_usuario(username)
{   try
    {   res = await bd.query(connection, "select repositorio.id_convergence as id, CONCAT(repositorio.name, '<separator> mi') as name, rol.name as role from usuario inner join miembro on usuario.id_usuario = miembro.id_usuario inner join rol on rol.id_rol = miembro.id_rol inner join repositorio on repositorio.id_repositorio = miembro.id_repositorio where username = '"+username+"' and rol.name = 'Creador'");
        return(res);
    }
    catch(err)
    {   console.log("Error en la función (listar_repositorios_usuario) módulo de consultas: ", err);
    }
}

async function listar_repositorios_usuario_participa(username)
{   try
    {   res = await bd.query(connection, "select CONCAT(name, '<separator>' , username) as name, id, role from (select repositorio.id_usuario, repositorio.id_convergence as id, repositorio.name as name, rol.name as role from usuario inner join miembro on usuario.id_usuario = miembro.id_usuario inner join rol on rol.id_rol = miembro.id_rol inner join repositorio on repositorio.id_repositorio = miembro.id_repositorio where username = '"+username+"' and rol.name != 'Creador') as T1 inner join usuario on usuario.id_usuario = T1.id_usuario");
        
        return(res);
    }
    catch(err)
    {   console.log("Error en la función (listar_repositorios_usuario) módulo de consultas: ", err);
    }
}
async function listar_repositorios_publicos(username)
{   try
    {   res = await bd.query(connection, "select CONCAT(name, '<separator>' , username) as name, id, role from (select repositorio.id_convergence as id, repositorio.id_usuario, repositorio.name as name, rol.name as role from usuario inner join miembro on usuario.id_usuario = miembro.id_usuario inner join rol on rol.id_rol = miembro.id_rol inner join repositorio on repositorio.id_repositorio = miembro.id_repositorio where visibility = '1' and usuario.username = '"+username+"' UNION select repositorio.id_convergence as id, repositorio.id_usuario, repositorio.name as name, 'Lector' as role from repositorio where visibility = '1' and id_repositorio NOT IN (select repositorio.id_repositorio from repositorio inner join miembro on miembro.id_repositorio = repositorio.id_repositorio inner join usuario on miembro.id_usuario = usuario.id_usuario where usuario.username = '"+username+"'))as T1 inner join usuario on usuario.id_usuario = T1.id_usuario");
        return(res);
    }
    catch(err)
    {   console.log("Error en la función (listar_repositorios_publicos) módulo de consultas: ", err);
        return({message: "Error en la base de datos."});
    }
}

async function listar_miembros_repositorio(modelId)
{   try
    {   res = await bd.query(connection, "select usuario.username as username, rol.name as role from (select id_usuario, id_rol from miembro where id_repositorio = (select id_repositorio from repositorio where id_convergence = '"+modelId+"')) as T1 inner join usuario on T1.id_usuario = usuario.id_usuario inner join rol on T1.id_rol = rol.id_rol");
        console.log(res);
        return(res);
    }
    catch(err)
    {   console.log("Error en la función (listar_miembros_repositorio) módulo de consultas: ", err);
    }
}

async function get_visibility(id_repositorio)
{   try
    {   res = await bd.query(connection, "select visibility from repositorio where id_repositorio = '"+id_repositorio+"'");
        if(JSON.stringify(res) != "[]")
        {   return res[0]['visibility'];
        }
        else
        {  return JSON.stringify(res);
        }
    }
    catch(err)
    {   console.log("Error en la función (get_visibility) módulo de consultas: "+ err);     
        return{message: "Error en la base de datos."};   
    }
}

async function get_id_repositorio(modelId)
{   try {
        res = await bd.query(connection, "select id_repositorio from repositorio where id_convergence = '"+modelId+"'");
        if(JSON.stringify(res) != "[]")
        {   return res[0]['id_repositorio'];
        }
        else
        {  return JSON.stringify(res);
        }
    } catch (error) {
        console.log("Error en la función (get_visibility) módulo de consultas: "+ err);     
    }
}



async function obtener_id_rol(rolname)
{   try {
    res = await bd.query(connection, "select id_rol from rol where name = '"+rolname+"'");
    if(JSON.stringify(res) != "[]")
    {   return res[0]['id_rol'];
    }
    else
    {  return JSON.stringify(res);
    }
    } catch (error) {
        console.log("Error en la función (get_visibility) módulo de consultas: "+ err);     
    }
}


async function agregar_miembro(username, rolname, modelId)
{   const id_usuario = await obtener_id_usuario(username);
    const id_repositorio = await get_id_repositorio(modelId);
    try
    {   const res = await bd.query(connection, "select 1 from miembro where id_usuario = "+id_usuario+" and id_repositorio = '"+id_repositorio+"' and (id_rol = '1' or  id_rol = '2')");
        
        if(JSON.stringify(res) == "[]")
        {   const id_rol = await obtener_id_rol(rolname) 
            await bd.query(connection, "insert into miembro (id_usuario, id_rol, id_repositorio) values ('"+id_usuario+"', '"+id_rol+"', '"+id_repositorio+"')");       
            return "Miembro "+username+"agregado como "+rolname+".";
        }   
        else return "No puedes agregar miembros!!";
    }
    catch(err)
    {   console.log("Error en la función (agregar_miembro) módulo de consultas: ", err);
        return "Error en la base de datos.";
    }
}

async function eliminar_miembro(modelId, username)
{   try
    {   const id_usuario = await obtener_id_usuario(username);
        const id_repositorio = await get_id_repositorio(modelId);
        const res = await bd.query(connection, "select 1 from miembro where id_usuario = "+id_usuario+" and id_repositorio = '"+id_repositorio+"' and (id_rol = '1' or  id_rol = '2')");
        if(JSON.stringify(res) == "[]")
        {   await bd.query(connection, "delete from miembro where id_repositorio = '"+id_repositorio+"' and id_usuario = '"+id_usuario+"'");
            return "Usuario "+username+" eliminado del repositorio.";
        }
        else return "No puedes eliminar usuarios";
    }
    catch(err)
    {   console.log("Error en la consulta a la base de datos (eliminar_mv): ", err);
        return false;
    }
}

async function modificar_miembro(modelId, username, rolname)
{    try
    {   const id_usuario = await obtener_id_usuario(username);
        const id_repositorio = await get_id_repositorio(modelId);
        const res = await bd.query(connection, "select 1 from miembro where id_usuario = "+id_usuario+" and id_repositorio = '"+id_repositorio+"' and (id_rol = '1' or  id_rol = '2')");
    
        if(JSON.stringify(res) == "[]")
        {   await bd.query(connection, "update miembro set rolname = '"+rolname+"' where id_usuario = '"+id_usuario+"' and id_repositorio '"+id_repositorio+"'");
            return "Miembro "+username+" ha sido definido como "+rolname+".";
        }
        else return "No puedes modificar miembros!!";
    }
    catch
    {   console.log("Error en la consulta a la base de datos (init_mv): ", err);
        return false;
    }
}

async function get_rol_name(modelId, username)
{   try {
    const id_repositorio = await get_id_repositorio(modelId)
    if(JSON.stringify(id_repositorio) != "[]")
    {   const id_usuario = await obtener_id_usuario(username)
        console.log(id_usuario)
        const rolname = await bd.query(connection, "select name from miembro inner join rol on rol.id_rol = miembro.id_rol where id_repositorio = '"+id_repositorio+"' and id_usuario = '"+id_usuario+"'");
        console.log(rolname)
        if(JSON.stringify(rolname) != "[]")
            {   return(rolname[0]['name']);
            }
            else
            {   visibility = await get_visibility(id_repositorio);
                if(visibility === 1)
                {   return("Lector");
                }
                else
                {   return("ERROR");
                }
            }
    }
    else
    {  return JSON.stringify(res);
    }
    } catch (error) {
        console.log("Error en la función (get_visibility) módulo de consultas: "+ error);     
    }
}

//MANEJO DE MÁQUINAS VIRTUALES

async function crear_mv(docker_port, id_repositorio)
{   return new Promise(async resolve => {
        try
        {   var id_repositorio_ = await  get_id_repositorio(id_repositorio);
            port = docker_port.value;
            await bd.query(connection, "insert into maquina_virtual (id, port, last_use, state, id_repositorio) values ('inicializando..', '"+port+"', CURRENT_TIMESTAMP, '0','"+id_repositorio_+"')");
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
    {   mvdata = await bd.query(connection, "select maquina_virtual.id, state, port from maquina_virtual inner join repositorio on maquina_virtual.id_repositorio = repositorio.id_repositorio where id_convergence = '"+id_repositorio+"'");
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
