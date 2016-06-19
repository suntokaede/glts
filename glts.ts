class glts {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;

    private VBO: WebGLBuffer[];

    constructor(canvasId: string) {
        this.init(canvasId);
    }

    init(canvasId: string) {
        this.canvas = <HTMLCanvasElement>document.getElementById(canvasId);
        this.gl = <WebGLRenderingContext>this.canvas.getContext("webgl");

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }, false);

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    getGLContext() {
        return this.gl;
    }

    // ランダムな頂点座標(-1 ~ 1)の配列を返します
    getPosition(n) {
        // x, y, zの3座標あるので3倍
        const l = n * 3;
        let arr = new Float32Array(l);
        for (let i = 0; i < l; i++) {
            if ((i + 1) % 3 === 0) {
                arr[i] = -Math.random();
            } else {
                arr[i] = Math.random() * 2 - 1;
            }
        }
        return arr;
    }

    getPointSize(n) {
        let arr = [];
        for (let i = 0; i < n; i++) {
            arr.push(Math.random() * 5 + 5);
        }
        return arr;
    }

    getVelocity(n) {
        let l = n * 2;
        let arr = new Float32Array(l);
        for (let i = 0; i < l; i++) {
            if (i % 2 === 0) {
                // x座標のvelocity
                arr[i] = -Math.random() * 0.002 + 0.001;
            }
            else {
                // y座標のvelocity
                arr[i] = -Math.random() * 0.003 - 0.006;
            }
        }
        return arr;
    }

    createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        let program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.gl.useProgram(program);
            return program;
        }
        console.error("Failed Creating Program: " + this.gl.getProgramInfoLog(program));
    }

    createShader(elementId: string) {
        let shader: WebGLShader;
        let type: boolean;
        let script = <HTMLScriptElement>document.getElementById(elementId);
        if (script === null) {
            console.log("Could not fetch Script Element..");
            return;
        }
        switch (script.type) {
            case 'x-shader/x-vertex':
                shader = this.gl.createShader(this.gl.VERTEX_SHADER);
                type = true;
                break;
            case 'x-shader/x-fragment':
                shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
                type = false;
                break;
            default:
                return;
        }
        this.gl.shaderSource(shader, script.text);
        this.gl.compileShader(shader);
        if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            return shader;
        }
        console.error("Failed Compiling " + (type ? "Vertex" : "Fragment") + " Shader :" + this.gl.getShaderInfoLog(shader));
    }

    createVBO(data) {
        let vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return vbo;
    }

    createDynamicVBO(data: Float32Array) {
        let vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.DYNAMIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return vbo;
    }

    createIBO(data) {
        let ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    getAttLocations(names: string[], program: WebGLProgram) {
        let length = names.length;
        let arr = new Array(length);
        for (let i = 0; i < length; i++) {
            arr[i] = this.gl.getAttribLocation(program, names[i]);
        }
        return arr;
    }

    setAttribute(vbos: WebGLBuffer[], attLocations: number[], attStrides: number[], ibo: WebGLBuffer) {
        vbos.forEach((vbo, i) => {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
            this.gl.enableVertexAttribArray(attLocations[i]);
            this.gl.vertexAttribPointer(attLocations[i], attStrides[i], this.gl.FLOAT, false, 0, 0);
        });

        if (ibo != null) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
    }

    getUniLocations(names: string[], program: WebGLProgram) {
        let arr = [];
        for (let i = 0, l = names.length; i < l; i++) {
            arr.push(this.gl.getUniformLocation(program, names[i]));
        }
        return arr;
    }

    setUniforms(uniLocations: WebGLUniformLocation[], uniTypes: string[], data) {
        for (let i = 0, l = uniTypes.length; i < l; i++){
            switch (uniTypes[i]) {
                case '4fv':
                    this.gl.uniform4fv(uniLocations[i], data[i]);
                    break;
                case '3fv':
                    this.gl.uniform3fv(uniLocations[i], data[i]);
                    break;
                case '2fv':
                    this.gl.uniform2fv(uniLocations[i], data[i]);
                    break;
                case '1fv':
                    this.gl.uniform1fv(uniLocations[i], data[i]);
                    break;
                case '1f':
                    this.gl.uniform1f(uniLocations[i], data[i]);
                    break;
                case '1iv':
                    this.gl.uniform1iv(uniLocations[i], data[i]);
                    break;
                case '1i':
                    this.gl.uniform1i(uniLocations[i], data[i]);
                    break;
                case 'matrix4fv':
                    this.gl.uniformMatrix4fv(uniLocations[i], false, data[i]);
                    break;
                case 'matrix3fv':
                    this.gl.uniformMatrix3fv(uniLocations[i], false, data[i]);
                    break;
                case 'matrix2fv':
                    this.gl.uniformMatrix2fv(uniLocations[i], false, data[i]);
                    break;
            }
        }
    }

    createTexture(img: any) {
        let tex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return tex;
    }

    createTextureWithUrl(url: string, dest: any) {
        if (!url) return;

        const tex = this.gl.createTexture();
        const _this = this;
        this.loadImageAsync(url)
            .then((img) => {
                _this.gl.bindTexture(_this.gl.TEXTURE_2D, tex);
                _this.gl.texImage2D(_this.gl.TEXTURE_2D, 0, _this.gl.RGBA, _this.gl.RGBA, _this.gl.UNSIGNED_BYTE, img);
                _this.gl.generateMipmap(_this.gl.TEXTURE_2D);
                dest = tex;
            })
            .catch(() => {
                console.error("Failed Loading Image");
            });
    }

    loadImageAsync(src: string) {
        return new Promise(function (resolve, reject) {
            const img = new Image();
            img.src = src;
            img.addEventListener("load", () => {
                resolve(img);
            }, false);
            img.addEventListener("error", () => {
                reject();
            }, false);
        });
    }

    repeatArray(content: any, num: number) {
        let arr = [];
        for (let i = 0; i < num; i++) {
            arr = arr.concat(content);
        }
        return arr;
    }

}
