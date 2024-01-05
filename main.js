const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { execConect } = require('./conexao');

let tray = null;
let settingsWindow = null;
let mainWindow = null;

app.whenReady().then(() => {
    tray = new Tray(path.join(__dirname, './img/icon.ico'));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Star Info', type: 'normal', click: abrirConfigurador },
        { label: 'Sair', type: 'normal', click: () => app.quit() }
    ]);

    tray.setToolTip('Star Info');
    tray.setContextMenu(contextMenu);

    // Adiciona um listener para o evento de clique no ícone da bandeja
    tray.on('click', () => {
        abrirConfigurador();
    });
});


function abrirConfigurador() {
    // Cria uma nova janela para as configurações
    settingsWindow = new BrowserWindow({
        icon: './img/icon.ico',
        width: 400,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true
    });



    // Carrega html
    settingsWindow.loadFile('./index.html');

    ipcMain.on('salvar-configuracoes', (event, configuracoes) => {
        console.log('Configurações salvas:', configuracoes);

        // Agende a execução da API com base no horário fornecido
        cron.schedule(configuracoes.horario, () => {
            // Lógica para iniciar a execução da sua API (execConect)
            execConect(); // Certifique-se de implementar esta função
            console.log('API iniciada no horário:', configuracoes.horario);
        });

        // Caminho para o arquivo de configurações (pode ser ajustado conforme necessário)
        const caminhoArquivo = path.join(app.getPath('userData'), 'configuracoes.json');

        // Lê as configurações existentes do arquivo (se existir)
        let configuracoesExist = {};
        try {
            const arquivoExistente = fs.readFileSync(caminhoArquivo, 'utf-8');
            configuracoesExist = JSON.parse(arquivoExistente);
        } catch (error) {
            console.error('Erro ao ler o arquivo de configurações:', error);
        }

        // Mescla as novas configurações com as existentes
        const novasConfiguracoes = { ...configuracoesExist, ...configuracoes };

        // Grava as configurações atualizadas no arquivo
        try {
            fs.writeFileSync(caminhoArquivo, JSON.stringify(novasConfiguracoes));
            console.log('Configurações salvas com sucesso.');
        } catch (error) {
            console.error('Erro ao salvar o arquivo de configurações:', error);
        }

        // Fecha a janela de configurações se necessário
        if (settingsWindow) {
            settingsWindow.close();
            settingsWindow = null;
        }
    });

    // Garante que será fechado
    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

app.on('activate', () => {
    
});

app.on('close-main-window', () => {
    // Esconde a janela principal em vez de fechar (pode ser ajustado conforme necessário)
    if (mainWindow) {
        mainWindow.hide();
    }
});

// Tratamento para o fechamento de todas as janelas
app.on('window-all-closed', () => {
    // Mantém o aplicativo rodando mesmo após o fechamento de todas as janelas
});