const { app, Tray, Menu, BrowserWindow } = require('electron');
const path = require('path');
const { execConect } = require('./conexao');

let tray = null;

app.whenReady().then(() => {
    tray = new Tray(path.join(__dirname, './img/icon.ico'));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Executar', type: 'normal', click: executarApi },
        { label: 'Sair', type: 'normal', click: () => app.quit() } 
    ]);

    tray.setToolTip('Script');
    tray.setContextMenu(contextMenu);

    //Evento de clique
    tray.on('click', () => {
        execConect(); //Chama a função de execução das 3 API's
    });

    //Adiciona eveto de clique no item "Executar" no menu de bandeja
    contextMenu.items.find(item => item.label === 'Executar').click = executarApi
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function executarApi() {
    console.log('Executando API');
}