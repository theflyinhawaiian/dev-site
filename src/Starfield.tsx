import { useEffect, useRef } from 'react';

const STAR_COUNT = 2500;

const vertexShader = `
  attribute vec3 a_position;
  attribute float a_size;
  attribute float a_brightness;
  attribute float a_colorIndex;
  uniform float u_time;
  uniform vec2 u_resolution;
  varying float v_brightness;
  varying float v_colorIndex;

  void main() {
    float z = mod(a_position.z - u_time * 0.3, 2.0) - 1.0;
    float scale = 1.0 / (z + 1.5);
    vec2 pos = a_position.xy * scale;
    pos.x *= u_resolution.y / u_resolution.x;
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = a_size * scale * 3.0;
    v_brightness = a_brightness * smoothstep(1.0, 0.0, z);
    v_colorIndex = a_colorIndex;
  }
`;

const fragmentShader = `
  precision mediump float;
  varying float v_brightness;
  varying float v_colorIndex;

  vec3 palette(float i){
    if (i < 0.5) return vec3(0.25, 0.41, 0.88);
    if (i < 1.5) return vec3(0.69, 0.77, 0.87);
    if (i < 2.5) return vec3(0.90, 0.94, 1.0);
    if (i < 3.5) return vec3(1.0, 1.0, 1.0);
    if (i < 4.5) return vec3(1.0, 0.98, 0.80);
    if (i < 5.5) return vec3(1.0, 0.85, 0.73);
    if (i < 6.5) return vec3(1.0, 0.70, 0.50);

    return vec3(1.0, 1.0, 1.0);
  }

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.1, dist) * v_brightness;
    gl_FragColor = vec4(palette(v_colorIndex), alpha);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function generateHue(): number {
  const r = Math.floor(Math.random() * 10000000);
  if (r < 3) return 0;
  if (r < 12003) return 1;
  if (r < 73003) return 2;
  if (r < 373003) return 3;
  if (r < 1133003) return 4;
  if (r < 2333003) return 5;

  return 6;
}

interface GLContext {
  gl: WebGLRenderingContext;
  uTime: WebGLUniformLocation;
  uResolution: WebGLUniformLocation;
}

function initGL(canvas: HTMLCanvasElement): GLContext | null {
  const gl = canvas.getContext('webgl', { alpha: true });
  if (!gl) return null;

  const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  if (!vertShader || !fragShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  gl.useProgram(program);

  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const brightness = new Float32Array(STAR_COUNT);
  const colorIndex = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 2] = Math.random() * 2 - 1;
    sizes[i] = Math.random() * 2 + 0.5;
    brightness[i] = Math.random() * 0.7 + 0.3;
    colorIndex[i] = generateHue();
  }

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

  const sizeBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
  gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
  const aSize = gl.getAttribLocation(program, 'a_size');
  gl.enableVertexAttribArray(aSize);
  gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);

  const brightBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, brightBuf);
  gl.bufferData(gl.ARRAY_BUFFER, brightness, gl.STATIC_DRAW);
  const aBright = gl.getAttribLocation(program, 'a_brightness');
  gl.enableVertexAttribArray(aBright);
  gl.vertexAttribPointer(aBright, 1, gl.FLOAT, false, 0, 0);

  const colorIndexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorIndexBuf);
  gl.bufferData(gl.ARRAY_BUFFER, colorIndex, gl.STATIC_DRAW);
  const aColorIndex = gl.getAttribLocation(program, 'a_colorIndex');
  gl.enableVertexAttribArray(aColorIndex);
  gl.vertexAttribPointer(aColorIndex, 1, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uResolution = gl.getUniformLocation(program, 'u_resolution');

  if (!uTime || !uResolution) return null;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  return { gl, uTime, uResolution };
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    }

    resize();
    const ctx = initGL(canvas);
    if (!ctx) return;

    const { gl, uTime, uResolution } = ctx;
    const start = performance.now();

    function frame() {
      if (!canvas) return;
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.drawArrays(gl.POINTS, 0, STAR_COUNT);
      animId = requestAnimationFrame(frame);
    }

    frame();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
