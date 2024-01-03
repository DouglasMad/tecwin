const axios = require('axios');

async function main() {
    const ncm = "84831050"; // Substitua pelo valor de NCM desejado
    const uf_saida = "RJ";
    const chave = "TFACS-Q4LVT-XYYNF-ZNW59";
    const cliente = "02119874";
    const formato = "json";

    try {
        // Realizando a consulta à API
        const url = `https://ics.multieditoras.com.br/ics/st/${ncm}/${uf_saida}?chave=${chave}&cliente=${cliente}&formato=${formato}`;
        const response = await axios.get(url);

        // Verificando se a resposta contém dados
        if (response.data && response.data.st) {
            const stData = response.data.st;
            console.log("Dados recebidos da API:", stData);

            // Chame aqui a função para salvar os dados no banco
            // saveDataToDatabase(stData, ncm);

        } else {
            console.log("Nenhum dado recebido da API.");
        }

    } catch (error) {
        // Imprimindo detalhes do erro no terminal
        console.error('Erro ao fazer a chamada API:', error.message);
    }
}

main();