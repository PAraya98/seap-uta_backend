const bd = require('./bd_query');
const session_manager = require('./session_manager');
const mv_manager = require('./mv_manager');

module.exports = {  lista_repositorios, crear_repositorio, eliminar_repositorio,
                    listar_miembros, agregar_miembro, modificar_miembro, eliminar_miembro, obtener_rol    
                 }

async function lista_repositorios(req)
{   return new Promise(async resolve => {
        const token = req.body.token;
        const is_user = await session_manager.validate(req);

        if(is_user)
        {   const username = await session_manager.jwt_get_username(token);
            console.log(username)
            const my_repo = await bd.listar_repositorios_usuario(username);
            const our_repo = await bd.listar_repositorios_usuario_participa(username);
            const pub_repo = await bd.listar_repositorios_publicos(username);
            resolve({message: "Lista enviada!", my_repo: my_repo, our_repo: our_repo, pub_repo: pub_repo})
        }
        else
        {   resolve({message: "Token invalido!"})
        }
    });    
}

async function crear_repositorio(req)
{   return new Promise(async resolve => {
        const token = req.body.token;
        const is_user = await session_manager.validate(req);

        if(is_user)
        {   const username = await session_manager.jwt_get_username(token);
            const id_convergence = req.body.model_id;
            const name = req.body.name;
            const visibility = req.body.visibility;
            await bd.crear_repositorio(username, id_convergence, name, 1, visibility)
            .then(resolve({message: "Creación realizada!"}));
        }
        else
        {   resolve({message: "Token invalido!"})
        }
    });    
}

async function eliminar_repositorio(req)
{   return new Promise(async resolve => {
        const token = req.body.token;
        const is_user = await session_manager.validate(req);

        if(is_user)
        {   const username = await session_manager.jwt_get_username(token);
            const id_convergence = req.body.modelId;
            const id_mv = await bd.get_mv_info(id_convergence);
            if(JSON.stringify(id_mv) != "[]") 
            {   console.log(id_mv[0]['id'])
                await bd.eliminar_mv(id_mv[0]['id']);
                mv_manager.rm_docker_container(id_mv[0]['id']);
            }
            bool = await bd.eliminar_repositorio(id_convergence, username);
            if(bool)
            {   resolve({message: "Eliminación realizada!"});
            }
            else
            {   resolve({message: "No eres el creador del repositorio!"});
            }
        }
        else
        {   resolve({message: "Token invalido!"})
        }
    })
}

async function listar_miembros(req)
{   return new Promise(async resolve => {
        const is_user = await session_manager.validate(req);

        if(is_user)
        {   const id_convergence = req.body.modelId;
            resolve({message: "Lista enviada!", members: await bd.listar_miembros_repositorio(id_convergence)})
        }
        else
        {   resolve({message: "Token invalido!"})
        }
    });   

}

async function agregar_miembro(req)
{   return new Promise(async resolve => {
        const token = req.body.token;

        if(is_user)
        {   const target_user = req.body.target_user;
            const id_convergence = req.body.modelId;
            const rol = req.body.rol;
            resolve({message: await bd.agregar_miembro(target_user, rol, id_convergence)});
        }
        else
        {   resolve({message: "Token invalido!"})
        }
    });    
}

async function eliminar_miembro(req)
{   return new Promise(async resolve => {
        const is_user = await session_manager.validate(req);

        if(is_user)
        {   const id_convergence = req.body.modelId;
            const target_user = req.body.target_user;
            await bd.eliminar_miembro(id_convergence, target_user)
            .then(resolve({message: "Miembro eliminado!"}));
        }
        else
        {   resolve({message: "Token invalido!"})
        }
    });    
}

async function modificar_miembro(req)
{   return new Promise(async resolve => {
        const is_user = await session_manager.validate(req);

        if(is_user)
        {   const id_convergence = req.body.modelId;
            const target_user = req.body.target_user;
            const rolname = req.body.rolname;
           resolve({message:  await bd.modificar_miembro(id_convergence, target_user, rolname)});
        }
        else
        {   resolve({message: "Token invalido!"})
        }
    });    
}

async function obtener_rol(req)
{   return new Promise(async resolve => {
        const token = req.body.token;
        const is_user = await session_manager.validate(req);
        const username = await session_manager.jwt_get_username(token);
        if(is_user)
        {   const id_convergence = req.body.modelId;
            resolve({rol: await bd.get_rol_name(id_convergence, username)});
        }
        else
        {   resolve({rol: "ERROR"})
        }
    });    
}