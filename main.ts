import { FaerieBubbles } from "./faerie.bubbles";

function init(): void {
	let fb: FaerieBubbles;
	try {
		fb = new FaerieBubbles(document.getElementById("demo") as HTMLCanvasElement);
	} catch (e) {
		console.error(e);
		return;
	}
	console.log("Faerie Bubbles loaded:", fb);
}
window.addEventListener("load", init);
