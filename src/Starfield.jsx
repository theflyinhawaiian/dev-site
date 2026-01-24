import { useEffect, useRef } from 'react';

const STAR_COUNT = 1500;

const vertexShader = `
  attribute vec3 a_position;
  attribute float a_size;
  attribute float a_brightness;
  uniform float u_time;
  uniform vec2 u_resolution;
  varying float v_brightness;

  void main() {
    float z = mod(a_position.z - u_time * 0.3, 2.0) - 1.0;
    float scale = 1.0 / (z + 1.5);
    vec2 pos = a_position.xy * scale;
    pos.x *= u_resolution.y / u_resolution.x;
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = a_size * scale * 3.0;
    v_brightness = a_brightness * smoothstep(1.0, 0.0, z);
  }
`;

const fragmentShader = `
  precision mediump float;
  varying float v_brightness;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.1, dist) * v_brightness;
    gl_FragColor = vec4(0.9, 0.92, 1.0, alpha);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initGL(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true });
  if (!gl) return null;

  const vs = createShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

  gl.useProgram(program);

  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const brightness = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 2] = Math.random() * 2 - 1;
    sizes[i] = Math.random() * 2 + 0.5;
    brightness[i] = Math.random() * 0.7 + 0.3;
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

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uResolution = gl.getUniformLocation(program, 'u_resolution');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  return { gl, uTime, uResolution };
}

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    let animId;

    function resize() {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
    }

    resize();
    const ctx = initGL(canvas);
    if (!ctx) return;

    const { gl, uTime, uResolution } = ctx;
    const start = performance.now();

    function frame() {
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
