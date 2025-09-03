
const { app, BrowserWindow, screen } = require('electron')
const path = require('node:path')

function createWindow() {
	
    mainWindow = new BrowserWindow({
        show: true,
        title: "Game",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.loadURL('file://' + __dirname + '/game/index.html')
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
	createWindow()
	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})