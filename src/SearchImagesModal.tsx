import { App, Modal } from "obsidian";
import { StrictMode } from "react";
import { Root, createRoot } from "react-dom/client";
import { SearchImagesModalContent } from "./components/SearchImagesModalContent";

export class SearchImagesModal extends Modal {
	root: Root | null = null;
	constructor(app: App) {
		super(app);
	}

	async onOpen() {
		const { contentEl } = this;
		this.root = createRoot(contentEl);
		this.root.render(
			<StrictMode>
				<SearchImagesModalContent />
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
