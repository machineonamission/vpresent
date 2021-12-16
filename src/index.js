const {app, BrowserWindow, ipcMain} = require('electron');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        webPreferences: {
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'filepicker.html'));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const path = require('path')
const fs = require("fs")

function fileExistsProm(path) {
    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.F_OK, err => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        })
    })
}

// handle events called from renderer

// validate all videos exist
ipcMain.handle('check', async (event, args) => {
    return await check(args);
});

function check(pathtocheck) {
    // any errors thrown should HOPEFULLY just cause it to reject
    return new Promise(((resolve, reject) => {
        // read file passed by user
        fs.promises.readFile(pathtocheck).then(filedata => {
            // parse json
            filedata = JSON.parse(filedata.toString());
            // check if all the files exist at once, reject if any of them dont
            Promise.all(filedata.map((val, i) => {
                // errors dont autoreject within async callbacks
                try {
                    return fileExistsProm(path.join(path.dirname(pathtocheck), val["video"]))
                } catch (err) {
                    reject(err)
                }
            })).then(r => resolve(true)).catch(reject)
        })
    }))
}

// read json for renderer
ipcMain.handle('readjson', async (event, args) => {
    return await readjson(args);
});

function readjson(jpath) {
    return new Promise(((resolve, reject) => {
        // read file passed by user
        fs.promises.readFile(jpath).then(filedata => {
            // parse json
            let jobj = JSON.parse(filedata.toString());
            // make all video paths absolute probably
            const vroot = path.dirname(jpath);
            jobj.forEach((v, i) => {
                jobj[i].video = path.join(vroot, v.video);
            })
            resolve(jobj);
        }).catch(reject)
    }))
}