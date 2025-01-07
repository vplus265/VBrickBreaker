class GameModel {
  constructor() {
    this.balls = [];
    this.bricks = [];
    this.puboxes = []; // floating 
    this.paddle = null;
    this.view = null;
    this.level = 1;
    this.score = 0;
  }

  restart(level = null) {
    if (level) this.level = level;
    else level = this.level;

    // the balls 
    this.balls.length = 0;
    this.add_ball(new Ball(320, 50, 15, 'blue', this));
    this.add_ball(new Ball(370, 50, 15, 'green', this));
    this.add_ball(new Ball(410, 50, 15, 'orange', this));

    // the paddle
    this.set_paddle(new Paddle(this.view.view_width / 2 - 50, this.view.view_height - 80, 100, 30, 'brown'));

    // clear old bricks
    this.bricks.length = 0;
    // map
    for (let i = 0; i < 14; i++) {
      for (let j = 0; j < 16; j++) {
        if (Math.random() < (0.1 * level)) {
          // powerup
          let pubox = null;
          if (Math.random() < 0.1)
            pubox = new PUBox(i * 50 + 20, j * 50 + 50, 40, 40, 'pink', 'DP_BALL', duplicate_pow);

          this.bricks.push(new Brick(i * 50 + 20, j * 50 + 50, 40, 40, 'purple', pubox));
        }

      }
    }
  }

  update(delta_time) {
    //PADDLE UPDATES 
    if (this.paddle) {
      this.paddle.update(delta_time);
    }

    //BALL AND BRICKS 
    // `this.view` is set in GameView 
    // update and check collisions
    for (let i = 0; i < this.balls.length; i++) {
      let ball = this.balls[i];

      // update ball
      ball.update(delta_time, this.view);

      // paddle collision
      if (this.paddle) {
        ball.check_collision(this.paddle, false);
      }

      // check brick collision
      this.bricks.forEach(brick => {
        // if collides, kill it
        ball.check_collision(brick);

        // update brick 
        brick.update(delta_time);
      }); // bricks.forEach 

      // ball on bottom
      if (ball.y > this.paddle.y + ball.r * 3) {
        // remove it
        this.balls.splice(i--, 1);
      }
    } // balls

    // remove dead bricks 
    for (let i = 0; i < this.bricks.length; i++) {
      if (this.bricks[i].life <= 0) {
        let brick = this.bricks[i];
        this.bricks.splice(i--, 1);

        // power box, is released 
        if (brick.pubox) {
          // the ball
          brick.pubox.hitter = brick.hitter;
          this.puboxes.push(brick.pubox);
        }
      }
    }

    // update floating powerups
    for (let i = 0; i < this.puboxes.length; i++) {
      let box = this.puboxes[i];
      box.y += 2;

      // remove them if out of screen 
      if (box.y > this.view.view_height) {
        this.puboxes.splice(i--, 1);
      } else if (box.check_collision(this.paddle)) {
        this.puboxes.splice(i--, 1);
        // put powerup to the ba
        box.hitter.copy_pow(box.powerup);
      }
    }

  }

  add_ball(ball) {
    this.balls.push(ball);
    return ball;
  }

  set_paddle(paddle) {
    return this.paddle = paddle;
  }
}

class PUBox {
  constructor(x, y, w, h, color, name, powerup) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.name = name;
    this.powerup = powerup;
    this.hitter = null; // the ball that hitted this
  }

  check_collision(rect) {
    // Calculate the distance between the ball's center and the brick's edges
    const thisLeft = this.x;
    const thisRight = this.x + this.w;
    const thisTop = this.y;
    const thisBottom = this.y + this.h;

    const brickLeft = rect.x;
    const brickRight = rect.x + rect.w;
    const brickTop = rect.y;
    const brickBottom = rect.y + rect.h;

    // Check for collision
    return (
      thisLeft < brickRight &&
      thisRight > brickLeft &&
      thisTop < brickBottom &&
      thisBottom > brickTop
    );

  }
}

class PowerUp {
  constructor(name, duration, owner, init_fn, update_fn, delete_fn) {
    this.name = name;
    this.duration = duration;
    this.owner = owner;
    this.init_fn = init_fn;
    this.update_fn = update_fn;
    this.delete_fn = delete_fn;

    this.elapsed_time = 0;
  }

  init() {
    this.init_fn(this);
    return this;
  }

