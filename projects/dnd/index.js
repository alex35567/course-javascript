/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
import './dnd.html';

const homeworkContainer = document.querySelector('#app');

document.addEventListener('mousemove', (e) => {});

function randomInt(min, max) {
  return Math.random() * (max - min) + min;
}
const min_top = 50;
const min_left = 0;

const max_width = 100;
const max_height = 100;
const min_width = 20;
const min_height = 20;

const max_width_displ = 700;
const max_height_displ = 500;

export function createDiv() {
  const w = randomInt(min_width, max_width);
  const h = randomInt(min_height, max_height);
  const l = Math.max(randomInt(0, max_width_displ) - w, min_left);
  const t = Math.max(randomInt(0, max_height_displ) - h, min_top);

  const elem = document.createElement('div');
  elem.style.position = 'absolute';
  elem.style.width = `${w}px`;
  elem.style.height = `${h}px`;
  elem.style.top = `${t}px`;
  elem.style.left = `${l}px`;
  elem.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  elem.style.cursor = 'move';
  elem.classList.add('draggable-div');
  // elem.setAttribute('draggable', true);
  return elem;
}

const addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function () {
  const div = createDiv();
  homeworkContainer.appendChild(div);
});
let shiftX;
let shiftY;
homeworkContainer.addEventListener('dragstart', (e) => {
  e.target.style.opacity = '0.5';
  shiftX = e.offsetX;
  shiftY = e.offsetY;
  // e.dataTransfer.effectAllowed='move';
});

homeworkContainer.addEventListener('dragend', (e) => {
  e.target.style.opacity = '1';
  const dropY = e.clientY - shiftY;
  const dropX = e.clientX - shiftX;

  const x = Math.max(dropX, min_left);
  const y = Math.max(dropY, min_top);

  e.target.style.top = `${y}px`;
  e.target.style.left = `${x}px`;
});
