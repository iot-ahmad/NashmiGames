import { useEffect, useRef, useState } from "react"

export function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)
    if (!gl) {
      console.warn("WebGL not supported in this browser.")
      return
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault() // Request context restoration
      console.warn("WebGL context lost. Waiting for restore...")
    }

    const handleContextRestored = () => {
      console.log("WebGL context restored. Re-initializing...")
      setRetryKey(prev => prev + 1)
    }

    canvas.addEventListener("webglcontextlost", handleContextLost, false)
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false)

    // Get WebGL lose context extension to cleanly dispose GPU resources on unmount
    const glLoseContext = gl.getExtension("WEBGL_lose_context")

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);
        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program))
      return
    }

    // Vertices for a full screen quad
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLoc = gl.getAttribLocation(program, "position")
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    const resolutionLoc = gl.getUniformLocation(program, "resolution")
    const timeLoc = gl.getUniformLocation(program, "time")
    const xScaleLoc = gl.getUniformLocation(program, "xScale")
    const yScaleLoc = gl.getUniformLocation(program, "yScale")
    const distortionLoc = gl.getUniformLocation(program, "distortion")

    let animationId: number
    const startTime = performance.now()

    function resize() {
      if (!canvas || !gl) return
      const width = window.innerWidth
      const height = window.innerHeight
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    function render() {
      if (!gl || !program || gl.isContextLost()) return
      
      resize()

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      gl.useProgram(program)

      const elapsed = (performance.now() - startTime) * 0.001
      
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height)
      gl.uniform1f(timeLoc, elapsed)
      gl.uniform1f(xScaleLoc, 1.0)
      gl.uniform1f(yScaleLoc, 0.5)
      gl.uniform1f(distortionLoc, 0.05)

      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animationId = requestAnimationFrame(render)
    }

    render()

    window.addEventListener("resize", resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("webglcontextlost", handleContextLost)
      canvas.removeEventListener("webglcontextrestored", handleContextRestored)
      
      if (gl) {
        try { gl.deleteBuffer(buffer) } catch (e) {}
        try { gl.deleteProgram(program) } catch (e) {}
        try { gl.deleteShader(vs) } catch (e) {}
        try { gl.deleteShader(fs) } catch (e) {}
        // Force lose the WebGL context on unmount to completely free up GPU resources
        if (glLoseContext) {
          glLoseContext.loseContext()
        }
      }
    }
  }, [retryKey])

  return (
    <canvas
      key={retryKey}
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full block"
      style={{ zIndex: -1, opacity: 0.6, pointerEvents: 'none' }}
    />
  )
}

