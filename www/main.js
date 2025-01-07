const size_pow = new PowerUp("sizeup", 5.000, null,
  (self) => {
    self.initial_r = self.owner.r;
    self.owner.r *= 1.4;
    self.initial_c = self.owner.color;
  },
  (self, delta_time) => {
    self.owner.color = `hsl(${self.elapsed_time/self.duration*360}, 100%, 55%)`;
  },
  (self) => {
    self.owner.r = self.initial_r;
    self.owner.color = self.initial_c;
  }
);

const duplicate_pow = new PowerUp("duplicate", 0.001, null,
  (self) => {
    self.owner.model.add_ball(self.owner.get_clone());
  },
  (self, delta_time) => {
  },
  (self) => {
  }
);

const model = new GameModel();
const view = new GameView(el_canv, model);
const control = new GameController(model, view);


// start
control.run();