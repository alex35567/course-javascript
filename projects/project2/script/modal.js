// debugger;
import * as wsc from '../index.js';
import imgAuth from './../img/auth.png';

modal(document.querySelector('.wrapper'));

export function modal(selector) {
  let overlay = null;
  let newItem = null;
  // const body=document.querySelector('body');

  overlay = document.createElement('div');
  selector.appendChild(overlay);

  overlay.classList.add('modal__overlay');

  // overlay.addEventListener('click', function (e) {
  //     if (e.target == overlay) {
  //         // body.style.overflow = 'scroll';
  //         overlay.remove();
  //     }
  // })

  newItem = document.createElement('div');
  // selector.appendChild(newItem);
  overlay.appendChild(newItem);

  newItem.innerHTML = `
    <div class="auth">
        <div class="auth__pic">
            <img src="${imgAuth}" alt="Enter">
        </div>
        <div class="auth__title">
            <h1>Авторизация</h1>
        </div>
        <div class="auth__welcome">
            <p>Введите пожалуйста свой ник для дальнейшей авторизации</p>
        </div>
        <div class="auth__form">
            <input type="text" name="name" placeholder="Введите свой ник" class="auth__input">
        </div>
        <button class="btn btn-auth">Войти</button>
    </div>"`;

  newItem.position = 'absolute';

  const left_modal =
    ((document.documentElement.clientWidth / 2 - newItem.offsetWidth / 2) /
      document.documentElement.clientWidth) *
    100;
  const top_modal =
    ((document.documentElement.clientHeight / 2 - newItem.offsetHeight / 2) /
      document.documentElement.clientHeight) *
    100;

  newItem.style.left = left_modal + '%';
  newItem.style.top = top_modal + '%';
  document.querySelector('input[name="name"]').focus();

  document.querySelector('.btn-auth').addEventListener('click', function (event) {
    event.preventDefault();
    const userName = document.querySelector('input[name="name"]').value;
    if (userName !== '') {
      wsc.connecting(userName);
      overlay.remove();
    }
  });

  document.querySelector('input[name="name"]').addEventListener('keyup', function (e) {
    e.preventDefault();
    if (e.keyCode === 13) {
      document.querySelector('.btn-auth').click();
    }
  });

  //блокировка прокрутки
  // body.style.overflow = 'hidden';
}
