let bd = require('./bd_query'); 
const ssh_manager = require('./ssh_manager');
const { exec } = require("child_process");
let docker_port = 10006;

// Función que se encarga de eliminar las máquinas virtuales sin utilizar



async function mv_rm_all()
// hacer la consulta de todas las mvs
// docker stop <your-image-id> &&docker rmi <your-image-id>

async function mv_cleaner(){


    //borrar y actualizar base de datos
    //mysql rm mv with fileid
    // docker stop <your-image-id> &&docker rmi <your-image-id>

}

main()
async function main()
{   a = await create_mv("asdasdsa");
    console.log(a);
}


// Función que se encarga de crear máquinas virtuales para el repositorio que la solicite 
async function create_mv(id_repositorio){
    return new Promise(async resolve => {
        var port = await bd.get_mv(id_repositorio);
        if(port === undefined)
        {   docker_port++;
            port = docker_port;
            const id_container = await exec_docker_container(port);
            await bd.crear_mv(id_container, port, id_repositorio);
            resolve(port);
        }
        else 
        {   console.log("Port: ", port);
            resolve(port);
        }
    });
}

async function exec_docker_container(port)
{   return new Promise(resolve => {
        exec("docker run -d -e PUID=1000 -e USER_NAME=seap-uta -e SUDO_ACCESS=true -e USER_PASSWORD=1234 -e PGID=1000 -e PASSWORD_ACCESS=true -e TZ=Europe/London -p "+port+":2222 -v /path/to/appdata/config:/config --restart unless-stopped linuxserver/openssh-server", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve(stdout);
        });
    });
}




