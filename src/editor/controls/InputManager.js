function initializeValue(source, target, value) {
  if (!source) return;

  for (const sourceKey in source) {
    if (source.hasOwnProperty(sourceKey)) {
      const targetKey = source[sourceKey];
      target[targetKey] = value;
    }
  }
}

export default class InputManager {
  constructor(canvas) {
    this.canvas = canvas;

    this.mapping = {};
    this.initialState = {};
    this.state = {};

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousemove", this.onMouseMove);
  }

  setInputMapping(mapping) {
    this.mapping = mapping;

    const initialState = this.initialState;

    const keyboard = mapping.keyboard;

    if (keyboard) {
      initializeValue(keyboard.pressed, initialState, 0);
      initializeValue(keyboard.keydown, initialState, 0);
      initializeValue(keyboard.keyup, initialState, 0);
    }

    const mouse = mapping.mouse;

    if (mouse) {
      initializeValue(mouse.move, initialState, 0);
    }

    const computed = mapping.computed;

    if (computed) {
      for (const { action, transform, defaultValue } of computed) {
        initialState[action] = defaultValue !== undefined ? defaultValue : transform(this);
      }
    }
  }

  onKeyDown = event => {
    const keyboardMapping = this.mapping.keyboard;

    if (!keyboardMapping) return;

    const pressedMapping = keyboardMapping.pressed;

    if (pressedMapping) {
      const key = pressedMapping[event.key.toLowerCase()];

      if (key) {
        this.state[key] = 1;
      }
    }

    const keydownMapping = keyboardMapping.keydown;

    if (keydownMapping) {
      const key = keydownMapping[event.key.toLowerCase()];

      if (key) {
        this.state[key] = 1;
      }
    }
  };

  onKeyUp = event => {
    const keyboardMapping = this.mapping.keyboard;

    if (!keyboardMapping) return;

    const pressedMapping = keyboardMapping.pressed;

    if (pressedMapping) {
      const key = pressedMapping[event.key.toLowerCase()];

      if (key) {
        this.state[key] = 0;
      }
    }

    const keyupMapping = keyboardMapping.keyup;

    if (keyupMapping) {
      const key = keyupMapping[event.key.toLowerCase()];

      if (key) {
        this.state[key] = 0;
      }
    }
  };

  onMouseMove = event => {
    const mouseMapping = this.mapping.mouse;

    if (!mouseMapping) return;

    const moveMapping = mouseMapping.move;

    if (!moveMapping) return;

    for (const key in moveMapping) {
      if (moveMapping.hasOwnProperty(key)) {
        this.state[moveMapping[key]] += event[key];
      }
    }
  };

  update() {
    const computed = this.mapping.computed;

    if (computed) {
      for (const { action, transform } of computed) {
        this.state[action] = transform(this);
      }
    }
  }

  reset() {
    const mouseMapping = this.mapping.mouse;

    if (mouseMapping && mouseMapping.move) {
      const moveMapping = mouseMapping.move;

      for (const key in moveMapping) {
        if (moveMapping.hasOwnProperty(key)) {
          this.state[moveMapping[key]] = 0;
        }
      }
    }
  }

  get(key) {
    return this.state[key] || 0;
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousemove", this.onMouseMove);
  }
}