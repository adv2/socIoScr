// Разработка простого чата на Socket.IO [2016] \ Node.js
// https://habrahabr.ru/post/307744/

var express = require('express'); // Подключаем express
var app = express();
var server = require('http').Server(app); // Подключаем http через app
var io = require('socket.io')(server); // Подключаем socket.io и указываем на сервер
var log4js = require('log4js'); // Подключаем наш логгер
var logger = log4js.getLogger(); // Подключаем из модуля log4js сам логгер
var spawn = require('child_process').spawn; // Подключаем spawn для запуска внешних скриптов
var fs = require("fs"); // working with files: delete 


function encodeValueChars (str) {
	return (str + '').
		replace(/[\'\"\`\“\”\-$\^*()+\[\]{}|\\,.?\s]/g, '\$&');
}

function deleteFile (file) {
	var fileToDelete = encodeValueChars (file); 
	fs.exists(fileToDelete, function(exists) {
	  if(exists) {
		fs.unlink(fileToDelete);
		logger.warn("This file is deleted: " +  fileToDelete);
	  } else {
		logger.warn("This file does not exist: " +  fileToDelete);
	  }
	});
};



var port = 3000; // Можно любой другой порт

logger.debug('Script has been started...'); // Логгируем.

server.listen(port); // Теперь мы можем подключиться к нашему серверу через localhost:3000 при запущенном скрипте

app.use(express.static(__dirname + '/public')); // Отправляет "статические" файлы из папки public при коннекте // __dirname - путь по которому лежит chat.js


var listLastLoads = [];
for (var i = 0; i < 29; i++) {
		listLastLoads[i] = '';
	}


// Создаём обработчик в скрипте on server 
io.on('connection', function (socket) {
	var name = 'U' + (socket.id).toString().substr(1,4);
	//socket.broadcast.emit('newUser', name);
	logger.info(name + ' connected to chat!'); 
	//socket.emit('userName', name);
	
	const 
		msgWelcome = 'Добро пожаловать!'
		msgAbout = 'Хотите конвертировать YouTube ролики в MP3 файлы и скачать их.'
		msgHowToUse = 'Хотите получить MP3 копию ролика с YouTube?! Скопируйте URL-адрес YouTube ролика в форму внизу и нажмите кнопку "Отправить".'
		msgWrongUrlFormat = 'Неверный формат URL-адреса. Попробуйте еще раз. Скопируйте URL-адрес YouTube ролика в форму внизу и нажмите кнопку "Отправить".'
		msgUrlAccepted = 'Начинаем работать с '
		msgDownConvert = 'Ждите... Скачивание и конвертация могут занять несколько минут: '
		msgFileIsReady = 'Поздравляем! Ваш MP3 файл готов. Ссылка должна появиться внизу. Хотите получить MP3 копию следующего ролика с YouTube?! Скопируйте URL-адрес YouTube ролика в форму внизу и нажмите кнопку "Отправить".'
		msgNoFilePageError = 'К сожалению запрашиваемый файл или страница не доступны. <a href="/">Попробуйте заново.</a>'
	;
	
	
	
	
	//socket.emit('privateMessage', msgWelcome);
	//socket.emit('privateMessage', msgAbout);
	socket.emit('privateMessage', msgHowToUse);
	
	// Add the listLastLoads
	var insert = '';
	for (var i=0; i<listLastLoads.length; i++){
		if (listLastLoads[i] != '') {
			var fileUrl = '/download/' + listLastLoads[i];
			var encoded_url = encodeURI(fileUrl);
			insert = insert + '<li><a href="'+ encoded_url +'">Скачать :: ' + listLastLoads[i] + '</a></li>'; 
			logger.warn('Current listLastLoads: ' + insert);
		}
		
	}
	if (insert != ''){
		logger.warn('Current listLastLoads: ' + insert);
		socket.emit('newUserUpdate', insert);
	}
			
	// Обработчик ниже // Мы его сделали внутри коннекта
	// обработчик события 'message' на самом сервере.
	socket.on('message', function(msg){ // Обработчик на событие 'message' и аргументом (msg) из переменной message
		logger.warn('-----------'); // Logging
		logger.warn('User: ' + name + ' | Message: ' + msg);
		//logger.warn('====> Sending message to other chaters...');
		//io.sockets.emit('messageToClients', msg, name); // Отправляем всем сокетам событие 'messageToClients' и отправляем туда же два аргумента (текст, имя юзера)
					
		var url = require("url");
		var parts = url.parse(msg, true);
		//parts.query.page++;
		//logger.warn(parts);
		if (parts.protocol == null) { 
			msg = "http://" + msg 
			parts = url.parse(msg, true);
			logger.warn("link updated with protocol: " + msg);
		}
		
		//logger.warn(parts.hostname);
		//logger.warn(parts.query.v != null);
		//delete parts.search;
		//console.log(url.format(parts));
		if ( // Check url 
				(  (parts.hostname == "www.youtube.com")
				|| (parts.hostname == "youtube.com")
				|| (parts.hostname == "www.youtu.be")
				|| (parts.hostname == "youtu.be")
				|| (parts.hostname == "www.m.youtube.com")
				|| (parts.hostname == "m.youtube.com")
				|| (parts.hostname == "www.m.youtu.be")
				|| (parts.hostname == "m.youtu.be")
				) 
			&& 
				(parts.query.v != null)
			) 
			{
			var fileName = 'non_defined'; // define url of file
			//socket.emit('privateMessage', "It's youtube links");
			socket.emit('privateMessage', msgUrlAccepted + parts.hostname + "/watch?v=" + parts.query.v);
			var generatedLink = parts.hostname + "/watch?v=" + parts.query.v ;
			logger.warn("Generated link: " + generatedLink);
			
			
			//const ls = spawn('nice', ['youtube-dl', '-e', linkToCheck, __dirname]);
			//console.log(__dirname);
			const spawn = require('child_process').spawn;
			//const ls = spawn('nice', ['ls', '-ls', __dirname]);
			var filesFolderName = '/public/files'
			var fullFileFolderName = __dirname + filesFolderName;
			console.log(filesFolderName);
			const ls = spawn('nice', ['sh', 'youtube-dl-runner.sh', generatedLink], {cwd: fullFileFolderName});
			ls.stdout.on('data', (data) => {
			  console.log(`stdout: ${data}`);
			  var str = data.toString();
			  regex = /\[ffmpeg\] Destination: (.*\.mp3)/
			  if (str.match(regex)) {
				console.log('file NAME: '+ fileName );
				console.log('file NAME: '+ str.match(regex)[0] );
				console.log('file NAME: '+ str.match(regex)[1] );
				fileName = str.match(regex)[1];
				}
			  socket.emit('privateMessage', msgDownConvert + str);
			  //res.write(str + "\n");
			});
			
			ls.stderr.on('data', (data) => {
				console.log(`stderr: ${data}`); 
			});
			
			ls.on('close', (code) => {
				console.log(`child process exited with code ${code}`);
				socket.emit('privateMessage', msgFileIsReady);
				var fileUrl = '/download/' + fileName;
				var encoded_url = encodeURI(fileUrl);
				console.log("encoded_url: " + encoded_url);
				socket.emit('linkToLoad', '<li><a href="'+ encoded_url +'">Скачать :: ' + fileName + '</a></li>');
				
				var uniqueItem = 1;
				var myItem = fileName;
				for (var i=0; i<listLastLoads.length; i++){
					if (listLastLoads[i] == myItem) {uniqueItem = 0};
				}
				if (uniqueItem == 1) {
					io.sockets.emit('newItem', '<li><a href="'+ encoded_url +'">Скачать :: ' + fileName + '</a></li>'); //update all current users with myItem
					listLastLoads.unshift(myItem); // add new element in listLastLoads
					var fileToDelete = listLastLoads.pop(); // remove last element in listLastLoads
					
					if (fileToDelete != ''){
						deleteFile (__dirname +'/public/files/'+ encodeValueChars(fileToDelete));
					}
					//const lastFileRemove = spawn('nice', ['rm', lastFileName], {cwd: fullFileFolderName});
					//ls -tr /files/*.mp3 | head -n -5 | xargs rm -r
				}
				
				
			});
			
			//socket.emit('privateMessage', 'dowload in progress');
			//socket.emit('privateMessage', 'converting in progress');
			//socket.emit('privateMessage', 'mp3 file is ready');
			
		}
		else {
			logger.warn("Failed link: " + msg);
			socket.emit('privateMessage', msgWrongUrlFormat);
		}
		
	});
}); 

// handle /download/ folder files
app.get('/download/:file(*)', function(req, res, next){
  var file = req.params.file
	, path = __dirname + '/public/files/' + file;
  res.download(path);
});


// error handling middleware. Because it's
// below our routes, you will be able to
// "intercept" errors, otherwise Connect
// will respond with 500 "Internal Server Error".
app.use(function(err, req, res, next){
  // special-case 404s,
  // remember you could
  // render a 404 template here
  if (404 == err.status) {
    res.statusCode = 404; 
    //res.send(msgNoFilePageError);
	res.sendfile('fileNotFound.html',{root: __dirname + '/public'});
  } else {
    next(err);
  }
});
