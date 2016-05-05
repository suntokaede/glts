var glInit = (function () {
    function glInit(eleId, vs, fs) {
        this.run(eleId, vs, fs);
    }
    glInit.prototype.run = function (eleId, vs, fs) {
        this.init(eleId, vs, fs);
    };
    glInit.prototype.init = function (eleId, vs, fs) {
        this.IsFullscreen = false;
        this.canvas = document.getElementById(eleId);
        if (!this.canvas) {
            console.log("Couldn\'t fetch Canvas Element :(");
            return;
        }
        this.gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
        if (!this.gl) {
            console.log("It seems your browser doesn\'t support WebGL");
            return;
        }
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
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
    };
    glInit.prototype.getCanvas = function () {
        return this.canvas;
    };
    glInit.prototype.getGL = function () {
        return this.gl;
    };
    glInit.prototype.setCanvasFullscreen = function () {
        var _this = this;
        if (this.IsFullscreen)
            return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        window.addEventListener("resize", function () {
            _this.canvas.width = window.innerWidth;
            _this.canvas.height = window.innerHeight;
            _this.gl.viewport(0, 0, _this.canvas.width, _this.canvas.height);
        }, false);
        this.IsFullscreen = true;
    };
    return glInit;
})();
//# sourceMappingURL=glInit.js.map