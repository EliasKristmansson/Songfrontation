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

    const renderLoop = (gl, uniforms) => {
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
            const elapsed = (Date.now() - startTime.current) / 1000.0;

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            gl.uniform1f(timeUniform, elapsed);
            gl.uniform2f(resUniform, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.uniform1f(motionUniform, disableMotion ? 0.0 : 1.0);
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

        render();
    };

    const onContextCreate = async (gl) => {
        // Shader setup (same as before)
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

      vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)),
                 dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0*fract(sin(p)*43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(
          mix(dot(hash(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)), 
              dot(hash(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
          mix(dot(hash(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)), 
              dot(hash(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float motion = u_motionEnabled > 0.5 ? u_time * u_speed : 0.0;
        float n = noise(uv * u_scale + vec2(motion, 0.0));
        vec3 color = uv.x < u_dividerPos 
          ? mix(u_color1, u_color2, n) 
          : mix(u_color3, u_color4, n);
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
            -1.0, 1.0,
            1.0, 1.0,
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

        glRef.current = { gl, ...uniforms };

        renderLoop(gl, glRef.current);
    };

    // Lifecycle pause/resume
    useEffect(() => {
        const sub = AppState.addEventListener("change", (state) => {
            if (state === "active" && glRef.current) {
                renderLoop(glRef.current.gl, glRef.current);
            } else if (state.match(/inactive|background/)) {
                if (animationRef.current) cancelAnimationFrame(animationRef.current);
            }
        });
        return () => sub.remove();
    }, []);

    return (
        <View style={[styles.container, style]}>
            <GLView
                style={StyleSheet.absoluteFill}
                onContextCreate={onContextCreate}
                pointerEvents="none" // allows touches to pass through
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