  update(delta_time) {
    // increase 
    this.elapsed_time += delta_time;

    // execute the function 
    this.update_fn(this, delta_time);
  }

  ondelete() {
    this.delete_fn(this);
  }
}

class Ball {
  constructor(x, y, r, color, model) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.max_speed = 8;
    this.vx = 0;
    this.vy = this.max_speed;
    this.color = color;
    this.model = model;

    this.powerups = [];
  }

  add_pow(name, duration, init_fn, update_fn, delete_fn) {
    if (this.powerups.find((v, i, o) => v.name == name)) {
      return; // avoid duplicates
    }

    this.powerups.push(new PowerUp(name, duration, this, init_fn, update_fn, delete_fn));

    return this.powerups[this.powerups.length - 1].init();
  }

  copy_pow(pow) {
    return this.add_pow(pow.name, pow.duration, pow.init_fn, pow.update_fn, pow.delete_fn);
  }

  get_clone() {
    return new Ball(this.x, this.y, this.r, this.color, this.model);
  }

  update(delta_time, view) {
    // powerups first 
    for (let i = 0; i < this.powerups.length; i++) {
      // update 
      this.powerups[i].update(delta_time);

      // remove expired ones
      if (this.powerups[i].elapsed_time > this.powerups[i].duration) {
        this.powerups[i].ondelete();
        this.powerups.splice(i--, 1);
      }
    }

    // check hit walls
    // left and right 
    if (this.x > view.view_width) {
      this.vx = -this.vx;
      this.x = view.view_width;
    } else if (this.x < 0) {
      this.vx = -this.vx;
      this.x = 0;
    }

    // top and down 
    if (this.y > view.view_height) {
      this.vy = -this.vy;
      this.y = view.view_height;
    } else if (this.y < 0) {
      this.vy = -this.vy;
      this.y = 0;
    }

    this.x += this.vx; // * (delta_time * 100);
    this.y += this.vy; // * (delta_time * 100);
  }

  check_collision(brick, is_brick = true) {
    // Calculate the distance between the ball's center and the brick's edges
    const ballLeft = this.x - this.r;
    const ballRight = this.x + this.r;
    const ballTop = this.y - this.r;
    const ballBottom = this.y + this.r;

    const brickLeft = brick.x;
    const brickRight = brick.x + brick.w;
    const brickTop = brick.y;
    const brickBottom = brick.y + brick.h;

    // Check for collision
    let collided = (
      ballLeft < brickRight &&
      ballRight > brickLeft &&
      ballTop < brickBottom &&
      ballBottom > brickTop
    );

    if (collided) {
      const dl = Math.abs(brickLeft - ballLeft);
      const dt = Math.abs(brickTop - ballTop);
      const dr = Math.abs(brickRight - ballRight);
      const db = Math.abs(brickBottom - ballBottom);

      const min = Math.min(dl, dt, dr, db);

      if (is_brick) {
        if (min === dl || min === dr) {
          this.vy = -this.vy;
        } else {
          this.vx = -this.vx;
        }
      }
      // else is paddle 
      else {
        //0 and 1
        let pos = (this.x - brick.x) / brick.w;
        this.vy = -this.vy;

        let max_angle = 45 * (Math.PI / 180) // degrees to radians
        let angle = pos * max_angle - (max_angle / 2); // min to max 
        this.vx = Math.sin(angle) * this.max_speed;
      }

      this.x += this.vx;
      this.y += this.vy;

      // kill the brick
      brick.hitted_by(this);
    }

    return collided;
  }
}

class Paddle {
  constructor(x, y, w, h, color) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
  }

  hitted_by(ball) {
    // ball.copy_pow(speed_pow);
    //ball.copy_pow(size_pow);
  }

  update() {

  }
}

class Brick {
  constructor(x, y, w, h, color, pubox = null) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.pubox = pubox;
    this.hitter = null; // the ball that hits this

    this.life = 1.0;
    this.is_dying = false;
  }

  hitted_by(ball) {
    this.hitter = ball;

    // avoid continuous trigger
    if (this.is_dying) return;

    // trigger death
    this.is_dying = true; 
    
    // increase score
    ball.model.score++;
  }

  update(delta_time) {

    // die slowly
    if (this.is_dying) {
      this.life -= 0.03 * (delta_time * 100);
      let w = this.w;
      let h = this.h;
      this.w *= this.life;
      this.h *= this.life;
      this.x += (w - this.w) / 2;
      this.y += (h - this.h) / 2;
    }
  }
}