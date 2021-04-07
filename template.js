const { Menu, nativeImage, ipcMain} = require('electron'); //things to do the templates and comunicate to main.js
const fs = require('fs'); //to write and read  images and hashs
let { language } = require('./config.json'); //lang in the config
let lang = false; //lang equals false mean the language is english
if(language != "english") try {lang = require(`./lang/${language}.json`)} catch{}; //try to load other language

module.exports = {
    appMenu(usersDisk, steampath) {
        let menu = [];
        let removeSubmenu = [];
        let languageSubmenu = [];
        //generate the content of remove submenu (before the load the menu item Accounts)
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
        //push in first menu item (Accounts)
        menu.push({
            label: `${lang && lang.menu.acconnts.title ? lang.menu.acconnts.title : "Acconnts"}`,
            submenu: [{
                label: `${lang && lang.menu.acconnts.addAccount ? lang.menu.acconnts.addAccount : "Add account"}`,
                click: () => {
                    ipcMain.emit('login', null, null);
                },
            }, {
                label: `${lang && lang.menu.acconnts.removeAccount ? lang.menu.acconnts.removeAccount : "Remove account"}`,
                submenu: removeSubmenu //apply remove submenu generated before
            }],
        })
        //load the content of language submenu (before the load the menu item)
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
        //read the files inside the dir lang, to show in the submenu
        fs.readdirSync(__dirname+"/lang").forEach(languageFile => {
            if (!languageFile.endsWith(".json")) return;
            languageFile = languageFile.replace(".json", "");
            languageSubmenu.push({
                id:`${languageFile}`,
                label:`${languageFile}`,
                type: 'radio',
                checked: language === languageFile,
                click:() => {
                    //change the template language (because the require only read once time)
                    language = languageFile;
                    lang = require(`./lang/${language}.json`) //read the new language
                    ipcMain.emit('change-language', null, languageFile); //send to the main.js that the language changed (it will update the menus)
                },
            });
          });
        //push in first menu item (Options)
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
                    submenu: languageSubmenu // apply the language submenu generated before
                }
            ]
        })
        //push the Help menu item
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

        //return the generated menu
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