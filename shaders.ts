const vertexSource = `
attribute vec2 aVertexPosition;

uniform vec2 uScalingFactor;
uniform vec2 uRotationVector;

void main() {
	vec2 rotatedPosition = vec2(
		aVertexPosition.x * uRotationVector.y +
					aVertexPosition.y * uRotationVector.x,
		aVertexPosition.y * uRotationVector.y -
					aVertexPosition.x * uRotationVector.x
	);

	gl_Position = vec4(rotatedPosition * uScalingFactor, 0.0, 1.0);
}
`;

const fragmentSource = `
#ifdef GL_ES
	precision highp float;
#endif

uniform vec4 uGlobalColor;

void main() {
	gl_FragColor = uGlobalColor;
}
`;

export function shaderProgram(context: WebGL2RenderingContext | WebGLRenderingContext): WebGLProgram {
	let program = context.createProgram();
	if (!program) {
		throw new Error("Failed to create WebGL program");
	}

	let shader: WebGLShader | null = context.createShader(context.VERTEX_SHADER);
	if (!shader) {
		throw new Error("Failed to create vertex shader");
	}
	context.shaderSource(shader, vertexSource);
	context.compileShader(shader);
	if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
		throw new Error(`Failed to compile vertex shader: ${context.getShaderInfoLog(shader)}`);
	}

	context.attachShader(program, shader);

	shader = context.createShader(context.FRAGMENT_SHADER);
	if (!shader) {
		throw new Error("Failed to create fragment shader");
	}
	context.shaderSource(shader, fragmentSource);
	context.compileShader(shader);
	if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
		throw new Error(`Failed to compile fragment shader: ${context.getShaderInfoLog(shader)}`);
	}

	context.attachShader(program, shader);

	context.linkProgram(program)

	if (!context.getProgramParameter(program, context.LINK_STATUS)) {
		throw new Error(`Failed to link shader program: ${context.getProgramInfoLog(program)}`);
	}

	return program;
}
