const { app, BrowserWindow, ipcMain, Tray, Notification, Menu, shell } = require('electron'); //Electron
const fl = require('./fastlogin');
const data = require('./data.js');
const tp = require('./template');
const jsonfile = require('jsonfile');
const AutoLaunch = require('auto-launch');
const config = require(`./config.json`);
 
if (require('electron-squirrel-startup')) return app.quit();// Evita iniciar na instalação

app.setAboutPanelOptions({iconPath: __dirname+"/src/img/appicon/FastLogin.ico"});
const autoLaunch = new AutoLaunch({name: app.getName(), path: app.getPath('exe'),});
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
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
let about = null;
let tray = null;
let menu = null;

app.whenReady().then(() => {
    //console.log(navigator.onLine);
    data.readUsers();

    tray = new Tray(__dirname + "/src/img/appicon/FastLogin.ico");
    updateMenus();

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
    menu.getMenuItemById('startMinimized').checked = config.startMinimized;
    menu.getMenuItemById('startWithWindows').checked = config.startWithWindows;
    menu.getMenuItemById('alowNotification').checked = config.alowNotification;
}

function createWindow() {
    data.readUsers();
    updateMenus();
    let columns = config.columns;
    let width = (130 * columns) + (8 * (columns - 1)) + 20;
    let height;
    if ((data.usersDisk.length / columns) % 1 == 0) {
        height = (188 * Math.trunc(data.usersDisk.length / columns)) + 58;
    } else {
        height = (188 * Math.trunc((data.usersDisk.length / columns) + 1)) + 54;
    }
    if (win == null) {
        win = new BrowserWindow({
            transparent: true,
            width: width,
            height: height,
            icon: './src/img/appicon/FastLogin.ico',
            show: false,
            title: `FastLogin - v${app.getVersion()}`,
            webPreferences: {
                preload:__dirname + "/src/index.js",
                contextIsolation: false,
                nodeIntegration: true
            }
        });
        win.on('closed', () => {
            ipcMain.emit('save-config');
            win = null;
            if (about != null) {
                about.close();
            }
        });
        win.on('ready-to-show', () => {
            win.send('users-disk', data.usersDisk, data.steampath);
            win.show();
        });
    }
    win.loadFile('./src/index.html');
}

function createabout() {
    about = new BrowserWindow({
        frame: false,
        resizable: false,
        width: 550,
        height: 450,
        icon: 'src/img/appicon/FastLogin.ico',
        show: false,
        title: `about`,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });
    about.on('closed', () => {
        about = null;
    });
    about.on('ready-to-show', () => {
        about.send('versao', app.getVersion())
        about.show();
    });
    about.loadFile('./src/about.html');
}
app.on('window-all-closed', () => {
    //Nada
});

ipcMain.on('login', (event, user) => {
    if(config.alowNotification){
        if (user != null) {
            data.usersDisk.map((userdisk) => {
                if (userdisk[1].AccountName == user) {
                    new Notification(tp.notifica(userdisk, data.steampath)).show();
                }
            });
        } else {
            new Notification(tp.notificaNovo()).show();
        }
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

ipcMain.on('updated', () => {
    updateMenus();
});

ipcMain.on('reload-img', (userid, url) => {
    if (win != null) {
        win.send('reload-img', userid, url);
    }

});

ipcMain.on('open', () => {
    createWindow();
});
ipcMain.on('about', () => {
    createabout();
});

ipcMain.on('open-rede', (event, data) => {
    const redes = {
        steam: "https://steamcommunity.com/id/Jociclelio/",
        insta: "https://www.instagram.com/jociclelio.cmj/",
        tt: "https://twitter.com/JLelioJ",
        git: 'https://github.com/Jociclelio'
    }
    shell.openExternal(redes[data]);
});
ipcMain.on('change-language', (event, language)=>{
    //ipcMain.emit('save-config');
    config.language = language;
    if (win != null) {
        win.close();
        if(about != null) about.close();
        createWindow();
    }
});
ipcMain.on('save-config',()=>{
    config.startWithWindows = menu.getMenuItemById('startWithWindows').checked;
    config.startMinimized = menu.getMenuItemById('startMinimized').checked;
    config.alowNotification = menu.getMenuItemById('alowNotification').checked;
    jsonfile.writeFile('./config.json', config ,{ spaces: 2 });
});
ipcMain.on('log', (event,data) =>{
    console.log(data);
});

ipcMain.on('close', () => {
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
