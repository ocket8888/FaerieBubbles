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
	private canvas: HTMLCanvasElement;
	private vertexBuffer: WebGLBuffer;

	private currentAngle = 0;

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
		this.canvas = canvas;
		const buffer = ctx.createBuffer();
		if (!buffer) {
			throw new Error("Failed to create vertexBuffer");
		}
		this.vertexBuffer = buffer;
	}

	private static mergeOptions(opts?: ContextOptions): ContextOptions {
		const ret = {...FaerieBubbles.defaultOptions};
		if (!opts) {
			return ret;
		}
		return Object.assign(ret, opts);
	}

	public start(): void {
		this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.context.clearColor(0.8, 0.9, 1.0, 1.0);
		this.context.clear(this.context.COLOR_BUFFER_BIT);

		const currentRotation = [Math.sin(this.currentAngle), Math.cos(this.currentAngle)];

		const program = shaderProgram(this.context);
		this.context.useProgram(program);

		const uScalingFactor = this.context.getUniformLocation(program, "uScalingFactor");
		const uGlobalColor = this.context.getUniformLocation(program, "uGlobalColor");
		const uRotationFactor = this.context.getUniformLocation(program, "uRotationFactor");

		this.context.uniform2fv(uScalingFactor, [1.0, 1.0]);
		this.context.uniform2fv(uRotationFactor, currentRotation);
		this.context.uniform4fv(uGlobalColor, [0.1, 0.7, 0.2, 1.0]);

		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.vertexBuffer);
		// this.context.bufferData(this.vertexBuffer)

		const aVertexPosition = this.context.getAttribLocation(program, "aVertexPosition");
		this.context.enableVertexAttribArray(aVertexPosition);
		this.context.vertexAttribPointer(aVertexPosition, 2, this.context.FLOAT, false, 0, 0);
		this.context.drawArrays(this.context.TRIANGLES, 0, 6);
	}
}
