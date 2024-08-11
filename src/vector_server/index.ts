import ObsidianImageSearchPlugin from "main";
import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm";
// @ts-ignore
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm";
// @ts-ignore
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js";

const isValidImage = (ext: string): boolean =>
	["jpg", "jpeg", "png", "webp", "gif"].includes(ext);

async function initDuckDB() {
	const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
		mvp: {
			mainModule: duckdb_wasm,
			mainWorker: mvp_worker,
		},
		eh: {
			mainModule: duckdb_wasm_eh,
			mainWorker: eh_worker,
		},
	};

	const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
	const logger = new duckdb.ConsoleLogger();

	// Instantiate DuckDB-wasm async
	const worker = new Worker(bundle.mainWorker ?? "ERROR");
	const db = new duckdb.AsyncDuckDB(logger, worker);
	await db.instantiate(bundle.mainModule);

	return db;
}

export class VectorServer {
	private plugin: ObsidianImageSearchPlugin;
	private db: duckdb.AsyncDuckDB | null;

	constructor(plugin: ObsidianImageSearchPlugin) {
		this.plugin = plugin;
		this.db = null;
	}

	async onload() {
		console.log("Loading DuckDB plugin");

		try {
			this.db = await initDuckDB();
			console.log("DuckDB initialized successfully");
			// Set up your plugin's features here
		} catch (error) {
			console.error("Failed to initialize DuckDB:", error);
		}
	}

	async indexFiles() {
		const files = this.plugin.app.vault.getFiles();
		const imageFiles = files.filter((f) => isValidImage(f.extension));

		console.log(imageFiles.length);
	}

	async onunload() {
		if (this.db) {
			this.db.terminate();
		}
	}
}
