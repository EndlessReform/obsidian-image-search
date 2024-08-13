import ObsidianImageSearchPlugin, { PLUGIN_NAME } from "main";
import { App, normalizePath } from "obsidian";
import { PGlite } from "@electric-sql/pglite";

const isValidImage = (ext: string): boolean =>
	["jpg", "jpeg", "png", "webp", "gif"].includes(ext);

const initDB = async (app: App): Promise<PGlite> => {
	const db = new PGlite();

	console.log("Creating table...");
	await db.exec(`
	CREATE TABLE IF NOT EXISTS test (
		id SERIAL PRIMARY KEY,
		name TEXT
	);
	`);
	console.log("Table created!");
	return db;
};

export class VectorServer {
	private plugin: ObsidianImageSearchPlugin;
	private db: PGlite | null;

	constructor(plugin: ObsidianImageSearchPlugin) {
		this.plugin = plugin;
		this.db = null;
	}

	async onload() {
		console.log("Loading DuckDB plugin");

		this.db = await initDB(this.plugin.app);
		console.log("DuckDB initialized successfully");
	}

	async indexFiles() {
		const files = this.plugin.app.vault.getFiles();
		const imageFiles = files.filter((f) => isValidImage(f.extension));

		console.log(imageFiles.length);
	}

	async onunload() {
		if (this.db) {
			console.log("Closing DB");
			this.db.close();
		}
	}
}
