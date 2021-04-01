const { Menu, nativeImage, ipcMain} = require('electron');
const fs = require('fs');
let { language } = require('./config.json');
let lang = false;
if(language != "english") try {lang = require(`./lang/${language}.json`)} catch{};

module.exports = {
    appMenu(usersDisk, steampath) {
        let menu = [];
        let removeSubmenu = [];
        let languageSubmenu = [];

        usersDisk.map((user) => {
            let ico = new nativeImage.createFromPath(steampath + "/config/avatarcache/" + user[0] + ".png").resize({ with: 16, height: 16, quality: "good" });
            removeSubmenu.push({
                label: `${user[1].PersonaName}`,
                icon: ico,
                click: () => {
                    ipcMain.emit('delete-user', null, user);
                }
            });
        });
        menu.push({
            label: `${lang && lang.menu.acconnts.title ? lang.menu.acconnts.title : "Acconnts"}`,
            submenu: [{
                label: `${lang && lang.menu.acconnts.addAccount ? lang.menu.acconnts.addAccount : "Add account"}`,
                click: () => {
                    ipcMain.emit('login', null, null);
                },
            }, {
                label: `${lang && lang.menu.acconnts.removeAccount ? lang.menu.acconnts.removeAccount : "Remove account"}`,
                submenu: removeSubmenu
            }],
        })
        
        languageSubmenu.push({
            id:"english",
            label:"english",
            type: 'radio',
            checked: false,
            click:() => {
                language = 'english';
                lang = false;
                ipcMain.emit('change-language', null, "english");
            },
        });
        fs.readdirSync(__dirname+"/lang").forEach(languageFile => {
            if (!languageFile.endsWith(".json")) return;
            languageFile = languageFile.replace(".json", "");
            languageSubmenu.push({
                id:`${languageFile}`,
                label:`${languageFile}`,
                type: 'radio',
                checked: language === languageFile,
                click:() => {
                    language = languageFile;
                    lang = require(`./lang/${language}.json`)
                    ipcMain.emit('change-language', null, languageFile);
                },
            });
          });

        menu.push({
            label: `${lang && lang.menu.options.title ? lang.menu.options.title : "Options"}`,
            submenu: [
                {
                    id:'startWithWindows',
                    label:`${lang && lang.menu.options.startWithWindows  ? lang.menu.options.startWithWindows : "Start with windows"}`,
                    type: 'checkbox',
                    checked: true,
                    click:() => {
                        ipcMain.emit('save-config', null, this);
                    },
                },
                {
                    id:'startMinimized',
                    label:`${lang && lang.menu.options.startMinimized ? lang.menu.options.startMinimized : "Start minimized"}`,
                    type: 'checkbox',
                    checked: true,
                    click:() => {
                        ipcMain.emit('save-config', null, this);
                    },
                },
                {
                    id:'alowNotification',
                    label:`${lang && lang.menu.options.alowNotification ? lang.menu.options.alowNotification : "Alow notifications"}`,
                    type: 'checkbox',
                    checked: true,
                    click:() => {
                        ipcMain.emit('save-config', null, this);
                    },
                },
                {
                    label:`${lang && lang.menu.options.language ? lang.menu.options.language : "Language"}`,
                    submenu: languageSubmenu
                }
            ]
        })
        menu.push({
            label: `${lang && lang.menu.options.title ? lang.menu.help.title : "Help"}`,
            submenu:[
                {
                    label: `${lang && lang.menu.help.about ? lang.menu.help.about : "About"}`,
                    click: () => {
                        ipcMain.emit('about');
                    },
                }
            ]
        })

        return menu;
    },
    trayMenu(usersDisk, steampath) {
        let menu = [];
        menu.push({
            label: `${lang && lang.tray.addAccount ? lang.tray.addAccount : "Add account"}`,
            click: () => {
                ipcMain.emit('login', null, null);
            }
        });
        menu.push({
            type: "separator",
        });
        usersDisk.map((user) => {
            let ico = new nativeImage.createFromPath(steampath + "/config/avatarcache/" + user[0] + ".png").resize({ with: 16, height: 16, quality: "good" });
            menu.push({
                label: `${user[1].PersonaName}`,
                icon: ico,
                click: () => {
                    ipcMain.emit('login', null, user[1].AccountName);
                }
            });
        });
        menu.push({
            type: "separator",
        });
        menu.push({
            label: `${lang && lang.tray.show ? lang.tray.show : "Show"}`,
            click: () => {
                ipcMain.emit('open');
            }
        });
        menu.push({
            label: `${lang && lang.tray.exit ? lang.tray.exit : "Exit"}`,
            click: () => {
                ipcMain.emit('close');
            }
        });

        return Menu.buildFromTemplate(menu);
    },
    notifica(user, steampath) {
        let img = new nativeImage.createFromPath(steampath + "/config/avatarcache/" + user[0] + ".png");
        return {
            title: `${user[1].PersonaName} ${lang && lang.notfication.login.title ? lang.notfication.login.title : "Is joining..."}`,
            body: `${lang ? lang.notfication.login.body : "Logining..."}`,
            icon: img,
            silent: true,
        }
    },
    notificaNovo() {
        let img = new nativeImage.createFromPath(__dirname + '/src/img/avatardefault.png');
        return {
            title: `${lang && lang.notfication.login.title ? lang.notfication.login.title : "Adding new account"}`,
            body: `${lang && lang.notfication.login.body  ? lang.notfication.login.body : "Login to steam normally."}`,
            icon: img,
            silent: true,
        }
    },
    removeDialog(user, steampath) {
        let img = new nativeImage.createFromPath(steampath + "/config/avatarcache/" + user[0] + ".png");
        return {
            type: 'info',
            title: `${lang && lang.dialog.title ? lang.dialog.title : "Removing account"} ${user[1].PersonaName}`,
            icon: img,
            noLink: true,
            cancelId: 1,
            message: `${lang && lang.dialog.message ? lang.dialog.message : "Do you really want to remove the account"} ${user[1].PersonaName} ?`,
            buttons: (lang && lang.dialog.buttons ? lang.dialog.buttons : ["Yes","No"])
        }
    }
}