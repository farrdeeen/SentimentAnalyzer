import { Renderer, Program, Mesh, Color, Triangle } from "ogl";
import { useEffect, useRef, useState } from "react";

import "./Iridescence.css";

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

interface IridescenceProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReact?: boolean;
}

export default function Iridescence({
  color = [1, 1, 1],
  speed = 1.0,
  amplitude = 0.1,
  mouseReact = true,
  ...rest
}: IridescenceProps) {
  const ctnDom = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Smooth transition state for 2.5 second color changes
  const currentColorRef = useRef([1, 1, 1]); // Current interpolated color
  const targetColorRef = useRef([1, 1, 1]);  // Target color to transition to
  const transitionSpeedRef = useRef(0.05);   // Very slow transition speed (~2.5 seconds)

  // Initialize WebGL context once and only once
  useEffect(() => {
    if (!ctnDom.current || isInitialized) return;
    
    console.log('Initializing WebGL context with smooth transitions');
    const ctn = ctnDom.current;
    const renderer = new Renderer();
    const gl = renderer.gl;
    
    rendererRef.current = renderer;
    gl.clearColor(0, 0, 0, 0); // Transparent background

    // Handle window resize
    function resize() {
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      if (programRef.current) {
        programRef.current.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
      }
    }
    
    window.addEventListener("resize", resize);
    resize();

    // Create WebGL geometry and shader program
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(...color) },
        uResolution: {
          value: new Color(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ),
        },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uAmplitude: { value: amplitude },
        uSpeed: { value: speed },
      },
    });

    programRef.current = program;
    const mesh = new Mesh(gl, { geometry, program });
    
    // Initialize color transition system
    currentColorRef.current = [...color];
    targetColorRef.current = [...color];
    
    let animateId: number;

    // Main render loop with smooth color interpolation
    function update(t: number) {
      animateId = requestAnimationFrame(update);
      
      // Update time uniform
      program.uniforms.uTime.value = t * 0.001;
      
      // Smooth color interpolation over ~2.5 seconds
      let needsColorUpdate = false;
      for (let i = 0; i < 3; i++) {
        const colorDifference = targetColorRef.current[i] - currentColorRef.current[i];
        
        // Only interpolate if there's a meaningful difference
        if (Math.abs(colorDifference) > 0.001) {
          currentColorRef.current[i] += colorDifference * transitionSpeedRef.current;
          needsColorUpdate = true;
        } else {
          // Snap to target when very close to prevent endless micro-updates
          currentColorRef.current[i] = targetColorRef.current[i];
        }
      }
      
      // Update WebGL color uniform if interpolation is active
      if (needsColorUpdate) {
        program.uniforms.uColor.value = new Color(...currentColorRef.current);
      }
      
      // Render the frame
      renderer.render({ scene: mesh });
    }
    
    // Start the render loop
    animateId = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);
    setIsInitialized(true);

    console.log('WebGL context initialized successfully with 2.5s smooth transitions');

    // Cleanup function
    return () => {
      console.log('Cleaning up WebGL context');
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);
      
      if (ctn.contains(gl.canvas)) {
        ctn.removeChild(gl.canvas);
      }
      
      // Properly dispose of WebGL context
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      setIsInitialized(false);
      programRef.current = null;
      rendererRef.current = null;
    };
  }, []); // No dependencies - runs once only

  // Handle color prop changes - sets target for smooth transition
  useEffect(() => {
    if (isInitialized) {
      console.log('Starting smooth transition to color:', color);
      targetColorRef.current = [...color];
    }
  }, [color, isInitialized]);

  // Handle amplitude and speed prop changes - immediate update
  useEffect(() => {
    if (programRef.current && isInitialized) {
      console.log('Updating amplitude and speed:', amplitude, speed);
      programRef.current.uniforms.uAmplitude.value = amplitude;
      programRef.current.uniforms.uSpeed.value = speed;
    }
  }, [amplitude, speed, isInitialized]);

  // Handle mouse interaction changes
  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn || !isInitialized) return;

    console.log('Mouse interaction:', mouseReact ? 'enabled' : 'disabled');

    function handleMouseMove(e: MouseEvent) {
      const rect = ctn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      
      mousePos.current = { x, y };
      
      if (programRef.current) {
        programRef.current.uniforms.uMouse.value[0] = x;
        programRef.current.uniforms.uMouse.value[1] = y;
      }
    }

    // Add mouse listener only if mouseReact is enabled
    if (mouseReact) {
      ctn.addEventListener("mousemove", handleMouseMove);
    }

    // Cleanup mouse listener
    return () => {
      ctn.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseReact, isInitialized]);

  return (
    <div
      ref={ctnDom}
      className="iridescence-container"
      {...rest}
    />
  );
}
