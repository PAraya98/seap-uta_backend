const jwt = require('jsonwebtoken');
const config = require('./config');
const bd = require('./bd_query');
module.exports = { login, register, validate, jwt_get_username }

async function login(req)
{   return new Promise(async resolve =>{
        var username = req.body.username;
        var password = req.body.password;
        var resultado = await bd.validar_usuario(username, password);
        console.log(resultado);
        if(resultado)
        {   const token = jwt.sign({username: req.body.username}, config.jwt.secret);
            resolve({message: "Login correcto!", username: username, token: token});
        }
        else
        {   resolve({message: "Login incorrecto!"});
        }
    })
}

async function register(req)
{   return new Promise(async resolve =>{
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;

        var resultado = await bd.crear_usuario(username, password, email);
        if(resultado)
        {   resolve({"message": "El usuario se ha registrado correctamente."});;
        }
        else
        {   resolve({"message": "Error al crear el usuario"});
        }
    })
}

async function validate(req)
{   return new Promise(async resolve =>{
        var token = req.body.token;
        resolve(await verify_jwt_token(token));
    })
}

async function verify_jwt_token(token)
{   return new Promise(async resolve =>{
        try{   
            try {
                result = jwt.verify(token, config.jwt.secret).username;
            } catch (error) {
                result = false;
            }            
            resolve(await bd.validar_username(result));
        }
        catch(err)
        {   console.log("Error en la función (verify_jwt_token) módulo index: ", err);
            resolve(false);
        }
    })
}



async function jwt_get_username(token)
{   return new Promise(async resolve =>{
        try
        {   resolve(jwt.verify(token, config.jwt.secret).username);
        }
        catch(err)
        {   console.log("Error en la función (verify_jwt_token) módulo index: ", err);
        }
    })
}