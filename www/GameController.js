// Game controller to handle touch events
class GameController {
  constructor(model, view) {
    this.model = model;
    this.model.restart();
    this.view = view;

    // game states 
    this.NULL_STATE = -1;
    this.RUNNING_STATE = 0;
    this.CONTINUE_STATE = 1;
    this.GAMEOVER_STATE = 2;
    this.MAINMENU_STATE = 3;
    this.NEWGAME_STATE = 4;
    this.ABOUT_SCRN_STATE = 5;

    // Variables to track touch positions
    this.touch_offset_x = 0; // Initial touch position

    // Add touch  listeners
    window.addEventListener('touchstart', (event) => this.handle_touch_start(event));
    window.addEventListener('touchmove', (event) => this.handle_touch_move(event));
    window.addEventListener('touchend', (event) => this.handle_touch_end(event));

    this.last_time = Date.now();
    this.running_time = 0;
    this.delta_time = 0;

    this.prev_state = this.NULL_STATE;
    this.state = this.MAINMENU_STATE;

    this.menu_data = [
      { name: "New Game", action: (() => this.set_state(this.NEWGAME_STATE)) },
      { name: "About", action: (() => this.set_state(this.ABOUT_SCRN_STATE)) },
      { name: "Exit", action: (() => this.set_state(this.GAMEOVER_STATE)) }
          ];
  }

  run() {
    if (this.state == this.ABOUT_SCRN_STATE) {
      this.view.show_scrn_about(this);
      this.set_state(this.NULL_STATE);
    }

    else
    if (this.state == this.MAINMENU_STATE) {
      if (this.running_time > 0) {
        this.view.show_scrn_menu([...[{ name: "Continue", action: (() => this.set_state(this.CONTINUE_STATE)) }], ...this.menu_data]);
      } else {
        this.view.show_scrn_menu(this.menu_data);
      }

      this.set_state(this.NULL_STATE);
    }

    else
    if (this.state == this.CONTINUE_STATE) {
      this.view.show_scrn_play(this);

      this.set_state(this.RUNNING_STATE);
    }

    else
    if (this.state == this.NEWGAME_STATE) {
      this.view.show_scrn_play(this);
      this.model.restart();
      el_level.innerText = `Level: ${this.model.level}`;

      this.view.show_message('Starting The Game', `<p>Loading level ${this.model.level}...</p>`);

      setTimeout(() => {
        this.view.show_scrn_play(this);
        this.running_time = 0;
        this.set_state(this.RUNNING_STATE);
      }, 5000);
    }


    else
    if (this.state == this.RUNNING_STATE) {
      // check if we have ran out of bricks on screen, win
      if (this.model.bricks.length == 0) {
        this.view.show_message('Won!', '<p>You have cleared the screen!<br>Loading...</p>');
        this.model.level++;

        setTimeout(() =>
          this.set_state(this.NEWGAME_STATE),
          5000);

        this.set_state(this.NULL_STATE);
        return;
      }

      // delta time in seconds
      this.delta_time = (Date.now() - this.last_time) / 1000;

      this.model.update(this.delta_time);

      // check lose
      if (this.model.balls.length == 0) {
        this.view.show_message('Game Over!', 'Ran out of balls!');

        this.running_time = 0;
        this.set_state(this.GAMEOVER_STATE);
        return;
      }

      this.view.render();

      el_score.innerText = `Score: ${this.model.score}`;

      // update time
      this.last_time = Date.now();
      this.running_time += this.delta_time;
      requestAnimationFrame(() => this.run());
    }
  }

  set_state(new_state) {
    this.prev_state = this.state;
    this.state = new_state;

    requestAnimationFrame(() => this.run());
  }



  // Handle touch start
  handle_touch_start(event) {
    if (this.state != this.RUNNING_STATE) return;

    event.preventDefault(); // Prevent default touch behavior (like scrolling)

    // Get the canvas position relative to the viewport
    const rect = this.view.canvas.getBoundingClientRect();

    // Normalize touch coordinates relative to the canvas 
    // "2 *..." since we use (window.innerWidth - canvas.width) / 2 in GameView ratio
    let touchX = 2 * (event.touches[0].clientX - rect.left);

    // paddle should always be in the canvas 
    if (touchX > this.view.view_width - this.model.paddle.w) {
      touchX = this.view.view_width - this.model.paddle.w;
    } else if (touchX < 0) {
      touchX = 0;
    }

    // Set paddle position based on touch
    this.touch_offset_x = touchX - this.model.paddle.x;
  }

  // Handle touch move
  handle_touch_move(event) {
    // only touches if running 
    if (this.state != this.RUNNING_STATE) return;

    event.preventDefault(); // Prevent default touch behavior

    // Get the canvas position relative to the viewport
    const rect = this.view.canvas.getBoundingClientRect();

    // Get the current touch position and normalize it 
    // "2 *..." since we use (window.innerWidth - canvas.width) / 2 in GameView ratio
    let touchX = 2 * (event.touches[0].clientX - rect.left);

    touchX -= this.touch_offset_x;

    // paddle should always be in the canvas 
    if (touchX > this.view.view_width - this.model.paddle.w) {
      touchX = this.view.view_width - this.model.paddle.w;
    } else if (touchX < 0) {
      touchX = 0;
    }

    // Update paddle position based on touch movement
    this.model.paddle.x = touchX;
  }
  // Handle touch end
  handle_touch_end(event) {
    // Optionally handle touch end behavior (e.g., stop tracking)
  }
}