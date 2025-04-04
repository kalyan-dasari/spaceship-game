const gameContainer = document.getElementById("game-container");
const spaceship = document.getElementById("spaceship");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const popup = document.getElementById("game-over-popup");
const finalScoreEl = document.getElementById("final-score");
const highScoreEl = document.getElementById("high-score");

let score = 0;
let lives = 3;
let highScore = localStorage.getItem("highScore") || 0;
let spaceshipX = 225;
let keys = {};
let asteroidSpeed = 3;
let gameOver = false;
let multipleBullets = false;
let spreadBullets = false;
let asteroidInterval;

highScoreEl.textContent = highScore;

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

// Move spaceship
function moveSpaceship() {
  if (gameOver) return;
  if (keys["ArrowLeft"] && spaceshipX > 0) spaceshipX -= 6;
  if (keys["ArrowRight"] && spaceshipX < 450) spaceshipX += 6;
  spaceship.style.left = spaceshipX + "px";
  requestAnimationFrame(moveSpaceship);
}
moveSpaceship();

// Shoot
document.addEventListener("keydown", (e) => {
  if (e.key === " ") shootBullet();
});

function shootBullet() {
  let offsets = [0];
  if (multipleBullets) offsets = [-15, 0, 15];
  if (spreadBullets) offsets = [-30, -15, 0, 15, 30];

  offsets.forEach(offset => {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet");
    bullet.style.left = spaceshipX + 22 + offset + "px";
    bullet.style.bottom = "60px";
    gameContainer.appendChild(bullet);

    const interval = setInterval(() => {
      let bottom = parseInt(bullet.style.bottom);
      if (bottom >= 700) {
        clearInterval(interval);
        bullet.remove();
      } else {
        bullet.style.bottom = bottom + 10 + "px";
        checkCollision(bullet, interval);
      }
    }, 30);
  });
}

// Asteroid generator
function createAsteroid() {
  if (gameOver) return;
  const asteroid = document.createElement("div");
  const img = document.createElement("img");

  const isSpecial = Math.random() < 0.15;
  asteroid.classList.add(isSpecial ? "special-asteroid" : "asteroid");
  img.src = isSpecial ? "./images/special_asteroid.png" : "./images/asteroid.png";
  asteroid.appendChild(img);

  asteroid.style.left = Math.random() * 460 + "px";
  asteroid.style.top = "0px";
  gameContainer.appendChild(asteroid);

  const fall = setInterval(() => {
    if (!document.body.contains(asteroid)) return clearInterval(fall);

    let top = parseInt(asteroid.style.top);
    asteroid.style.top = top + asteroidSpeed + "px";

    if (top > 700) {
      asteroid.remove();
      lives--;
      livesEl.textContent = lives;
      if (lives <= 0) endGame();
      clearInterval(fall);
    }
  }, 50);
}

function checkCollision(bullet, bulletInterval) {
  const bullets = bullet.getBoundingClientRect();

  document.querySelectorAll(".asteroid, .special-asteroid").forEach(ast => {
    const rect = ast.getBoundingClientRect();

    if (
      bullets.left < rect.right &&
      bullets.right > rect.left &&
      bullets.top < rect.bottom &&
      bullets.bottom > rect.top
    ) {
      score++;
      scoreEl.textContent = score;

      if (ast.classList.contains("special-asteroid")) activatePowerUp();

      bullet.remove();
      ast.remove();
      clearInterval(bulletInterval);

      asteroidSpeed = 3 + Math.floor(score / 5);
    }
  });
}

function activatePowerUp() {
  let type = Math.random() < 0.5 ? "multiple" : "spread";
  if (type === "multiple") {
    multipleBullets = true;
    setTimeout(() => multipleBullets = false, 19000);
  } else {
    spreadBullets = true;
    setTimeout(() => spreadBullets = false, 19000);
  }
}

function endGame() {
  gameOver = true;
  popup.style.display = "block";
  finalScoreEl.textContent = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  highScoreEl.textContent = highScore;
  clearInterval(asteroidInterval);
}

// Restart game
function restartGame() {
  score = 0;
  lives = 3;
  asteroidSpeed = 3;
  gameOver = false;
  spaceshipX = 225;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  popup.style.display = "none";
  document.querySelectorAll(".bullet, .asteroid, .special-asteroid").forEach(el => el.remove());

  asteroidInterval = setInterval(createAsteroid, 1200);
}
asteroidInterval = setInterval(createAsteroid, 1200);
