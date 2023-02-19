const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4040 }, () => {
  console.log('Server started...');
});

const clients = new Map();

function addClient(wsc, name, data, online, img) {
  for (const client of clients.keys()) {
    if (clients.get(client).name === name)
      if (!clients.get(client).online) {
        clients.get(client).online = true; //пользователь есть в базе
        return true;
      } else return false;
  }

  if (!clients.has(wsc)) {
    clients.set(wsc, { name, data, online, img });
    return true;
  }
  return false;
}

wss.on('connection', (wsc) => {
  console.log('CONNECT');
  // clients.add({
  //     wsc,
  //     name:'no login',
  //     lastMes:''
  // });

  wsc.on('close', (e) => {
    if (clients.has(wsc)) {
      clients.get(wsc).online = false;
      console.log(clients.get(wsc).online);
    }
  });

  wsc.on('message', (mes) => {
    const req = JSON.parse(mes.toString());
    console.log('on_message');
    console.log(req);

    if (req.event === 'login') {
      //если новый клиент то добавляем его в базу
      if (!addClient(wsc, req.name, req.data, true, req.img)) {
        //авторизация отклонена
        const rej = {
          event: 'relogin',
          name: '',
          data: 'Такое имя уже используется! Выберите другое.',
          img: null,
        };
        wsc.send(JSON.stringify(rej));
        return;
      }
    }

    if (req.event === 'login') {
      for (const client of clients.keys()) {
        if (client !== wsc && clients.get(client).online) {
          const inv = {
            event: 'login',
            name: clients.get(client).name,
            data: clients.get(client).data,
            img: clients.get(client).img,
          };
          //отправляем аватары с последним сообщением всех клиентов вновь залогининому - заполняем левую панель
          wsc.send(JSON.stringify(inv));
        }
      }
    }

    if (req.event === 'avatar') {
      //сохраняем изображение в базе
      clients.get(wsc).img = req.img;
    }

    // отправляем всем сообщение, при логине если клиент только залогинился то ему прилетает он сам первым в левую панель
    for (const client of clients.keys()) {
      if (clients.get(client).online) client.send(mes.toString());
    }

    if (req.event === 'exit') {
      // if (Object.prototype.hasOwnProperty.call(online, 'gclients.get(wsc)'))
      if (clients.has(wsc)) {
        clients.get(wsc).online = false;
        console.log(clients.get(wsc).online);
      }
    }
  });
});
