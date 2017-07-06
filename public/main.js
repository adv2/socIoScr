var port = 3000; // Указываем порт на котором у на стоит сокет
//var socket = io.connect('http://195.81.27.106:' + port); // Тут мы объявляем "socket" (дальше мы будем с ним работать) и подключаемся сразу к серверу через порт
var socket = io.connect('http://ym.abookru.com'); // Тут мы объявляем "socket" 


socket.on('privateMessage', function(privateMsg){ // Создаем прослушку 'privateMessage' и принимаем переменную в виде аргумента 'privateMsg'
console.log('Private msg is sent | ' + privateMsg); // Логгирование
$('textarea').val(privateMsg + '\n'); // Это событие было отправлено только данному юзеру
});

socket.on('linkToLoad', function(fileUrl){ // Создаем прослушку 'linkToLoad' и принимаем переменную в виде аргумента 'fileUrl'
console.log('div.privateLinks is updated | ' + fileUrl); // Логгирование
$('div.privateHead').replaceWith('<div class="privateHead"><h4>Ваши MP3 файлы:</h4></div>');
$('div.privateLinks').prepend(fileUrl); // Это событие было отправлено только данному юзеру

//document.body.appendChild(div);

});


// inform new user about LastConvertedList 
socket.on('newUserUpdate', function(updateKey){ // Думаю тут понятно уже =)
console.log('NewUser lastConvertedList creation | ' + updateKey); // Логгирование
$('div.lastConvertedListHead').replaceWith('<div class="lastConvertedListHead"><h4>Последние конвертированные файлы:</h4></div>');
$('div.lastConvertedList').replaceWith('<div class="lastConvertedList">' + updateKey + '</div>');  // Это событие было отправлено новому пользователю.
});

// ---------------------------------------------------

// Теперь нам надо сделать так, чтобы при нажатии на кнопку «Отправить» <= index.html отправлялся текст на сервер. Для этого дописываем в «main.js» обработчик на кнопку 'button' через jQuery.

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

// Теперь когда мы будем отправлять текст со страницы, он у нас будет логгироваться в консоли node, так же мы всем клиентам отправили событие 'newItem', сейчас мы будем на клиенте делать обработчик этого события…

// inform all about new item in LastConvertedList
socket.on('newItem', function(itemName){ // Думаю тут понятно уже =)
console.log('New item is added to lastConvertedList | ' + itemName); // Логгирование
$('div.lastConvertedListHead').replaceWith('<div class="lastConvertedListHead"><h4>Последние конвертированные файлы:</h4></div>');
$('div.lastConvertedList').prepend(itemName); // Это событие было отправлено всем.
});

// ---------------------------------------------------