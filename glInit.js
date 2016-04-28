var glInit = (function () {
    function glInit(eleId) {
        this.run(eleId);
    }
    glInit.prototype.run = function (eleId) {
        this.canvas = document.getElementById(eleId);
        this.gl = this.canvas.getContext();
    };
    return glInit;
}());
