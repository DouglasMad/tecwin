const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mysql = require('mysql');
const cron = require('node-cron');
const moment = require('moment')
const {execConect} = require('./conexao');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm'
};

const insertQuery = 'INSERT INTO tec_hora (horaexecute) VALUES (?)';

function conexaoDb() {
    return mysql.createConnection(dbConfig);
}

let tray = null;
let settingsWindow = null;
const connection = conexaoDb();

app.whenReady().then(() => {
    tray = new Tray(path.join(__dirname, '/img/icon.ico'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Configurações', type: 'normal', click: abrirConfigurador },
        { label: 'Sair', type: 'normal', click: () => app.quit() }
    ]);

    tray.setToolTip('Minha Aplicação Electron');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        abrirConfigurador();
    });
});

function abrirConfigurador() {
    if (!settingsWindow) {
        settingsWindow = new BrowserWindow({
            icon: './img/icon.ico',
            width: 400,
            height: 300,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            autoHideMenuBar: true
        });

        settingsWindow.loadFile('index.html');

        settingsWindow.on('closed', () => {
            settingsWindow = null;
        });
    }
}

ipcMain.on('salvar-configuracoes', (event, configuracoes) => {
    connection.query(insertQuery, [configuracoes.horario], (err, results) => {
        if (err) {
            console.error('Erro ao inserir horario no banco de dados:', err);
            return;
        }
        console.log('Horário inserido com sucesso:', configuracoes.horario);

        const expressaoCron = moment(configuracoes.horario, 'HH:mm:ss').format('s m H * * *');
        try {
            cron.schedule(expressaoCron, () => {
                console.log('Executando script', configuracoes.horario);
                execConect();
            });            
        } catch (error) {
            console.error('Erro ao agendar cron:', error)
            
        }

        if (settingsWindow) {
            settingsWindow.close();
        }
    });
});

app.on('window-all-closed', () => {
});