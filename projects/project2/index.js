import './index.html';
import './style/normalize.css';
import './style/base.css';
import './style/main.css';
import './style/auth.css';
import './style/modal.css';

import imgFoto from './img/foto.png';

import './script/hamburger.js';
import * as dlg from './script/modal.js';

const listUsers = document.querySelector('.control__users');
const btnSend = document.querySelector('#send_btn');
const inputMessage = document.querySelector('textarea[name="message"]');

export let currentName = '';
export function setCurrentName(name) {
  currentName = name;
}

let usersCount = 0;
let currentImg = imgFoto;
let flagNamePhrase = '';
let ws;
const socketServerURL = 'ws://localhost:4040';

//склонение числительных
function num_word(value, words) {
  //честно скопипастил
  value = Math.abs(value) % 100;
  const num = value % 10;
  if (value > 10 && value < 20) return words[2];
  if (num > 1 && num < 5) return words[1];
  if (num === 1) return words[0];
  return words[2];
}

export function connecting(userName) {
  ws = new WebSocket(socketServerURL);
  console.log('CONNECT');

  ws.onopen = (ev) => {
    sendLogin(userName);
    currentName = userName;
  };

  ws.onmessage = (resp) => {
    console.log(resp.data);
    const mes = JSON.parse(resp.data.toString());

    if (mes.event === 'login') {
      const newUser = document.createElement('li');
      newUser.classList.add('control__user');
      newUser.setAttribute('data-name', mes.name);
      let img = imgFoto;
      if (mes.img) img = mes.img;
      newUser.innerHTML = `
      <div class="control__u-pic">
        <img src="${img}" alt="Foto">
      </div>
      <div class="control__u-info">
          <h2 class="control__u-name">${mes.name}</h2>
          <p class="control__u-mes">${mes.data}</p>
      </div>`;
      listUsers.appendChild(newUser);
      usersCount++;
      const users = document.querySelector('.chat__header P');
      users.textContent =
        usersCount + ' ' + num_word(usersCount, ['участник', 'участника', 'участников']);
    }

    if (mes.event === 'exit') {
      const liUser = document.querySelector(`li[data-name="${mes.name}"]`);
      liUser.remove();
    }

    if (mes.event === 'relogin') {
      const wrap = document.querySelector('.wrapper');
      ws.close();
      dlg.modal(wrap);
    }

    if (mes.event === 'avatar') {
      const liUser = document.querySelectorAll(`li[data-mesName="${mes.name}"]`);
      for (let i = 0; i < liUser.length; i++) {
        liUser[i].querySelector('img').src = mes.img;
      }
      const controlUser = document.querySelector(`li[data-name="${mes.name}"]`);
      controlUser.querySelector('img').src = mes.img;
    }

    const chat = document.querySelector('.chat__body');

    if (mes.event === 'message') {
      const dateTime = new Date();
      const now = `${('0' + (dateTime.getHours() + 1)).slice(-2)}:${(
        '0' +
        (dateTime.getMinutes() + 1)
      ).slice(-2)}`;
      const innerListMes = `
      <li class="chat__phrase-list">
        <p>${mes.data}</p>
        <span>${now}</span>
      </li>`;
      //добавляем последнее сообщение
      const liUserMes = document.querySelector(
        `li[data-name="${mes.name}"] .control__u-info P`
      );
      liUserMes.textContent = mes.data;

      if (flagNamePhrase !== mes.name) {
        //нужен новый блок с фотографией
        const newMes = document.createElement('li');
        newMes.classList.add('chat__list');
        newMes.setAttribute('data-mesName', mes.name);
        let img = imgFoto;
        if (mes.img) img = mes.img;
        newMes.innerHTML = `
      <div class="chat__title">
        <h2 class="chat__name">${mes.name}</h2>
      </div>
      <div class="chat__mes">
        <div class="chat__pic">
          <img src="${img}" alt="Foto">
        </div>
        <ul class="chat__phrase">
            ${innerListMes}
        </ul>
      </div>`;
        chat.appendChild(newMes);
        if (mes.name !== currentName) {
          newMes.style = 'align-self: end';
        }
      } else {
        const chatPhrases = document.querySelectorAll('.chat__phrase');
        const chatPhrase = document.querySelectorAll('.chat__phrase')[
          chatPhrases.length - 1
        ];
        chatPhrase.innerHTML = chatPhrase.innerHTML + innerListMes;
      }
      // align-self: end;
      flagNamePhrase = mes.name; //запоминаем от кого было последнее сообщение, чтобы узнать нужно ли добавлять новый chat__list или вставлять в старый
    }
  };
}

export function sendLogin(name) {
  const request = {
    event: 'login',
    name,
    data: 'Зашел в чат',
    img: null,
  };
  ws.send(JSON.stringify(request));
  inputMessage.focus();
}

export function sendMessage(name, data, img) {
  const request = {
    event: 'message',
    name,
    data,
    img,
  };
  ws.send(JSON.stringify(request));
}

export function sendAvatar(name, img) {
  const request = {
    event: 'avatar',
    name,
    data: '',
    img,
  };
  ws.send(JSON.stringify(request));
}

export function sendExit(name) {
  const request = {
    event: 'exit',
    name,
    data: 'Покинул чат',
    img: null,
  };
  ws.send(JSON.stringify(request));
}

function getCurZone(from) {
  do {
    if (from.classList.contains('control__user')) {
      return from;
    }
  } while ((from = from.parentElement));
  return null;
}

document.addEventListener('drop', (e) => {
  e.preventDefault();
  const zone = getCurZone(e.target);
  // for(const file of e.dataTransfer.files){
  const reader = new FileReader();
  reader.readAsDataURL(e.dataTransfer.files[0]);
  reader.addEventListener('load', () => {
    zone.querySelector('img').src = reader.result;
    zone.classList.remove('dragover');

    const name = zone.getAttribute('data-name');
    const liUser = document.querySelectorAll(`li[data-mesName="${name}"]`);
    for (let i = 0; i < liUser.length; i++) {
      liUser[i].querySelector('img').src = reader.result;
    }
    //если изменили наше изображение, то нужно поменять текущее и сообщить серверу
    if (name === currentName) {
      currentImg = reader.result;
      sendAvatar(currentName, currentImg);
    }

    // const item = createItem(reader.result);
    // zone.insertBefore(item, zone.lastElementChild)
  });
  // }
});

document.addEventListener('dragenter', (e) => {
  const zone = getCurZone(e.target);
  if (zone) {
    zone.classList.add('dragover');
  }
});

document.addEventListener('dragover', (e) => {
  // prevent default to allow drop
  e.preventDefault();
});

document.addEventListener('dragleave', (e) => {
  const zone = getCurZone(e.target);
  if (zone) {
    zone.classList.remove('dragover');
  }
});

window.onbeforeunload = function () {
  sendExit(currentName);
};

btnSend.addEventListener('click', (e) => {
  sendMessage(currentName, inputMessage.value, currentImg);
  inputMessage.value = '';
  inputMessage.focus();
});
// connecting();

inputMessage.addEventListener('keydown', function (e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    btnSend.click();
  }
});
