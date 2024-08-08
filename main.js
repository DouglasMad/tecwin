/// Importa os módulos necessários do Electron
const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mysql = require('mysql2');
const cron = require('node-cron');
const moment = require('moment');
const { execConect, reiniciarAplicacao } = require('./conexao');
const { reiniciarTabelas } = require('./importncm');


// Configurações do banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'db_ncm',
    port: '3306',
    waitForConnections: true,
    connectionLimit: 0,
    queueLimit: 0
};

// Query para inserir horário no banco de dados
const insertQuery = 'INSERT INTO tec_hora (horaexecute) VALUES (?)';

//Função para criar um pool de conexão
function createPool() {
    return mysql.createPool(dbConfig).promise();
};

// Função para obter uma conexão do pool
const getConnectionFromPool = () => {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          console.error('Erro ao obter conexão do pool:', err);
          reject(err);
        } else {
          resolve(connection);
        }
      });
    });
  };
  

//Criar uma pool de conexão com o db
const pool = createPool()

//Função para reiniciar IMPORTAÇÕES 
async function iniciarApp () {
    // const db = await connectDB()
    try {
    } catch (error) {
        console.error('Erro ao reiniciar banco de dados: ', error)
    }
}

// Variáveis globais
let tray = null;
let settingsWindow = null;

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

    // Configuração inicial de status no HTML e no console
    reiniciarAplicacao();
    // reiniciarTabelas()
    iniciarApp();
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

// IPC para notificações
ipcMain.on('file-generated', () => {
    // Exibe uma notificação
    new Notification({
        title: 'Processo Concluído',
        body: 'O arquivo TXT foi gerado com sucesso!'
    }).show();

    // Abre ou foca a janela de configurações
    if (settingsWindow) {
        settingsWindow.focus();
    } else {
        abrirConfigurador();
    }
});

process.on('SIGINT', () => {
    if (mainWindow) {
        // Fecha a janela principal
        mainWindow.close();
    }

    // Reinicia a aplicação
    app.relaunch();
    app.quit();
});


// Função para limpar horário no banco de dados
async function limparBancoHorario() {
    const sql = 'TRUNCATE TABLE tec_hora;';
    await pool.query(sql);
}


// Função para inserir um novo horário no banco de dados
async function inserirHorarioNoBanco(configuracoes) {
    // Limpa tabela de horários antes de inserir novo horário
    await limparBancoHorario();

    // Insere o horário no banco de dados
    const [result, fields] = await pool.query(insertQuery, [configuracoes.horario]);

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
}

// Manipula a mensagem para salvar configurações recebida do front-end
ipcMain.on('salvar-configuracoes', (event, configuracoes) => {
    // Chama a função sem aguardar pela resolução da promessa
    inserirHorarioNoBanco(configuracoes).catch(error => {
        console.error('Erro ao salvar configurações:', error);
    });
});

// Manipula o evento de fechamento de todas as janelas
app.on('window-all-closed', () => {
    // Não faz nada, você pode adicionar código aqui se desejar
});

