define("ray", [], function() {

function Ray(direction, origin, shadow) {
    this.direction = direction;
    this.origin = origin;
    this.shadow = shadow;
}
return Ray;
})
