import './index.html';
import './normalize.css';
import './base.css';
import './style.css';

//форма для отзыва

const inHtmlHeader = `<div class="map__ballun">` + ``;

const inHtml =
  `<h1 class="map__header">Отзыв:</h1>` +
  `<div class="map__form">` +
  `<input class="map__input" name="name" type="text" placeholder="Укажите ваше имя" class="map__input">` +
  `<input name="place" type="text" placeholder="Укажите место" class="map__input">` +
  `<textarea class="map__comment" name="reviwe" placeholder="Оставить отзыв"></textarea>` +
  `<button id="submit" type="submit" class="map__btn">Добавить</button>` +
  `</div>` +
  ``;

const inHtmlFooter = `</div>` + ``;

let myMap;
let coords;
let clusterer;
let arrReviwes;
let storage;
let idxPlacemark = 0;

function showBallunForm(coords) {
  let s = '';
  arrReviwes.forEach((el) => {
    s =
      s +
      `<li class="map__item">${el.name} <span class="map__reviwes-desc">${el.place} ${el.now} <br> ${el.comment}</span> </li>`;
  });
  const htmlList = `<ul class="map__reviwes">` + s + `</ul>`;
  myMap.balloon.open(coords, inHtmlHeader + htmlList + inHtml + inHtmlFooter, {
    maxHeight: '502px',
  });
  myMap.balloon.events.add('open', balloonOpenCB);
}

function showNewBallunForm(coords) {
  // myMap.balloon.options.set({maxHeight:501});
  myMap.balloon.open(coords, inHtmlHeader + inHtml + inHtmlFooter);
  myMap.balloon.events.add('open', balloonOpenCB);
}

function balloonOpenCB(e) {
  const btn = document.querySelector('#submit');

  //клик по кнопке добавить
  btn.addEventListener('click', (e) => {
    const name = document.querySelector('input[name="name"]').value;
    const place = document.querySelector('input[name="place"]').value;
    const comment = document.querySelector('textarea[name="reviwe"]').value;

    myMap.balloon.close();
    const gObj = new ymaps.Placemark([coords[0], coords[1]], {
      hintContent: `${place}`,
    });
    const dateTime = new Date();

    const now = `${('0' + (dateTime.getDate() + 1)).slice(-2)}.${(
      '0' +
      (dateTime.getMonth() + 1)
    ).slice(-2)}.${('0' + (dateTime.getFullYear() + 1)).slice(-2)}`;

    gObj['gPlaceMarkReviwes'] = { name, place, comment, now, coords };
    storage['geoPlacemark' + idxPlacemark] = JSON.stringify(gObj['gPlaceMarkReviwes']);
    idxPlacemark++;
    storage['geoPlacemarks'] = JSON.stringify(idxPlacemark);
    clusterer.add(gObj);
  });
}

const init = () => {
  myMap = new ymaps.Map(
    'map',
    {
      center: [59.764616, 60.192764],
      zoom: 15,
      controls: ['zoomControl'],
    },
    {
      yandexMapDisablePoiInteractivity: true,
    }
  );

  // клик по карте
  myMap.events.add('click', (e) => {
    coords = e.get('coords');
    myMap.balloon.events.remove('open', balloonOpenCB);
    myMap.balloon.close();
    showNewBallunForm(coords);
    e.preventDefault();
  });

  //клик по существующей метке
  myMap.geoObjects.events.add('click', function (e) {
    coords = e.get('coords');
    arrReviwes = [];
    if (e.get('target').options._name === 'geoObject') {
      arrReviwes.push(e.get('target').gPlaceMarkReviwes);
    } else {
      //собераем данные всех меток в кластере
      e.get('target')
        .getGeoObjects()
        .forEach((el) => {
          arrReviwes.push(el.gPlaceMarkReviwes);
        });
    }
    myMap.balloon.events.remove('open', balloonOpenCB);
    myMap.balloon.close();
    showBallunForm(coords);

    e.preventDefault();
  });
  clusterer = new ymaps.Clusterer({
    clusterDisableClickZoom: true,
    hasBalloon: false,
  });
  if (Object.prototype.hasOwnProperty.call(storage, 'geoPlacemarks')) {
    idxPlacemark = JSON.parse(storage['geoPlacemarks']);
    for (let i = 0; i < idxPlacemark; i++) {
      if (Object.prototype.hasOwnProperty.call(storage, 'geoPlacemark' + i)) {
        const geoProp = JSON.parse(storage['geoPlacemark' + i]);
        const gObj = new ymaps.Placemark([geoProp.coords[0], geoProp.coords[1]], {
          hintContent: `${geoProp.place}`,
        });
        gObj['gPlaceMarkReviwes'] = geoProp;
        clusterer.add(gObj);
      }
    }
  }

  myMap.geoObjects.add(clusterer);
};

document.addEventListener('DOMContentLoaded', (e) => {
  ymaps.ready(init);
  storage = localStorage;
});
