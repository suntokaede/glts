var glts = (function () {
    function glts() {
    }
    glts.prototype.init = function (canvasId) {
        var _this = this;
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext("webgl");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        window.addEventListener("resize", function () {
            _this.canvas.width = window.innerWidth;
            _this.canvas.height = window.innerHeight;
            _this.gl.viewport(0, 0, _this.canvas.width, _this.canvas.height);
        }, false);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE);
        this.gl.enable(this.gl.BLEND);
        return this;
    };
    // ランダムな頂点座標(-1 ~ 1)の配列を返します
    glts.prototype.getPosition = function (n) {
        if (!n)
            return;
        // x, y, zの3座標あるので3倍
        var l = n * 3;
        var arr = new Float32Array(l);
        for (var i = 0; i < l; i++) {
            if ((i + 1) % 3 === 0) {
                arr[i] = -Math.random();
            }
            else {
                arr[i] = Math.random() * 2 - 1;
            }
        }
        return arr;
    };
    glts.prototype.getPointSize = function (n) {
        if (!n)
            return;
        var arr = [];
        for (var i = 0; i < n; i++) {
            arr.push(Math.random() * 5 + 5);
        }
        return arr;
    };
    glts.prototype.getVelocity = function (n) {
        if (!n)
            return;
        var l = n * 2;
        var arr = new Float32Array(l);
        for (var i = 0; i < l; i++) {
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
    };
    glts.prototype.createProgram = function (vertexShader, fragmentShader) {
        if (!vertexShader || !fragmentShader)
            return;
        var program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            this.gl.useProgram(program);
            return program;
        }
        console.error("Failed Creating Program: " + this.gl.getProgramInfoLog(program));
    };
    glts.prototype.createShader = function (elementId) {
        if (!elementId)
            return;
        var shader;
        var type;
        var script = document.getElementById(elementId);
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
    };
    glts.prototype.createVBO = function (data) {
        if (!data)
            return;
        var vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return vbo;
    };
    glts.prototype.createDynamicVBO = function (data) {
        if (!data)
            return;
        var vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.DYNAMIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return vbo;
    };
    glts.prototype.createIBO = function (data) {
        if (!data)
            return;
        var ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    };
    glts.prototype.getAttLocations = function (names, program) {
        if (!names || !program)
            return;
        var length = names.length;
        var arr = new Array(length);
        for (var i = 0; i < length; i++) {
            arr[i] = this.gl.getAttribLocation(program, names[i]);
        }
        return arr;
    };
    glts.prototype.setAttribute = function (vbos, attLocations, attStrides, ibo) {
        var _this = this;
        if (!vbos || !attLocations || !attStrides)
            return;
        vbos.forEach(function (vbo, i) {
            _this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, vbo);
            _this.gl.enableVertexAttribArray(attLocations[i]);
            _this.gl.vertexAttribPointer(attLocations[i], attStrides[i], _this.gl.FLOAT, false, 0, 0);
        });
        if (ibo != null) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
    };
    glts.prototype.getUniLocations = function (names, program) {
        if (!names || !program)
            return;
        var arr = [];
        for (var i = 0, l = names.length; i < l; i++) {
            arr.push(this.gl.getUniformLocation(program, names[i]));
        }
        return arr;
    };
    glts.prototype.setUniforms = function (uniLocations, uniTypes, data) {
        if (!uniLocations || !uniTypes || !data)
            return;
        for (var i = 0, l = uniTypes.length; i < l; i++) {
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
    };
    glts.prototype.createTexture = function (img) {
        if (!img)
            return;
        var tex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return tex;
    };
    glts.prototype.repeatArray = function (content, num) {
        if (!content || !num)
            return;
        var arr = [];
        for (var i = 0; i < num; i++) {
            arr = arr.concat(content);
        }
        return arr;
    };
    glts.prototype.createTextureWithUrl = function (url) {
        if (!url)
            return;
        var tex = this.gl.createTexture();
        var _this = this;
        return this.loadImageAsync(url)
            .then(function (img) {
            _this.gl.bindTexture(_this.gl.TEXTURE_2D, tex);
            _this.gl.texImage2D(_this.gl.TEXTURE_2D, 0, _this.gl.RGBA, _this.gl.RGBA, _this.gl.UNSIGNED_BYTE, img);
            _this.gl.generateMipmap(_this.gl.TEXTURE_2D);
            _this.gl.bindTexture(_this.gl.TEXTURE_2D, null);
            return new Promise(function (resolve) {
                resolve(tex);
            });
        })
            .catch(function () {
            console.error("Failed Loading Image");
        });
    };
    glts.prototype.getAsync = function (url) {
        if (!url)
            return;
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.send();
            xhr.addEventListener("load", function () {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                }
            }, false);
            xhr.addEventListener("error", function () {
                reject();
            }, false);
        });
    };
    glts.prototype.loadImageAsync = function (src) {
        if (!src)
            return;
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.src = src;
            img.addEventListener("load", function () {
                resolve(img);
            }, false);
            img.addEventListener("error", function () {
                reject();
            }, false);
        });
    };
    return glts;
}());
