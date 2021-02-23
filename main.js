const { app, BrowserWindow, ipcMain, Tray, Notification, Menu, shell } = require('electron'); //Electron
const AutoLaunch = require('auto-launch');
const fl = require('./fastlogin');
const data = require('./data.js');
const tp = require('./template');
if (require('electron-squirrel-startup')) return app.quit();
let autoLaunch = new AutoLaunch({
    name: 'FastLogin',
    path: app.getPath('exe'),
});
autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
});

let win = null;
let sobre = null;
let tray = null;

app.whenReady().then(() => {
    data.getUsers();
    createWindow();
    tray = new Tray(__dirname + "/src/img/appicon/FastLogin.ico");
    tray.setContextMenu(tp.trayMenu(data.usersDisk, data.steampath));
    tray.on('click', () => {
        if (win != null) {
            win.focus();
        } else {
            createWindow();
        }
    });
});

function createWindow() {
    data.getUsers();
    Menu.setApplicationMenu(Menu.buildFromTemplate(tp.appMenu(data.usersDisk, data.steampath)));
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

})


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
})
ipcMain.on('delete-user', (event, user) => {
    data.deleteUser(user)
});
ipcMain.on('deleted-user', (event, user) => {
    win.send('deleted-user', user);
    Menu.setApplicationMenu(Menu.buildFromTemplate(tp.appMenu(data.usersDisk, data.steampath)));
    tray.setContextMenu(tp.trayMenu(data.usersDisk, data.steampath));
})
ipcMain.on('atualizado', () => {
    Menu.setApplicationMenu(Menu.buildFromTemplate(tp.appMenu(data.usersDisk, data.steampath)));
    tray.setContextMenu(tp.trayMenu(data.usersDisk, data.steampath));
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
    app.quit();
});