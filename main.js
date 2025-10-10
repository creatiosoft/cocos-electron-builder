
const { app, BrowserWindow, screen, systemPreferences } = require('electron')
const path = require('node:path')

function createWindow() {
    let screenHeight = screen.getPrimaryDisplay().workAreaSize.height;
    let ratio = 1512 / 982;
    let initialHeight = Math.ceil(screenHeight * 0.8); // 初始高度为屏幕高度的80%
    let initialWidth = Math.ceil(initialHeight * ratio); // 根据宽高比计算宽度

    mainWindow = new BrowserWindow({
        show: true,
        title: "Creatiosoft Poker",
        fullscreen: false,
        resizable: true,
        width: initialWidth,
        height: initialHeight,
        webPreferences: {
            nodeIntegration: true,  // 如果使用 Node 模块
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,  // 允许不安全内容（测试用）
            backgroundThrottling: false,  // 防止后台音频/视频节流
            nodeIntegrationInSubFrames: true,  // 子帧权限
            webgl: true,  // 启用 WebGL（视频渲染）
            experimentalFeatures: true,  // 启用实验性 WebRTC 特性
            preload: path.join(__dirname, 'preload.js')
        }
    });
    mainWindow.setAspectRatio(ratio);
    mainWindow.setMinimumSize(Math.ceil(initialWidth * 0.5), Math.ceil(initialHeight * 0.5));
    mainWindow.loadURL('file://' + __dirname + '/game/index.html')
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.webContents.on('did-finish-load', async () => {
        try {
            const cameraGranted = await systemPreferences.askForMediaAccess('camera');
            console.log('Camera permission granted:', cameraGranted);
            const micGranted = await systemPreferences.askForMediaAccess('microphone');
            console.log('Microphone permission granted:', micGranted);

            // 如果拒绝，打开系统设置
            if (!cameraGranted) {
                require('electron').shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Camera');
            }
            if (!micGranted) {
                require('electron').shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone');
            }

            // 测试 getUserMedia
            mainWindow.webContents.executeJavaScript(`
                navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                  .then(stream => {
                    console.log('Electron permissions granted in renderer');
                    stream.getTracks().forEach(track => track.stop());
                  })
                  .catch(err => console.error('Electron permission error in renderer:', err));
            `);
        } catch (err) {
            console.error('Permission request error:', err);
        }
    });
}

app.whenReady().then(() => {
    // 请求单实例锁
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        // 如果无法获取锁（已有实例运行），退出
        app.quit();
    } else {
        // 获取锁成功，监听重复打开事件
        app.on('second-instance', () => {
            if (mainWindow) {
                // 如果窗口存在，恢复并聚焦
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
            }
        });

        // 创建窗口
        createWindow();

        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    }
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})