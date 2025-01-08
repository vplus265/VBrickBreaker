class GameView {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.model = model;
    this.model.view = this;

    this.view_width = 720;
    this.view_height = 1280;
    this.canvas.width = this.view_width;
    this.canvas.height = this.view_height;
    this.ctx = canvas.getContext("2d");

    window.addEventListener("resize", () => this.resize());
    window.addEventListener("orientationchange", () => this.resize());
    this.resize();
  }

  resize() {
    // the aspect ration
    const ratio = this.view_width / this.view_height;

    // window width and height
    const w_w = window.innerWidth;
    const w_h = window.innerHeight;

    let w, h;
    // just rearrange the formula: `r = w / h`
    if (w_w / w_h >= ratio) {
      w = w_h * ratio;
      h = w_h;
    } else {
      w = w_w;
      h = w_w / ratio;
    }

    this.canvas.style.position = "absolute";
    this.canvas.style.left = `${(w_w - w) / 2}px`;
    this.canvas.style.top = `${(w_h - h) / 2}px`;
    this.canvas.style.width = `${w - 5}px`;
    this.canvas.style.height = `${h - 5}px`;
  }

  hide_all() {
    el_main.childNodes.forEach((v, i, arr) => {
      if (v.style) v.style.display = "none";
    });
  }

  show_scrn_play(controller) {
    this.hide_all();

    el_canv.style.display = "block";
    el_play_gui_box.style.display = "block";

    el_btn_menu.style.display = "inline";
    el_btn_menu.onclick = () =>
      setTimeout(() => controller.set_state(controller.MAINMENU_STATE), 300);
    // change the btn text to show pause when on the play screen
    el_btn_menu.textContent = "[:Pause:]";
  }

  show_scrn_about(controller) {
    this.hide_all();

    el_about.style.display = "flex";

    el_about.innerHTML = `
        <p>This is a simple html5 game created by Vplus265 (Valentino Phiri)</p>
        <p>It is open source at https://github.com/vplus265/VBrickBreaker</p> 
        <p>If you happen to work on it, let me know how cool it end up to be. I am curious (says vplus265) </p>
         
        <button id="el_btn_back" class="gui_btn">Back</button>
      `;

    el_btn_back.onclick = () =>
      setTimeout(() => controller.set_state(controller.MAINMENU_STATE), 300);
  }

  show_scrn_menu(data) {
    this.hide_all();

    el_gui_menu.style.display = "flex";
    el_h1.style.display = "flex";

    // Clear existing buttons
    while (el_gui_menu.firstChild) {
      el_gui_menu.removeChild(el_gui_menu.firstChild);
    }

    // Create and append buttons based on menuData
    data.forEach((item) => {
      const button = document.createElement("button");
      button.textContent = `> ${item.name}`;
      // when clicked, open after 300 millis
      button.onclick = () => setTimeout(item.action, 300);
      button.setAttribute("class", "gui_btn");
      el_gui_menu.appendChild(button);
    });
  }

  show_message(title, message) {
    // this.hide_all();

    el_message.style.display = "block";
    el_message.innerHTML = `
    <div style="padding:1em">
      <h3>${title}</h3>
      <p>${message}</p>
    <div>
    `;
  }

  render() {
    this.ctx.strokeStyle = "";

    // background
    this.ctx.fillStyle = "rgb(255,255,255, 0.4)";
    this.ctx.fillRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);

    // draw bricks
    this.model.bricks.forEach((brick) => {
      this.ctx.fillStyle = brick.color;
      this.ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
    });

    // draw puboxes
    this.model.puboxes.forEach((box) => {
      this.ctx.fillStyle = box.color;
      this.ctx.fillRect(box.x, box.y, box.w, box.h);

      this.ctx.font = `Bold ${(box.w / box.name.length) * 1.5}px Arial`;
      this.ctx.fillStyle = "black";
      this.ctx.fillText(box.name, box.x, box.y + box.h / 2);
    });

    //draw paddle
    if (this.model.paddle) {
      this.ctx.fillStyle = this.model.paddle.color;
      this.ctx.fillRect(
        this.model.paddle.x,
        this.model.paddle.y,
        this.model.paddle.w,
        this.model.paddle.h
      );
    }

    // draw the ball
    this.model.balls.forEach((ball) => {
      this.ctx.fillStyle = ball.color;
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.closePath();
    });
  }
}
