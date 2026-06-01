import { BrowserProfile, BrowserSession } from "browser-use/browser";
import { chromium, firefox, webkit } from "playwright";
import type { BrowserPage } from "twitter-api-safe-request";

type LaunchBrowserSettings = {
	browserType: "chromium" | "firefox" | "webkit";
	userDataDir: string;
	headless: boolean | undefined;
	executablePath: string | undefined;
	env: NodeJS.ProcessEnv | undefined;
	proxy: { server: string; username?: string; password?: string } | undefined;
	args: string[] | undefined;
	viewport: { width: number; height: number } | undefined;
};

type CdpBrowserSettings = {
	browserType: "chromium" | "firefox" | "webkit";
	cdpEndpoint: string;
};

export type BrowserUseSettings = {
	headless?: boolean | undefined;
	userDataDir?: string | undefined;
	viewport?: { width: number; height: number } | undefined;
};

export type BrowserHandle = {
	newPage: () => Promise<BrowserPage>;
	close: () => Promise<unknown>;
};

export const launchBrowser = async (settings: LaunchBrowserSettings) => {
	const browser = { chromium, firefox, webkit }[settings.browserType];
	const context = await browser.launchPersistentContext(settings.userDataDir, {
		headless: settings.headless,
		executablePath: settings.executablePath,
		env: settings.env,
		proxy: settings.proxy,
		args: ["--disable-blink-features=AutomationControlled", ...(settings.args || [])],
		viewport: settings.viewport,
	});
	return context;
};

export const connectBrowser = async (settings: CdpBrowserSettings) => {
	const browser = { chromium, firefox, webkit }[settings.browserType];
	const cdpBrowser = await browser.connectOverCDP(settings.cdpEndpoint);
	const context = cdpBrowser.contexts()[0] ?? (await cdpBrowser.newContext());
	return context;
};

export const launchBrowserUse = async (settings: BrowserUseSettings): Promise<BrowserHandle> => {
	const profile = new BrowserProfile({
		headless: settings.headless ?? false,
		user_data_dir: settings.userDataDir ?? null,
		viewport: settings.viewport ?? null,
		window_size: settings.viewport ?? null,
	});
	const session = new BrowserSession({ browser_profile: profile });
	await session.start();

	return {
		newPage: async () => {
			const page = await session.get_current_page();
			if (!page) {
				throw new Error("Browser use did not provide a current page");
			}
			return page;
		},
		close: async () => await session.close(),
	};
};
