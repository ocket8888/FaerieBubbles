import { shaderProgram } from "./shaders.js";

type Context = WebGLRenderingContext | WebGL2RenderingContext;

interface ContextOptions {
	alpha?: boolean;
	antialias?: boolean;
	depth?: boolean;
	desynchronized?: boolean;
	failIfMajorPerformanceCaveat?: boolean;
	powerPreference?: "default" | "high-performance" | "low-power";
	premultipliedAlpha?: boolean;
	preserveDrawingBuffer?: boolean;
	stencil?: boolean;
}

export class FaerieBubbles {
	private context: Context;

	public static defaultOptions: ContextOptions = {
		alpha: false,
		antialias: true,
		depth: true,
		desynchronized: true,
		failIfMajorPerformanceCaveat: false,
		powerPreference: "default",
		premultipliedAlpha: false,
		preserveDrawingBuffer: false,
		stencil: true
	};

	constructor(canvas: HTMLCanvasElement, contextAttributes?: ContextOptions) {
		const opts = FaerieBubbles.mergeOptions(contextAttributes);

		let ctx: Context | null = canvas.getContext("webgl2", opts);
		if (!ctx) {
			console.warn("Failed to get 'webgl2' rendering context");
			ctx = canvas.getContext("webgl", opts);
			if (!ctx) {
				console.warn("Failed to get 'webgl' rendering context");
				throw new Error("Cannot initialize Faerie Bubbles - no rendering contexts available");
			}
		}
		this.context = ctx;

		shaderProgram(this.context);
	}

	private static mergeOptions(opts?: ContextOptions): ContextOptions {
		const ret = {...FaerieBubbles.defaultOptions};
		if (!opts) {
			return ret;
		}
		return Object.assign(ret, opts);
	}
}
