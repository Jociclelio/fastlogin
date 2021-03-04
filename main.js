const { app, BrowserWindow, ipcMain, Tray, Notification, Menu, shell } = require('electron'); //Electron
const fl = require('./fastlogin');
const data = require('./data.js');
const tp = require('./template');
const jsonfile = require('jsonfile');
const AutoLaunch = require('auto-launch');

const config = require(`./config.json`);

require('update-electron-app')({
    repo: 'Jociclelio/fastlogin',
    updateInterval: '1 hour',
})

if (require('electron-squirrel-startup')) return app.quit();// Evita iniciar na instalação

const autoLaunch = new AutoLaunch({name: app.getName(), path: app.getPath('exe'),});
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        if (win != null) {
            if (win.isMinimized()){
                win.restore();
            }
        win.focus();
        }else{
            createWindow();
        }
    });
}


let win = null;
let sobre = null;
let tray = null;
let menu = null;

app.whenReady().then(() => {
    data.readUsers();

    tray = new Tray(__dirname + "/src/img/appicon/FastLogin.ico");
    updateMenus();

    menu.getMenuItemById('StartMinimized').checked = config.startMinimized;
    menu.getMenuItemById('StartWithWindows').checked = config.startWithWindows;
    
    tray.on('click', () => {
        if (win != null) {
            win.focus();
        } else {
            createWindow();
        }
    });

    if(!config.startMinimized){
        createWindow();
    }
});

function updateMenus(){
    tray.setContextMenu(tp.trayMenu(data.usersDisk, data.steampath));
    menu = Menu.buildFromTemplate(tp.appMenu(data.usersDisk, data.steampath))
    Menu.setApplicationMenu(menu);
}

function createWindow() {
    data.readUsers();
    updateMenus();
    let colunas = 5;
    let largura = (130 * colunas) + (8 * (colunas - 1)) + 20;
    let altura;
    if ((data.usersDisk.length / colunas) % 1 == 0) {
        altura = (188 * Math.trunc(data.usersDisk.length / colunas)) + 58;
    } else {
        altura = (188 * Math.trunc((data.usersDisk.length / colunas) + 1)) + 54;
    }
    if (win == null) {
        win = new BrowserWindow({
            transparent: true,
            width: largura,
            height: altura,
            icon: './src/img/appicon/FastLogin.ico',
            show: false,
            title: `FastLogin - v${app.getVersion()}`,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        });
        win.on('closed', () => {
            win = null;
            config.startWithWindows = menu.getMenuItemById('StartWithWindows').checked;
            config.startMinimized = menu.getMenuItemById('StartMinimized').checked;
            jsonfile.writeFile('./config.json',config,{ spaces: 2 });
            if (sobre != null) {
                sobre.close();
            }
        });
        win.on('ready-to-show', () => {
            win.send('users-disk', data.usersDisk, data.steampath);
            win.show();
        });
    }
    win.loadFile('./src/index.html');
}

function createSobre() {
    sobre = new BrowserWindow({
        frame: false,
        resizable: false,
        width: 550,
        height: 450,
        icon: 'src/img/appicon/FastLogin.ico',
        show: false,
        title: `Sobre`,
        webPreferences: {
            nodeIntegration: true
        }
    });
    sobre.on('closed', () => {
        sobre = null;
    });
    sobre.on('ready-to-show', () => {
        sobre.send('versao', app.getVersion())
        sobre.show();
    });
    sobre.loadFile('./src/sobre.html');
}
app.on('window-all-closed', () => {
    //Nada
});

ipcMain.on('login', (event, user) => {
    if (user != null) {
        data.usersDisk.map((userdisk) => {
            if (userdisk[1].AccountName == user) {
                new Notification(tp.notifica(userdisk, data.steampath)).show();
            }
        });
    } else {
        new Notification(tp.notificaNovo()).show();
    }
    fl.fastlogin(user);
    if (win != null) {
        win.close();
    }
});

ipcMain.on('users-web', () => {
    if (win != null) {
        win.send('users-web', data.usersWeb);
    }
});

ipcMain.on('delete-user', (event, user) => {
    data.deleteUser(user);
});

ipcMain.on('deleted-user', (event, user) => {
    win.send('deleted-user', user);
    updateMenus();
});

ipcMain.on('atualizado', () => {
    updateMenus();
});

ipcMain.on('recarregar-img', (userid, url) => {
    if (win != null) {
        win.send('recarregar-img', userid, url);
    }

});

ipcMain.on('abrir', () => {
    createWindow();
});
ipcMain.on('sobre', () => {
    createSobre();
});
ipcMain.on('abrir-rede', (event, data) => {
    const redes = {
        steam: "https://steamcommunity.com/id/Jociclelio/",
        insta: "https://www.instagram.com/jociclelio.cmj/",
        tt: "https://twitter.com/JLelioJ",
        git: 'https://github.com/Jociclelio'
    }
    shell.openExternal(redes[data]);
})
ipcMain.on('fechar', () => {
    if(config.StartWithWindows){
        autoLaunch.isEnabled().then((isEnabled) => {
            if (!isEnabled){
                autoLaunch.enable();
            } 
        });
    } else {
        autoLaunch.isEnabled().then((isEnabled) => {
            if (isEnabled){
                autoLaunch.disable();
            } 
        });
    }
    app.quit();
});
