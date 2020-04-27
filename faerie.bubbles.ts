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

	private vertexArray = new Float32Array([
		-0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
		-0.5, 0.5, 0.5, -0.5, -0.5, -0.5
	]);

	private shaderProgram: WebGLProgram;
	private previousTime = 0;

	private leftPressed = false;
	private rightPressed = false;

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

	private static maxAngle = 3 * Math.PI / 8;
	private static minAngle = -3 * Math.PI / 8;

	private loaded = false;

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
		this.shaderProgram = shaderProgram(this.context);
	}

	private get aspectRatio(): number {
		return this.canvas.width / this.canvas.height;
	}

	private static mergeOptions(opts?: ContextOptions): ContextOptions {
		const ret = {...FaerieBubbles.defaultOptions};
		if (!opts) {
			return ret;
		}
		return Object.assign(ret, opts);
	}

	public load(): void {
		this.loaded = true;
		this.loadTexture("/faerie.bubbles.png");
	}

	public start(): void {
		if (!this.loaded) {
			this.load();
		}
		this.context.useProgram(this.shaderProgram);
		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.vertexBuffer);
		this.context.bufferData(this.context.ARRAY_BUFFER, this.vertexArray, this.context.STATIC_DRAW);

		this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {
			event.preventDefault();
			event.stopPropagation();
			switch (event.key) {
				case "ArrowLeft":
					this.leftPressed = true;
					break;
				case "ArrowRight":
					this.rightPressed = true;
					break;
			}
		});

		this.canvas.addEventListener("keyup", (event: KeyboardEvent) => {
			event.preventDefault();
			event.stopPropagation();
			switch (event.key) {
				case "ArrowLeft":
					this.leftPressed = false;
					break;

				case "ArrowRight":
					this.rightPressed = false;
					break;
			}
		});

		window.requestAnimationFrame((currentTime) => {this.animate(currentTime)});
	}

	private animate(time: number): void {
		const deltaT = time - this.previousTime;
		let deltaAngle = 0;
		if (this.leftPressed && !this.rightPressed) {
			deltaAngle = -Math.PI * deltaT / 2000; // (Pi/2)(deltaT in ms / 1000)
		} else if (this.rightPressed && !this.leftPressed) {
			deltaAngle = Math.PI * deltaT / 2000;
		}

		this.currentAngle += deltaAngle;

		if (this.currentAngle > FaerieBubbles.maxAngle) {
			this.currentAngle = FaerieBubbles.maxAngle;
		} else if (this.currentAngle < FaerieBubbles.minAngle) {
			this.currentAngle = FaerieBubbles.minAngle;
		}

		this.previousTime = time;

		this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.context.clearColor(0.8, 0.9, 1.0, 1.0);
		this.context.clear(this.context.COLOR_BUFFER_BIT);

		this.context.useProgram(this.shaderProgram);

		const currentRotation = [Math.sin(this.currentAngle), Math.cos(this.currentAngle)];
		const uScalingFactor = this.context.getUniformLocation(this.shaderProgram, "uScalingFactor");
		const uGlobalColor = this.context.getUniformLocation(this.shaderProgram, "uGlobalColor");
		const uRotationVector= this.context.getUniformLocation(this.shaderProgram, "uRotationVector");

		this.context.uniform2fv(uScalingFactor, [0.5, 0.5 * this.aspectRatio]);
		this.context.uniform2fv(uRotationVector, currentRotation);
		this.context.uniform4fv(uGlobalColor, [0.1, 0.7, 0.2, 1.0]);

		this.context.bindBuffer(this.context.ARRAY_BUFFER, this.vertexBuffer);

		const aVertexPosition = this.context.getAttribLocation(this.shaderProgram, "aVertexPosition");
		this.context.enableVertexAttribArray(aVertexPosition);
		this.context.vertexAttribPointer(aVertexPosition, 2, this.context.FLOAT, false, 0, 0);
		this.context.drawArrays(this.context.TRIANGLES, 0, 6);

		window.requestAnimationFrame((time) => {this.animate(time)});
	}

	private loadTexture(url: string): WebGLTexture {
		const texture = this.context.createTexture();
		if (!texture) {
			throw new Error(`Failed to initialize texture for '${url}'`);
		}
		this.context.bindTexture(this.context.TEXTURE_2D, texture);

		const level = 0;
		const internalFormat = this.context.RGBA;
		const width = 1;
		const height = 1;
		const border = 0;
		const srcFormat = this.context.RGBA;
		const srcType = this.context.UNSIGNED_BYTE;
		const pixel = new Uint8Array([0, 0, 255, 255]);

		this.context.texImage2D(
			this.context.TEXTURE_2D,
			level,
			internalFormat,
			width,
			height,
			border,
			srcFormat,
			srcType,
			pixel
		);

		const img = new Image();
		img.addEventListener("load", () => {
			this.context.bindTexture(this.context.TEXTURE_2D, texture);
			this.context.texImage2D(this.context.TEXTURE_2D, level, internalFormat, srcFormat, srcType, img);

			if ((img.width & (img.width - 1)) === 0 && (img.height & (img.height - 1)) === 0) {
				this.context.generateMipmap(this.context.TEXTURE_2D);
			} else {
				this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
				this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
				this.context.texParameteri(this.context.TEXTURE_2D, this.context.TEXTURE_MIN_FILTER, this.context.LINEAR);
			}
		});
		img.src = url;
		return texture;
	}
}
