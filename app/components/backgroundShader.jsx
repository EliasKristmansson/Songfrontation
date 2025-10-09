import { Asset } from "expo-asset";
import { GLView } from "expo-gl";
import { useEffect, useRef } from "react";
import { AppState, Platform, StyleSheet, View } from "react-native";

export default function ShaderBackground({
  children,
  style,
  disableMotion = false,
  speed = 0.2,
  scale = 3.0,
  color1 = [1.2, 0.3, 0.8],
  color2 = [1.0, 0.5, 0.2],
  color3 = [0.8, 0.2, 0.3],
  color4 = [0.2, 0.8, 0.5],
  dividerPos = 1.0,
}) {
  const startTime = useRef(Date.now());
  const glRef = useRef(null);
  const animationRef = useRef(null);
  const latestProps = useRef({ speed, scale, color1, color2, color3, color4, dividerPos });
  const lastFrameTime = useRef(null);
  const shaderTime = useRef(0);
  // Update ref when props change
  useEffect(() => {
    latestProps.current = { speed, scale, color1, color2, color3, color4, dividerPos };
  }, [speed, scale, color1, color2, color3, color4, dividerPos]);

  const createTexture = (gl, asset) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, asset);
        return texture;
    };

  const startRenderLoop = (gl, uniforms) => {
  // stop any previous loop to avoid double-running
  if (animationRef.current) cancelAnimationFrame(animationRef.current);

  const {
    timeUniform,
    resUniform,
    motionUniform,
    speedUniform,
    scaleUniform,
    color1Uniform,
    color2Uniform,
    color3Uniform,
    color4Uniform,
    dividerUniform,
  } = uniforms;

  const render = () => {
    if (!startTime.current) startTime.current = Date.now();
    if (!lastFrameTime.current) lastFrameTime.current = Date.now();

    const now = Date.now();
    const delta = (now - lastFrameTime.current) / 1000.0; // seconds since last frame
    lastFrameTime.current = now;

    // Smooth delta to avoid huge jumps when JS hiccups
    const smoothedDelta = Math.min(delta, 1 / 30); // cap at ~30 FPS worth of time step

    // Accumulate "shader time" separately
    shaderTime.current += smoothedDelta;
    const elapsed = shaderTime.current;

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.uniform1f(timeUniform, elapsed);
    gl.uniform2f(resUniform, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform1f(motionUniform, disableMotion ? 0.0 : 1.0);

    const {
      speed,
      scale,
      color1,
      color2,
      color3,
      color4,
      dividerPos,
    } = latestProps.current;

    gl.uniform1f(speedUniform, speed);
    gl.uniform1f(scaleUniform, scale);
    gl.uniform1f(dividerUniform, dividerPos);
    gl.uniform3f(color1Uniform, color1[0], color1[1], color1[2]);
    gl.uniform3f(color2Uniform, color2[0], color2[1], color2[2]);
    gl.uniform3f(color3Uniform, color3[0], color3[1], color3[2]);
    gl.uniform3f(color4Uniform, color4[0], color4[1], color4[2]);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.flush();
    gl.endFrameEXP();

    animationRef.current = requestAnimationFrame(render);
  };

  // kick off first frame
  animationRef.current = requestAnimationFrame(render);
};

  const onContextCreate = async (gl) => {
    const grainAsset = Asset.fromModule(require("../../assets/images/grain.png"));
    await grainAsset.downloadAsync();

    const perlinAsset = Asset.fromModule(require("../../assets/images/perlin.png"));
    await perlinAsset.downloadAsync();

    const perlinTex = createTexture(gl, perlinAsset);
    const grainTex = createTexture(gl, grainAsset);

    const vertShaderSource = `
      attribute vec4 position;
      void main() { gl_Position = position; }
    `;

    const fragShaderSource = `
      precision mediump float;

      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_motionEnabled;
      uniform float u_speed;
      uniform float u_scale;
      uniform float u_dividerPos;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform vec3 u_color4;

      uniform sampler2D u_perlinTex;
      uniform sampler2D u_grainTex;

      void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  // sine wave pulse
  float pulse = sin(u_time * u_speed * -2.0 + uv.y * 2.0) * 0.3 + 0.2;

  vec2 perlinUV = uv * u_scale + vec2(0.0, (u_time * u_speed * 0.05));

  // sample perlin and grain
  vec4 perlinSample = texture2D(u_perlinTex, perlinUV);
  vec4 grainSample = texture2D(u_grainTex, uv * 4.0);

  float factor = perlinSample.r * pulse;

  vec3 firstHalf = mix(u_color1, u_color2, factor);
  vec3 secondHalf = mix(u_color3, u_color4, factor);

  // Reveal animation via divider position
  float secondHalfMask = step(u_dividerPos, uv.x);
  vec3 baseColor = mix(firstHalf, secondHalf, secondHalfMask);

  // Add divider line
  float dividerDist = abs(uv.x - u_dividerPos);
  float dividerLine = smoothstep(0.0, 0.003, 0.003 - dividerDist);
  vec3 dividerColor = vec3(1.0); // you could pass this as a uniform too
  baseColor = mix(baseColor, dividerColor, dividerLine);

  // Add grain
  vec3 color = mix(baseColor, grainSample.rgb, 0.15);

  gl_FragColor = vec4(color, 1.0);
}
    `;

    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertShaderSource);
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragShaderSource);
    gl.compileShader(fragShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionAttrib = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionAttrib);
    gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      timeUniform: gl.getUniformLocation(program, "u_time"),
      resUniform: gl.getUniformLocation(program, "u_resolution"),
      motionUniform: gl.getUniformLocation(program, "u_motionEnabled"),
      speedUniform: gl.getUniformLocation(program, "u_speed"),
      scaleUniform: gl.getUniformLocation(program, "u_scale"),
      color1Uniform: gl.getUniformLocation(program, "u_color1"),
      color2Uniform: gl.getUniformLocation(program, "u_color2"),
      color3Uniform: gl.getUniformLocation(program, "u_color3"),
      color4Uniform: gl.getUniformLocation(program, "u_color4"),
      dividerUniform: gl.getUniformLocation(program, "u_dividerPos"),
    };

    const perlinUniform = gl.getUniformLocation(program, "u_perlinTex");
    const grainUniform = gl.getUniformLocation(program, "u_grainTex");

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, perlinTex);
    gl.uniform1i(perlinUniform, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, grainTex);
    gl.uniform1i(grainUniform, 1);

    glRef.current = { gl, ...uniforms };

    startRenderLoop(gl, glRef.current);

  };

  useEffect(() => {
  const handleAppStateChange = (nextState) => {
    if (nextState === "active" && glRef.current) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      // restart from fresh RAF cycle
      startRenderLoop(glRef.current.gl, glRef.current);
    } else if (nextState.match(/inactive|background/)) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const sub = AppState.addEventListener("change", handleAppStateChange);
  return () => {
    sub.remove();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };
}, []);

  return (
    <View style={[styles.container, style]}>
      <GLView
        style={StyleSheet.absoluteFill}
        onContextCreate={onContextCreate}
        pointerEvents="none"
        backgroundColor={Platform.OS === 'android' ? 'black' : 'transparent'}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});
