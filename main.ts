import { FaerieBubbles } from "./faerie.bubbles.js";

function init(): void {
	let fb: FaerieBubbles;
	try {
		fb = new FaerieBubbles(document.getElementById("demo") as HTMLCanvasElement);
	} catch (e) {
		console.error(e);
		return;
	}
	console.log("Faerie Bubbles loaded:", fb);
	fb.start();
}
window.addEventListener("load", init);
