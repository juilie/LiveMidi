const img = document.getElementById("ctLogo");
console.log(img);

function circle(ctx, note, velocity) {
    const normalizedNote = normalize(59, 74, note) * innerWidth
    const normalizedVelocity = normalize(velocity)
    console.log(normalizedNote);
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.arc(normalizedNote, 50, 40, 0, 2 * Math.PI);
    ctx.stroke();

}

function normalize(min, max, val) {
    return (val - min)/(max - min)
}

function bounce(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.x = normalize(11, 121, x) * innerWidth;
    this.y = y;    
    this.speedX = 0;
    this.speedY = 0;    
    this.gravity = 0.6;
    this.gravitySpeed = 0;
    this.bounce = 0.4;
    this.update = function(ctx) {
        ctx.fillStyle = color;
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(img, this.x, this.y, this.width, this.height)
    }
    this.newPos = function(ctx) {
        this.gravitySpeed += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom(ctx);
    }
    this.hitBottom = function(ctx) {
        var rockbottom = ctx.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = -(this.gravitySpeed * this.bounce);
        }
    }
}