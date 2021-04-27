let scoreEl = document.querySelector("#scoreEl");
const startGameBtn = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");
let bigScoreEl = document.querySelector("#bigScoreEl");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

//Set window width and height
canvas.width = innerWidth;
canvas.height = innerHeight;

//Player class
class Player{
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    
    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

//Enemy class
class Enemy{
    constructor(x, y, radius, color, speed){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.speed.x;
        this.y = this.y + this.speed.y;
    }
}

//Bullet class
class Bullet{
    constructor(x, y, radius, color, speed){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update(){
        this.draw();
        this.x = this.x + this.speed.x;
        this.y = this.y + this.speed.y;
    }
}

//Particle class
const friction = 0.99;
class Particle{
    constructor(x, y, radius, color, speed){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.alpha = 1;
    }

    draw(){
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update(){
        this.draw();
        this.speed.x *= friction;
        this.speed.y *= friction;
        this.x = this.x + this.speed.x;
        this.y = this.y + this.speed.y;
        this.alpha -= 0.01;
    }

}


//Create player instance
let player = new Player(canvas.width / 2, canvas.height / 2, 10, "white");

//Setting up the foreach bullet and the bullets array
let bullets = [];
let enemies = [];
let particles = [];

function init(){
    player = new Player(canvas.width / 2, canvas.height / 2, 10, "white");
    bullets = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (50 - 7) + 7;
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        let x;
        let y;
        if(Math.random() > 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x
        );
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

let score = 0;
let animationID;
function animate(){
    animationID = requestAnimationFrame(animate);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if(particle.alpha <= 0){
            particles.slice(index, 1);
        }else{
            particle.update();
        }
    });
    bullets.forEach((bullet, index) => {
        bullet.update();
        //Remove bullets if outside screen
        if(
            bullet.x - bullet.radius < 0 || 
            bullet.x - bullet.radius > canvas.width || 
            bullet.y - bullet.radius < 0 ||
            bullet.y - bullet.radius > canvas.height
            ){
            setTimeout(() => {
                bullets.splice(index, 1);
            }, 0);
        }
    });
    enemies.forEach((enemy, enemyIndex)=> {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        //End game
        if(dist - enemy.radius - player.radius < 1 ){
            cancelAnimationFrame(animationID);
            modalEl.style.display = "flex";
            bigScoreEl.innerHTML = score;
        }
        bullets.forEach((bullet, bulletIndex) => {
            const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            if(dist - enemy.radius - bullet.radius < 1 ){ //if bullet touches enemy
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(bullet.x, bullet.y, Math.random() * 2, enemy.color, 
                    {
                        x: (Math.random() - 0.5) * Math.random() * 6,
                        y: (Math.random() - 0.5) * Math.random() * 6
                    }));        
                }
                if(enemy.radius - 15 > 10){
                    score+=100;
                    scoreEl.innerHTML = score;
                    gsap.to(enemy, {radius: enemy.radius - 10});
                    setTimeout(() => {
                        bullets.splice(bulletIndex, 1);
                    }, 0);
                }else{
                    score+=250;
                    scoreEl.innerHTML = score;
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1);
                        bullets.splice(bulletIndex, 1);
                    }, 0);
                }
            }
        });
    });
}

//On click event
addEventListener("click", (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    );
    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    };
    bullets.push(new Bullet(canvas.width / 2, canvas.height / 2, 5, "white", velocity));
});

//Executing the frame per frame update
startGameBtn.addEventListener("click", () => {
    init();
    animate();
    spawnEnemies();
    modalEl.style.display = "none";
})