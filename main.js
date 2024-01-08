// Importa os módulos necessários do Electron
const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mysql = require('mysql');
const cron = require('node-cron');
const moment = require('moment');
const { execConect } = require('./conexao'); // Suponho que 'conexao' seja um módulo personalizado

// Configurações do banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm'
};

// Query para inserir horário no banco de dados
const insertQuery = 'INSERT INTO tec_hora (horaexecute) VALUES (?)';

// Função para criar uma conexão com o banco de dados
function conexaoDb() {
    return mysql.createConnection(dbConfig);
}

// Variáveis globais
let tray = null;
let settingsWindow = null;
const connection = conexaoDb(); // Cria uma conexão com o banco de dados

// Configuração inicial quando o aplicativo está pronto
app.whenReady().then(() => {
    // Configuração do ícone na bandeja do sistema
    tray = new Tray(path.join(__dirname, '/img/icon.ico'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Configurações', type: 'normal', click: abrirConfigurador },
        { label: 'Sair', type: 'normal', click: () => app.quit() }
    ]);
    tray.setToolTip('Star Info');
    tray.setContextMenu(contextMenu);

    // Abre o configurador quando o ícone na bandeja é clicado
    tray.on('click', () => {
        abrirConfigurador();
    });
});

// Função para abrir a janela de configurações
function abrirConfigurador() {
    if (!settingsWindow) {
        settingsWindow = new BrowserWindow({
            icon: './img/icon.ico',
            width: 1400,
            height: 1200,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            autoHideMenuBar: true
        });

        // Carrega o arquivo HTML na janela de configurações
        settingsWindow.loadFile('index.html');

        // Manipula o evento de fechamento da janela
        settingsWindow.on('closed', () => {
            settingsWindow = null;
        });
    }
}

// Manipula a mensagem para salvar configurações recebida do front-end
ipcMain.on('salvar-configuracoes', (event, configuracoes) => {
    // Insere o horário no banco de dados
    connection.query(insertQuery, [configuracoes.horario], (err, results) => {
        if (err) {
            console.error('Erro ao inserir horario no banco de dados:', err);
            return;
        }

        console.log('Horário inserido com sucesso:', configuracoes.horario);

        // Converte o horário para uma expressão cron e agenda a tarefa
        const expressaoCron = moment(configuracoes.horario, 'HH:mm:ss').format('s m H * * *');
        try {
            cron.schedule(expressaoCron, () => {
                console.log('Executando script', configuracoes.horario);
                execConect();
            });            
        } catch (error) {
            console.error('Erro ao agendar cron:', error);
        }

        // Fecha a janela de configurações se estiver aberta
        if (settingsWindow) {
            settingsWindow.close();
        }
    });
});

// Manipula o evento de fechamento de todas as janelas
app.on('window-all-closed', () => {
    // Não faz nada, você pode adicionar código aqui se desejar
});
