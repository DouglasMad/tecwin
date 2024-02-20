const axios = require('axios');

async function fazerRequisicaoAPI() {
    const ncm = '73269090';
    const chave = 'TFACS-Q4LVT-XYYNF-ZNW59';
    const cliente = '02119874';
    const formato = 'json';

    const url = (`https://ics.multieditoras.com.br/ics/pis?chave=${chave}&cliente=${cliente}&ncm=${ncm}`);
    try {
        const response = await axios.get(url);
        const data = response.data;

        // Imprimindo toda a resposta no terminal de maneira formatada
        console.log(JSON.stringify(data, null, 2));

        // Imprimindo o conteúdo dos arrays 'cst' e 'nota', se eles existirem
        if (data.cst && Array.isArray(data.cst)) {
            console.log('CST:', data.cst);
        }
        if (data.nota && Array.isArray(data.nota)) {
            console.log('Nota:', data.nota);
        }
    } catch (error) {
        console.error('Erro ao fazer a chamada API:', error);
    }
}

fazerRequisicaoAPI();
