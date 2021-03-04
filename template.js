const { Menu, nativeImage, ipcMain} = require('electron');
const { language } = require('./config.json');
let lang = false;
if(language != "english") try {lang = require(`./lang/${language}.json`)} catch{};


//console.log(lang.menuTexts.acconnts.title);
module.exports = {
    appMenu(usersDisk, steampath) {
        let menu = [];
        let removeSubmenu = [];

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
        //console.log(lang.menuTexts.acconnts.title)
        menu.push({
            label: `${lang ? lang.menu.acconnts.title : "Acconnts"}`,
            submenu: [{
                label: `${lang ? lang.menu.acconnts.addAccount : "Add account"}`,
                click: () => {
                    ipcMain.emit('login', null, null);
                },
            }, {
                label: `${lang ? lang.menu.acconnts.removeAccount : "Remove account"}`,
                submenu: removeSubmenu
            }],
        })
        menu.push({
            label: `${lang ? lang.menu.options.title : "Options"}`,
            submenu: [
                {
                    id:'StartWithWindows',
                    label:`${lang ? lang.menu.options.startWithWindows : "Start with windows"}`,
                    type: 'checkbox',
                    checked: true,
                    click:() => {
                        ipcMain.emit('SaveConfig', null, this);
                    },
                },
                {
                    id:'StartMinimized',
                    label:`${lang ? lang.menu.options.startMinimized : "Start minimized"}`,
                    type: 'checkbox',
                    checked: true,
                    click:() => {
                        ipcMain.emit('SaveConfig', null, this);
                    },
                }
            ]
        })
        menu.push({
            label: `${lang ? lang.menu.help.title : "Help"}`,
            submenu:[
                {
                    label: `${lang ? lang.menu.help.about : "About"}`,
                    click: () => {
                        ipcMain.emit('sobre');
                    },
                }
            ]
        })

        return menu;
    },
    trayMenu(usersDisk, steampath) {
        let menu = [];
        menu.push({
            label: `${lang ? lang.tray.addAccount : "Add account"}`,
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
                    //console.log(user[1].PersonaName);
                    ipcMain.emit('login', null, user[1].AccountName);
                }
            });
        });
        menu.push({
            type: "separator",
        });
        menu.push({
            label: `${lang ? lang.tray.show : "Show"}`,
            click: () => {
                ipcMain.emit('abrir');
            }
        });
        menu.push({
            label: `${lang ? lang.tray.exit : "Exit"}`,
            click: () => {
                ipcMain.emit('fechar');
            }
        });

        return Menu.buildFromTemplate(menu);
    },
    notifica(user, steampath) {
        let img = new nativeImage.createFromPath(steampath + "/config/avatarcache/" + user[0] + ".png");
        return {
            title: `${user[1].PersonaName} ${lang ? lang.notfication.login.title : "Is joining..."}`,
            body: `${lang ? lang.tray.body : "Logining..."}`,
            icon: img,
            silent: true,
        }
    },
    notificaNovo() {
        let img = new nativeImage.createFromPath(__dirname + '/src/img/avatardefault.png');
        return {
            title: `${lang ? lang.notfication.login.title : "Adding new account"}`,
            body: `${lang ? lang.notfication.login.body : "Login to steam normally."}`,
            icon: img,
            silent: true,
        }
    },
    removeDialog(user, steampath) {
        let img = new nativeImage.createFromPath(steampath + "/config/avatarcache/" + user[0] + ".png");
        return {
            type: 'info',
            title: `${lang ? lang.dialog.title : "Removing account"} ${user[1].PersonaName}`,
            icon: img,
            noLink: true,
            cancelId: 1,
            message: `${lang ? lang.dialog.message : "Do you really want to remove the account"} ${user[1].PersonaName} ?`,
            buttons: (lang ? lang.dialog.buttons : ["Yes","No"])
        }
    }
}