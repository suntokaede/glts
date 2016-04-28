class glInit{

    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private vertexShaderSource: string;
    private fragmentShaderSource: string;
    private vertexShader: WebGLShader;
    private fragmentShader: WebGLShader;
    private program: WebGLProgram;
    private IsFullscreen: boolean;

    constructor(eleId: string, vs: string, fs: string) {
    this.run(eleId, vs, fs);
    }

    run(eleId: string, vs: string, fs: string) {
      this.init(eleId, vs, fs);
    }

    init(eleId: string, vs: string, fs: string) {
      this.canvas = <HTMLCanvasElement> document.getElementById(eleId);
      if (!this.canvas) {
          console.log("Couldn\'t fetch Canvas Element :(");
          return;
      }
      this.gl = <WebGLRenderingContext> this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
      if (!this.gl) {
          console.log("It seems your browser doesn\'t support WebGL");
          return;
      }
      this.vertexShaderSource = vs;
      this.fragmentShaderSource = fs;

      this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.program = this.gl.createProgram();

      this.gl.shaderSource(this.vertexShader, this.vertexShaderSource);
      this.gl.compileShader(this.vertexShader);
      this.gl.attachShader(this.program, this.vertexShader);

      this.gl.shaderSource(this.fragmentShader, this.fragmentShaderSource);
      this.gl.compileShader(this.fragmentShader);
      this.gl.attachShader(this.program, this.fragmentShader);

      this.gl.linkProgram(this.program);
      this.gl.useProgram(this.program);
    }

    getCanvas() {
      return this.canvas;
    }

    getGL() {
      return this.gl;
    }

    setCanvasFullscreen() {
        if (!this.IsFullscreen) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }, false);
        this.IsFullscreen = true;
    }
}
