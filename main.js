const { app, BrowserWindow, ipcMain, Tray, Notification, Menu, shell } = require('electron'); //Electron things
const jsonfile = require('jsonfile'); //to write the updated configs
const AutoLaunch = require('auto-launch'); //load the auto-launch to be able to enable the startWithWindows
const fl = require('./fastlogin'); //load the fastlogin.js to do logins
const data = require('./data'); //load the data.js to read and write accounts
const tp = require('./template'); //load the templates.js to set and updates the tray and menu
const config = require(`./config.json`); //load the configs.json with the configs
 
if (require('electron-squirrel-startup')) return app.quit();// squirrel starts the app in the instalation, this line evit this

//create the app startWithWindows(default is enabled) setting in task manager (copyed from stack overflow)
app.setAboutPanelOptions({iconPath: __dirname+"/src/img/appicon/FastLogin.ico"});
const autoLaunch = new AutoLaunch({name: app.getName(), path: app.getPath('exe'),});

//test's if the user tried to run the program twice times at the same time (copyed from stack overflow)
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

//starts the win(main window), about(window),tray, and menu (app menu) with null (let is used because this variables change a lot on the runing)
let win = null;
let about = null;
let tray = null;
let menu = null;

app.whenReady().then(() => {
    // starts reading the disk users (save load to the data.usersDisk atribute)
    data.readUsers();
    
    // set the tray icon
    tray = new Tray(__dirname + "/src/img/appicon/FastLogin.ico");
        
    // load the menus (tray and app menu)
    updateMenus();
    
    // set the click action of the tray icon
    tray.on('click', () => {
        if (win != null) {
            win.focus();
        } else {
            createWindow();
        }
    });

    // open the window if the config startMinimized is disabled
    if(!config.startMinimized){
        createWindow();
    }
});

function updateMenus(){

    //set the tray by the template ("tp" is template)
    tray.setContextMenu(tp.trayMenu(data.usersDisk, data.steampath));

    //generate the menu using the template ("tp" is template) :) 
    menu = Menu.buildFromTemplate(tp.appMenu(data.usersDisk, data.steampath));

    //set the application menu
    Menu.setApplicationMenu(menu);

    //load the current settings of alowNotification, startWithWindows, startMinimized... from the config
    menu.getMenuItemById('startMinimized').checked = config.startMinimized;
    menu.getMenuItemById('startWithWindows').checked = config.startWithWindows;
    menu.getMenuItemById('alowNotification').checked = config.alowNotification;  
}

function createWindow() { // open the main window :)
    data.readUsers(); 
        // starts reading the disk users (save load to the data.usersDisk atribute)
    updateMenus(); 
        // update the menus (or set)
    let columns = config.columns; 
        //calculing the with and height by the number of users in disk
    let width = (130 * columns) + (8 * (columns - 1)) + 20; 
        //calcule the with by the columns atribute in config.json
    let height;
    if ((data.usersDisk.length / columns) % 1 == 0) {
            // calcule the height by the number of users (test if the users divide by columns is "integer")
        height = (188 * Math.trunc(data.usersDisk.length / columns)) + 58; 
            //if is, the height is a multiple of columns
    } else {
        height = (188 * Math.trunc((data.usersDisk.length / columns) + 1)) + 54; 
            //if isn`s, the height isn`t a multiple of columns, and not "finished the line", so have to add +1 to have space to the last line
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
        win.on('closed', () => { // on close, set the about null and "call" the save-config func to enable open again (if don`t do this, will appear a error message when try open the window by the second time)
            ipcMain.emit('save-config');
            win = null;
            if (about != null) {
                about.close();
            }
        });
        win.on('ready-to-show', () => { // this is to send the last information before show the window show (i think that exists a best way to do it)
            win.send('users-disk', data.usersDisk, data.steampath);
            win.show();
        });
    }
    win.loadFile('./src/index.html');
}

function createabout() { // open the about window :)
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
    about.on('closed', () => { // on close, set the about null, to enable open again (if don`t do this, will appear a error message when try open the window by the second time)
        about = null;
    });
    about.on('ready-to-show', () => { // this is to send the last information before show the window show (i think that exists a best way to do it)
        about.send('versao', app.getVersion())
        about.show();
    });
    about.loadFile('./src/about.html');
}
app.on('window-all-closed', () => {
    //nothing, i left this here because i think this possibly the absence caused an error (i'm probably wrong)
});

//login the user
ipcMain.on('login', (event, user) => {
    //test if the user wants nofitication (is a silent notification)
    if(config.alowNotification){
        //try to find the user, and load the notification(using template)
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
    //calls the funcion to really login the user 
    fl.fastlogin(user);

    //close the window if is open
    if (win != null) {
        win.close();
    }
});

// send the users( account names, images, personastate) getted by the webSteamApi https://developer.valvesoftware.com/wiki/Steam_Web_API
ipcMain.on('users-web', () => { 
    if (win != null) {
        win.send('users-web', data.usersWeb);
    }
});

// say to the data to delete the user(steam account) from the disk, when completed, send the 'deleted-user' event
ipcMain.on('delete-user', (event, user) => { 
    data.deleteUser(user);
});

// say to the main window that its have to remove the user from the screen and update the menus to apply the changes
ipcMain.on('deleted-user', (event, user) => { 
    win.send('deleted-user', user);
    updateMenus();
});

//calls the update menus (the window can`t call it directly)
ipcMain.on('updated', () => { 
    updateMenus();
});

// say to the screen to reload the image (change the src atribute on img tag) 
ipcMain.on('reload-img', (userid, url) => { 
    if (win != null) {
        win.send('reload-img', userid, url);
    }

});

//open the main window
ipcMain.on('open', () => { 
    createWindow();
});

//open the about window
ipcMain.on('about', () => { 
    createabout();
});

//open the social media
ipcMain.on('open-rede', (event, data) => { 
    const redes = {
        steam: "https://steamcommunity.com/id/Jociclelio/",
        insta: "https://www.instagram.com/jociclelio.cmj/",
        tt: "https://twitter.com/JLelioJ",
        git: 'https://github.com/Jociclelio'
    }
    shell.openExternal(redes[data]);
});

//Change the language in the primary memory then reload the window
ipcMain.on('change-language', (event, language)=>{ 
    //ipcMain.emit('save-config');
    config.language = language;
    if (win != null) {
        win.close();
        if(about != null) about.close();
        createWindow();
    }
});

//save checkboxs configs to the disk
ipcMain.on('save-config',()=>{ 
    config.startWithWindows = menu.getMenuItemById('startWithWindows').checked;
    config.startMinimized = menu.getMenuItemById('startMinimized').checked;
    config.alowNotification = menu.getMenuItemById('alowNotification').checked;
    jsonfile.writeFile('./config.json', config ,{ spaces: 2 });
});
ipcMain.on('log', (event,data) =>{
    console.log(data);
});

//when the app close, set the autoLaunch setting
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
