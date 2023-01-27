/*
 Страница должна предварительно загрузить список городов из
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 и отсортировать в алфавитном порядке.

 При вводе в текстовое поле, под ним должен появляться список тех городов,
 в названии которых, хотя бы частично, есть введенное значение.
 Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.

 Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 После окончания загрузки городов, надпись исчезает и появляется текстовое поле.

 Разметку смотрите в файле towns.html

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер

 *** Часть со звездочкой ***
 Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 При клике на кнопку, процесс загрузки повторяется заново
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */

import './towns.html';

const homeworkContainer = document.querySelector('#app');

/*
 Функция должна вернуть Promise, который должен быть разрешен с массивом городов в качестве значения

 Массив городов пожно получить отправив асинхронный запрос по адресу
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 */

async function loadTowns() {
  const link = 'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json';
  let result;
  const response = await fetch(link);
  if (response.ok) {
    result = await response.json();
  } else {
    throw 'fetch-error';
  }
  return await new Promise((resolve) => {
    resolve(result.sort((a, b) => (a.name > b.name ? 1 : -1)));
  });
}

/*
 Функция должна проверять встречается ли подстрока chunk в строке full
 Проверка должна происходить без учета регистра символов

 Пример:
   isMatching('Moscow', 'moscow') // true
   isMatching('Moscow', 'mosc') // true
   isMatching('Moscow', 'cow') // true
   isMatching('Moscow', 'SCO') // true
   isMatching('Moscow', 'Moscov') // false
 */
function isMatching(full, chunk) {
  return chunk !== '' ? full.toLowerCase().includes(chunk) : false;
}

/* Блок с надписью "Загрузка" */
const loadingBlock = homeworkContainer.querySelector('#loading-block');
/* Блок с надписью "Не удалось загрузить города" и кнопкой "Повторить" */
const loadingFailedBlock = homeworkContainer.querySelector('#loading-failed');
/* Кнопка "Повторить" */
const retryButton = homeworkContainer.querySelector('#retry-button');
/* Блок с текстовым полем и результатом поиска */
// const filterBlock = homeworkContainer.querySelector('#filter-block');
/* Текстовое поле для поиска по городам */
const filterInput = homeworkContainer.querySelector('#filter-input');
/* Блок с результатами поиска */
const filterResult = homeworkContainer.querySelector('#filter-result');

let towns = [];

retryButton.addEventListener('click', () => {
  ld();
});

filterInput.addEventListener('input', function (e) {
  const filteredTown = towns.filter((val) => {
    return isMatching(val.name, e.target.value);
  });

  filterResult.innerHTML = filteredTown.reduce((res, obj) => {
    return res + obj.name + '<br>';
  }, '');
});

function ld() {
  loadingFailedBlock.style.display = 'none';
  retryButton.style.display = 'none';
  loadingBlock.style.display = 'block';
  loadTowns()
    .then((t) => {
      towns = t;
      loadingBlock.style.display = 'none';
    })
    .catch((e) => {
      console.log(e.message);
      loadingBlock.style.display = 'none';
      loadingFailedBlock.style.display = 'block';
      retryButton.style.display = 'block';
    });
}

ld();

export { loadTowns, isMatching };
