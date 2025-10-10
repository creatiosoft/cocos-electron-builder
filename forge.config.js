const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

module.exports = {
	packagerConfig: {
		asar: true,
		icon: path.resolve(__dirname, 'assets/icon.icns'),
		osxSign: {
            identity: "Apple Development: rishabh@creatiosoft.com (25YP93TLZ8)",  // 自动使用默认签名（开发用）；生产用指定您的 Apple 开发者 ID
            'hardified-runtime': true,  // 启用 hardened runtime（macOS 10.14+ 要求）
            entitlements: './entitlements.mac.plist',  // 主 App entitlements
            'entitlements-inherit': './entitlements.mac.plist',  // 子进程继承
            'signature-flags': 'library-validation'  // 签名标志
        },
        // 扩展 Info.plist（已有的描述保持）
        extendInfo: {
            'NSMicrophoneUsageDescription': 'This app needs access to the microphone for audio calls.',
            'NSCameraUsageDescription': 'This app needs access to the camera for video calls.'
        }
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-dmg',
			config: {
				icon: path.resolve(__dirname, 'assets/icon.icns'),
				deleteAppDataOnUninstall: true
			}
		}
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
};
