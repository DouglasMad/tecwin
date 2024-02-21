const axios = require('axios');

async function fazerRequisicaoAPI() {
    const ncm = '73269090';
    const chave = 'TFACS-Q4LVT-XYYNF-ZNW59';
    const cliente = '02119874';
    const formato = 'json';

    const url = `https://ics.multieditoras.com.br/ics/pis?chave=${chave}&cliente=${cliente}&ncm=${ncm}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        // Acessar o array `pis` e filtrar pelo `nomeRegra` especificado
        const resultadoFiltrado = data.pis.filter(regra => regra.nomeRegra === "Alíquota Básica - Não Cumulativo vendendo para não cumulativo");

        // Verificar se encontrou o objeto desejado e então imprimir seus dados
        if (resultadoFiltrado.length > 0) {
            // Considera-se que haverá apenas um objeto correspondente, então imprime apenas o primeiro resultado
            console.log(JSON.stringify(resultadoFiltrado[0], null, 2));
        } else {
            console.log('Nenhuma regra corresponde ao critério de filtro.');
        }
    } catch (error) {
        console.error('Erro ao fazer a chamada API:', error);
    }
}

fazerRequisicaoAPI();