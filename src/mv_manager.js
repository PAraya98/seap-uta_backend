const bd = require('./bd_query'); 
const ssh_manager = require('./ssh_manager');
const { exec } = require("child_process");
const config = require('./config'); 
let docker_port = {value: config.docker.port_init};
const tc = require("timezonecomplete");   
const { DateTime } = require('timezonecomplete');
module.exports = { create_mv, rm_docker_container }



// Función que se encarga de eliminar las máquinas virtuales sin utilizar

async function mv_rm_all()
{   machines = await bd.get_mvs();
    console.log("machines: ",machines);
    bd.rm_mvs();
    for (let i = 0; i < machines.length; i++) {
        rm_docker_container(machines[i]['id']);
    }
}


mv_cleaner(config.mv_manager.checktime, config.mv_manager.rm_before); // 2 horas

async function mv_cleaner(checktime, rm_before){
    setInterval(async () => {
        try {
            var machines = await bd.get_mvs();
            var end = new DateTime(await bd.get_current_time(), 'YYYY-MM-DD hh:mm:ss');
            for (let i = 0; i < machines.length; i++) {
                start = new DateTime(machines[i]['last_use'], 'YYYY-MM-DD hh:mm:ss');
                if(end.diff(start).hours() > rm_before)
                {   bd.eliminar_mv(machines[i]['id']);
                    rm_docker_container(machines[i]['id']);
                }
            }
        } catch (error) {
            console.log("Error limpiando máquinas virtuales: ", error);
        }

    }, checktime*1000*60*60)
}

main()
async function main()
{   mv_rm_all();
}


// Función que se encarga de crear máquinas virtuales para el repositorio que la solicite 
async function create_mv(req){
    const modelId = req.body.modelId;
    const username = req.body.username;

    return new Promise(async resolve => {

        var mv_create = await bd.crear_mv(docker_port, modelId);
        var rolname = await bd.get_rol_name(modelId, username);
        if(mv_create.creada)
        {   const id_container = await exec_docker_container(mv_create.port_machine);
            await bd.set_mv_id(mv_create.port_machine, id_container)
            await ssh_manager.init_virtual(modelId, mv_create.port_machine);
            await new Promise (resolve => {setTimeout(() => resolve("Ready"), 5000)});
            bd.set_mv_funcionando(mv_create.port_machine);
            resolve({port: mv_create.port_machine, rol: rolname});
            bd.actualizar_uso_mv(mv_create.port_machine);
        }
        else
        {   var mv_info = await bd.get_mv_info(modelId);
            if(mv_info[0]['state'] === 1)
            {   resolve({port: mv_info[0]['port'], rol: rolname});
            }
            else
            {   while(mv_info[0]['state'] === 0)
                {   mv_info = await bd.get_mv_info(modelId);
                    await new Promise (resolve => {setTimeout(() => resolve("Ready"), 1000)});
                    if (mv_info[0]['state'] === 1)
                    {   resolve({port: mv_info[0]['port'], rol: rolname});
                    }
                }
            }
            bd.actualizar_uso_mv(mv_info[0]['port']);
        }
    });
}

async function exec_docker_container(port)
{   return new Promise(resolve => {
    //docker run -d -e PUID=1000 -e USER_NAME=seap-uta -e SUDO_ACCESS=true -e USER_PASSWORD=1234 -e PGID=1000 -e PASSWORD_ACCESS=true -e TZ=Europe/London -p "+port+":2222 --restart unless-stopped linuxserver/openssh-server
        exec("docker run -d -p "+port+":2222 seap_uta_test", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
}


async function rm_docker_container(id)
{   return new Promise(resolve => {
        exec("docker stop "+id, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            exec("docker rm "+id, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                resolve();
            })
        })
    });
}




