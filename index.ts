// Import stylesheets
import './style.css';
import { calc, vector } from '@js-basics/vector';

const appDiv = document.querySelector('#app');
const personDiv: HTMLElement = document.querySelector('.person');

const clickSeries: HTMLElement[] = [];

const onClickHandler = async (ev: Event): Promise<void> => {
  const target = ev.target as HTMLElement;
  clickSeries.push(target);
  !animationInProgress && (await applyAnimation());
};

const applyAnimation = async (): Promise<void> => {
  const target = clickSeries.shift();
  if (target?.classList.contains('dot')) {
    finalPosition = vector(JSON.parse(target.dataset.vec));
    target?.classList.toggle('dot-active');
    await animationProcedure({ draw, timing });
    startPosition = finalPosition;
    target?.classList.toggle('dot-active');
    if (clickSeries.length > 0) {
      await applyAnimation();
    }
  }
};

appDiv.addEventListener('click', onClickHandler);

function makeEaseInOut(timing: (number) => number): (number) => number {
  return function (timeFraction: number) {
    if (timeFraction < 0.5) return timing(2 * timeFraction) / 2;
    else return (2 - timing(2 * (1 - timeFraction))) / 2;
  };
}

const checkpoints = [
  vector(10, 10),
  vector(40, 65),
  vector(180, 135),
  vector(120, 265),
  vector(320, 225),
  vector(320, 45),
  vector(10, 10),
] as Vector[];

checkpoints.forEach((point: Vector, index) => {
  const p: HTMLDivElement = document.createElement('div');
  p.className = 'dot';
  p.id = '#dot' + (index + 1);
  p.style.transform = `translate(${point.x}px, ${point.y}px)`;
  p.dataset.vec = point;
  appDiv.appendChild(p);
});

/*
lerp function
a - start vector
b - end vector
t - %
*/

export type Vector = ReturnType<typeof vector>;

const lerp = (a: Vector, b: Vector, t: number) => calc(() => a + (b - a) * t);

let [startPosition, finalPosition] = checkpoints as Vector[];

const timing = (delta: number) => {
  for (let a = 0, b = 1; 1; a += b, b /= 2) {
    if (delta >= (7 - 4 * a) / 11) {
      return -Math.pow((11 - 6 * a - 11 * delta) / 4, 2) + Math.pow(b, 2);
    }
  }
};

const draw = (progress) => {
  const WIDTH_OFFSET = 5;
  const pos = lerp(startPosition, finalPosition, progress);
  personDiv.style.transform = `translate(${pos.x - WIDTH_OFFSET}px, ${
    pos.y - WIDTH_OFFSET
  }px)`;
};

const colors = [];
let animationInProgress = false;

const animationProcedure = ({ timing, draw, duration = 2000 }) => {
  return new Promise((resolve: any) => {
    let start = performance.now();
    animationInProgress = true;

    window.requestAnimationFrame(function animate(dt) {
      let timeFraction = (dt - start) / duration;

      if (timeFraction > 1) {
        timeFraction = 1;
        animationInProgress = false;
        return resolve();
      }

      let progress = makeEaseInOut(timing)(timeFraction);

      draw(progress);

      if (timeFraction < 1) {
        requestAnimationFrame(animate);
      }
    });
  });
};

const pause = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

async function go() {
  await pause(1500);
  while (checkpoints.length > 1) {
    const [a, b] = checkpoints;
    startPosition = a;
    finalPosition = b;
    await animationProcedure({ timing, draw });
    await pause();
    checkpoints.shift();
  }
}

// go().then(() => console.log('FINISHED!'));
