// Importa os módulos necessários do Electron
const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mysql = require('mysql');
const cron = require('node-cron');
const moment = require('moment');
const { execConect, atualizarConsoleHTML, atualizarStatusHTML, reiniciarAplicacao } = require('./conexao');
const { reiniciarBancoAsync, connectDB } = require('./importncm');

// Configurações do banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm',
    port: '3306'
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
let connection = null;

// Função para iniciar a aplicação
async function iniciarApp() {
    connection = await connectDB();
    try {
        await reiniciarBancoAsync(connection);
        console.log('Banco de dados reiniciado com sucesso!');
    } catch (error) {
        console.error('Erro ao reiniciar banco de dados: ', error);
    }
}

// Configuração inicial quando o aplicativo está pronto
app.whenReady().then(() => {
    iniciarApp().then(() => {
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

process.on('SIGINT', () => {
    if (mainWindow) {
        // Fecha a janela principal
        mainWindow.close();
    }

    // Reinicia a aplicação
    app.relaunch();
    app.quit();
});

// Função para inserir um novo horário no banco de dados e agendar a tarefa cron
async function inserirHorarioNoBanco(configuracoes) {
    // Verifica se o horário foi definido pelo usuário
    if (!configuracoes.horario) {
        console.error('Nenhum horário foi definido pelo usuário.');
        return;
    }

    // Insere o horário no banco de dados
    connection.query(insertQuery, [configuracoes.horario], (err, results) => {
        if (err) {
            console.error('Erro ao inserir horário no banco de dados:', err);
            return;
        }

        console.log('Horário inserido com sucesso:', configuracoes.horario);

        // Converte o horário para uma expressão cron e agenda a tarefa
        const expressaoCron = moment(configuracoes.horario, 'HH:mm:ss').format('s m H * * *');

        try {
            cron.schedule(expressaoCron, async () => {
                console.log('Executando script', configuracoes.horario);
                // Agora executa o código de conexão aqui
                await execConect();
            });
        } catch (error) {
            console.error('Erro ao agendar cron:', error);
        }

        // Fecha a janela de configurações se estiver aberta
        if (settingsWindow) {
            settingsWindow.close();
        }
    });
}

// Manipula a mensagem para salvar configurações recebida do front-end
ipcMain.on('salvar-configuracoes', (event, configuracoes) => {
    // Chama a função para inserir o horário no banco de dados
    inserirHorarioNoBanco(configuracoes).catch(error => {
        console.error('Erro ao salvar configurações:', error);
    });
});

// Manipula o evento de fechamento de todas as janelas
app.on('window-all-closed', () => {
    // Não faz nada, você pode adicionar código aqui se desejar
});
