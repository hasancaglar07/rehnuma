// Based on https://github.com/jhammann/sakura (vanilla JS Sakura petals)
type SakuraColor = {
  gradientColorStart: string;
  gradientColorEnd: string;
  gradientColorDegree: number;
};

type SakuraOptions = {
  className?: string;
  fallSpeed?: number;
  maxSize?: number;
  minSize?: number;
  delay?: number;
  colors?: SakuraColor[];
  lifeTime?: number;
};

const defaults: Required<SakuraOptions> = {
  className: "sakura",
  fallSpeed: 0.7,
  maxSize: 20,
  minSize: 12,
  delay: 380,
  colors: [
    {
      gradientColorStart: "rgba(255, 183, 197, 0.9)",
      gradientColorEnd: "rgba(255, 197, 208, 0.9)",
      gradientColorDegree: 120
    }
  ],
  lifeTime: 0
};

function chooseRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class SakuraPlugin {
  private el: HTMLElement;
  private settings: Required<SakuraOptions>;
  private petalsWeak = new Map<number, HTMLElement>();
  private lifeTimer?: number;
  private createPetal: () => void;

  constructor(selector: string, options?: SakuraOptions) {
    if (!selector) throw new Error("No selector present. Define an element.");
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) throw new Error("Target element not found.");
    this.el = el;

    const merged = { ...defaults, ...(options || {}) };
    this.settings = merged;

    // Lifetime cleanup loop
    this.lifeTimer = window.setInterval(() => {
      if (!this.settings.lifeTime) return;
      const now = Date.now();
      const expired: number[] = [];
      for (const [id, petal] of this.petalsWeak.entries()) {
        if (id + this.settings.lifeTime < now) {
          expired.push(id);
          petal.remove();
        }
      }
      expired.forEach((id) => this.petalsWeak.delete(id));
    }, 1000);

    this.el.style.overflowX = "hidden";

    const prefixes = ["webkit", "moz", "MS", "o", ""];
    const addEvent = (el: HTMLElement, evt: string, handler: EventListener) => {
      for (let i = 0; i < prefixes.length; i += 1) {
        const prefix = prefixes[i];
        const eventName = prefix ? `${prefix}${evt}` : evt.toLowerCase();
        el.addEventListener(eventName, handler, false);
      }
    };

    const isInView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.left >= 0 && r.bottom <= (window.innerHeight || document.documentElement.clientHeight) && r.right <= (window.innerWidth || document.documentElement.clientWidth);
    };

    this.createPetal = () => {
      if (!this.el.dataset.sakuraAnimId) return;
      setTimeout(() => window.requestAnimationFrame(this.createPetal), this.settings.delay);

      const sway = chooseRandom(["sway-0", "sway-1", "sway-2", "sway-3", "sway-4", "sway-5", "sway-6", "sway-7", "sway-8"]);
      const blow = chooseRandom(["blow-soft-left", "blow-medium-left", "blow-soft-right", "blow-medium-right"]);

      const fallTime = (0.007 * document.documentElement.clientHeight + Math.round(5 * Math.random())) * this.settings.fallSpeed;
      const animations = [
        `fall ${fallTime}s linear 0s 1`,
        `${blow} ${Math.max(fallTime, 30) - 20 + randInt(0, 20)}s linear 0s infinite`,
        `${sway} ${randInt(2, 4)}s linear 0s infinite`
      ].join(", ");

      const petal = document.createElement("div");
      petal.classList.add(this.settings.className);

      const size = randInt(this.settings.minSize, this.settings.maxSize);
      const width = size - Math.floor(randInt(0, this.settings.minSize) / 3);
      const color = chooseRandom(this.settings.colors);

      petal.style.background = `linear-gradient(${color.gradientColorDegree}deg, ${color.gradientColorStart}, ${color.gradientColorEnd})`;
      petal.style.animation = animations;
      petal.style.borderRadius = `${randInt(this.settings.maxSize, this.settings.maxSize + Math.floor(10 * Math.random()))}px ${randInt(1, Math.floor(width / 4))}px`;
      petal.style.height = `${size}px`;
      petal.style.width = `${width}px`;
      petal.style.left = `${Math.random() * document.documentElement.clientWidth - 100}px`;
      petal.style.marginTop = `${-(Math.floor(20 * Math.random()) + 15)}px`;

      addEvent(petal, "AnimationEnd", () => {
        if (!isInView(petal)) petal.remove();
      });
      addEvent(petal, "AnimationIteration", () => {
        if (!isInView(petal)) petal.remove();
      });

      this.petalsWeak.set(Date.now(), petal);
      this.el.appendChild(petal);
    };

    // Start immediately
    this.el.setAttribute("data-sakura-anim-id", window.requestAnimationFrame(this.createPetal).toString());
  }

  start() {
    if (this.el.dataset.sakuraAnimId) {
      throw new Error("Sakura is already running.");
    }
    this.el.setAttribute("data-sakura-anim-id", window.requestAnimationFrame(this.createPetal).toString());
  }

  stop(graceful = false) {
    const animId = this.el.dataset.sakuraAnimId;
    if (animId) {
      window.cancelAnimationFrame(Number(animId));
      this.el.setAttribute("data-sakura-anim-id", "");
    }
    if (!graceful) {
      setTimeout(() => {
        const petals = document.getElementsByClassName(this.settings.className);
        while (petals.length > 0) {
          const node = petals[0];
          node.parentNode?.removeChild(node);
        }
      }, this.settings.delay + 50);
    }
    if (this.lifeTimer) {
      window.clearInterval(this.lifeTimer);
    }
  }
}
