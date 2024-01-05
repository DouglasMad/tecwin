const {lerArquivo} = require('./importncm');
const {apist} = require('./ApiSt');
const {buscarNCMs} = require('./ApiPis');


async function execConect(){
    try {
        const resultNcm = await lerArquivo(); //chama primeira api
        console.log('Resultado ImportNCM: ', resultNcm);

        const resultSt = await apist(); // chama a segunda api
        console.log('resultado ApiSt: ', resultSt);

        const resultPis = await buscarNCMs(); // chama a terceira api
        console.log('Resultado ApiPis:',resultPis);


    } catch (error) {
        console.error(error)
    }
}

module.exports = {
    execConect: execConect
}