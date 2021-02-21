const { Menu, nativeImage, ipcMain, NativeImage } = require('electron');

module.exports = {
    appMenu(usersDisk, steampath) {
        let menu = [];
        let removersubmenu = [];
        usersDisk.map((user) => {
            let ico = new nativeImage.createFromPath(steampath + "/config/avatarcache/" + user[0] + ".png").resize({ with: 16, height: 16, quality: "good" });
            removersubmenu.push({
                label: `${user[1].PersonaName}`,
                icon: ico,
                click: () => {
                    //console.log(user[1].PersonaName);
                    ipcMain.emit('delete-user', null, user);
                }
            });
        });
        menu.push({
            label: "Contas",
            submenu: [{
                label: "Adicionar conta",
                click: () => {
                    ipcMain.emit('login', null, null);
                },
            }, {
                label: "Remover conta",
                submenu: removersubmenu
            }],
        })
        menu.push({
            label: "Sobre",
            click: () => {
                ipcMain.emit('sobre');
            },
        })

        return menu;
    },
    trayMenu(usersDisk, steampath) {
        let menu = [];
        menu.push({
            label: "Adicionar conta",
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
            label: "Mostrar",
            click: () => {
                ipcMain.emit('abrir');
            }
        });
        menu.push({
            label: "Fechar",
            click: () => {
                ipcMain.emit('fechar');
            }
        });

        return Menu.buildFromTemplate(menu);
    },
    notifica(user, steampath) {
        let img = new nativeImage.createFromPath(steampath + "/config/avatarcache/" + user[0] + ".png");
        return {
            title: `${user[1].PersonaName} Está entrando...`,
            body: `Logando... ${user[1].AccountName}`,
            icon: img,
            silent: true,
        }
    },
    notificaNovo() {
        let img = new nativeImage.createFromPath('./src/img/avatardefault.png');
        return {
            title: `Adicionando nova conta`,
            body: `Faça login na steam normalmente.`,
            icon: img,
            silent: true,
        }
    },
    removeDialog(user, steampath) {
        let img = new nativeImage.createFromPath(steampath + "/config/avatarcache/" + user[0] + ".png");
        return {
            type: 'info',
            title: `Removendo Conta ${user[1].PersonaName}`,
            icon: img,
            message: `Deseja mesmo remover a conta ${user[1].PersonaName} ?`,
            buttons: ['Sim', 'Não']
        }
    }
}