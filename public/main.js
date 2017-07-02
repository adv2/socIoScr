var port = 3000; // Указываем порт на котором у на стоит сокет
var socket = io.connect('http://195.81.27.106:' + port); // Тут мы объявляем "socket" (дальше мы будем с ним работать) и подключаемся сразу к серверу через порт

// Теперь создаём в «main.js» прослушки на 'newUser', 'userName' 
socket.on('userName', function(userName){ // Создаем прослушку 'userName' и принимаем переменную name в виде аргумента 'userName'
console.log('You\'r username is => ' + userName); // Логгирование в консоль браузера
$('textarea').val($('textarea').val() + 'You\'r username => ' + userName + '\n'); // Выводим в поле для текста оповещение для подключенного с его ником
});


// inform new user about LastConvertedList
socket.on('newUserUpdate', function(updateKey){ // Думаю тут понятно уже =)
console.log('NewUser lastConvertedList creation | ' + updateKey); // Логгирование
$('div.lastConvertedListHead').replaceWith('<div class="lastConvertedListHead"><h4>Последние конвертированные файлы:</h4></div>');
$('div.lastConvertedList').replaceWith(updateKey);  // Это событие было отправлено новому пользователю.

});

// inform new user about LastConvertedList
socket.on('newUserErase', function(updateKey){ // Думаю тут понятно уже =)
console.log('NewUser erase lastConvertedList | ' + updateKey); // Логгирование
$('div.lastConvertedListHead').replaceWith('<div class="lastConvertedListHead"></div>');
$('div.lastConvertedList').replaceWith('<div class="lastConvertedList"></div>');  // Это событие было отправлено новому пользователю.

});

// // inform all about new User
// socket.on('newUser', function(userName){ // Думаю тут понятно уже =)
// console.log('New user has been connected to chat | ' + userName); // Логгирование
// $('textarea').val($('textarea').val() + userName + ' connected!\n'); // Это событие было отправлено всем кроме только подключенного, по этому мы пишем другим юзерам в поле что 'подключен новый юзер' с его ником
// });

// inform all about new item in LastConvertedList
socket.on('newItem', function(itemName){ // Думаю тут понятно уже =)
console.log('New item is added to lastConvertedList | ' + itemName); // Логгирование
$('div.lastConvertedListHead').replaceWith('<div class="lastConvertedListHead"><h4>Последние конвертированные файлы:</h4></div>');
$('div.lastConvertedList').prepend(itemName); // Это событие было отправлено всем.
});

socket.on('privateMessage', function(privateMsg){ // Создаем прослушку 'privateMessage' и принимаем переменную name в виде аргумента 'userName'
console.log('Private msg is sent | ' + privateMsg); // Логгирование
$('textarea').val(privateMsg + '\n'); // Это событие было отправлено только данному юзеру
});

socket.on('linkToLoad', function(fileUrl){ // Создаем прослушку 'privateMessage' и принимаем переменную name в виде аргумента 'userName'
console.log('div is updated | ' + fileUrl); // Логгирование
//$('div').append(fileUrl); // Это событие было отправлено только данному юзеру

$('div.privateHead').replaceWith('<div class="privateHead"><h4>Ваши MP3 файлы:</h4></div>');
$('div.privateLinks').prepend(fileUrl); // Это событие было отправлено только данному юзеру

//document.body.appendChild(div);

});

// ---------------------------------------------------

// Теперь нам надо сделать так, чтобы при нажатии на кнопку «Отправить» <= index.html отправлялся текст на сервер. Для этого дописываем в «main.js» обработчик на кнопку 'button' через jQuery.

// // Вариант только с кликом:
// $(document).on('click', 'button', function(){ // Прослушка кнопки на клик
// var message = $('input').val(); // Все что в поле для ввода записываем в переменную
// socket.emit('message', message); // Отправляем событие 'message' на сервер c самим текстом (message)- как переменная
// $('input').val(null); // Заполняем поле для ввода 'пустотой'
// });


// Click or Enter
function myFunction(e){
  if (e.which=='13' || e.type=='click'){
    var message = $('input').val(); // Все что в поле для ввода записываем в переменную
	socket.emit('message', message); // Отправляем событие 'message' на сервер c самим текстом (message)- как переменная
	$('input').val(null); // Заполняем поле для ввода 'пустотой'
  }
}

$(document)
  .on('click', 'button', myFunction)
  .on('keypress', 'input', myFunction);


// ---------------------------------------------------

// Теперь когда мы будем отправлять текст со страницы, он у нас будет логгироваться в консоли node, так же мы всем клиентам отправили событие 'messageToClients', сейчас мы будем на клиенте делать обработчик этого события…

socket.on('messageToClients', function(msg, name){
console.log(name + ' | => ' + msg); // Логгирование в консоль браузера
$('textarea').val($('textarea').val() + name + ' : '+ msg +'\n'); // Добавляем в поле для текста сообщение типа (Ник : текст)
});

// ---------------------------------------------------