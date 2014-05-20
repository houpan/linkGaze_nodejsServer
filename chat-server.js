// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 25566;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * Global variables
 */
// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];

/**
 * Helper function for escaping input strings
 */
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {
    // Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

var isMobileConnected = false;
var isGlassConnected = false;
var isEyeTrackerConnected = false;
var isWebControllerConnected = false;


// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
	
	//此處的receiver可為"broadcast"，這時候所有人都要對這個訊息做處理
	function broadcastMessage(receiver_, action_, data_){
        for (var i=0; i < clients.length; i++) {
            clients[i].sendUTF(JSON.stringify({ receiver : receiver_, action: action_, data: data_ }));
        }
	}

    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin); 
    
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;
    
    
    var connecterType = false;

    console.log((new Date()) + ' Connection accepted.');

    // send back chat history
    if (history.length > 0) {
        connection.sendUTF(JSON.stringify( { type: 'history', data: history} ));
    }

    // user sent some message
    connection.on('message', function(message) {	
        console.log("-------Msg Inbound------");
        console.log(JSON.parse(message.utf8Data).sender);
        console.log(JSON.parse(message.utf8Data).action);
        console.log(JSON.parse(message.utf8Data).data);
        console.log("------------------------");
/*         connection.sendUTF(JSON.stringify({ type:'color', data: userColor })); */
        
        if(JSON.parse(message.utf8Data).action == "handshake"){
			broadcastMessage(JSON.parse(message.utf8Data).sender, "handshakeBack", "Connection was built");
        }else{
			if(JSON.parse(message.utf8Data).sender == "mobile"){
			//	
			}else if(JSON.parse(message.utf8Data).sender == "glass"){
			//
			}else if(JSON.parse(message.utf8Data).sender == "eyeTracker"){
				if(JSON.parse(message.utf8Data).action == "stateChange"){
					//看不同的地方。直接broadcast給所有人。
					broadcastMessage("broadcast", "stateChange", JSON.parse(message.utf8Data).data);
				}
			//
			}else if(JSON.parse(message.utf8Data).sender == "webController"){
			//
			}
		}
        
/*
        if (message.type === 'utf8') { // accept only text
            if (userName === false) { // first message sent by user is their name
                // remember user name
                userName = htmlEntities(message.utf8Data);
                // get random color and send it back to the user
                userColor = colors.shift();
                connection.sendUTF(JSON.stringify({ type:'color', data: userColor }));
                console.log((new Date()) + ' User is known as: ' + userName
                            + ' with ' + userColor + ' color.');

            } else { // log and broadcast the message
                console.log((new Date()) + ' Received Message from '
                            + userName + ': ' + message.utf8Data);
                
                // we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(message.utf8Data),
                    author: userName,
                    color: userColor
                };
                history.push(obj);
                history = history.slice(-100);

                // broadcast message to all connected clients
                var json = JSON.stringify({ type:'message', data: obj });
                for (var i=0; i < clients.length; i++) {
                    clients[i].sendUTF(json);
                }
            }
        }
*/
    });

    // user disconnected
    connection.on('close', function(connection) {
/*         if (userName !== false && userColor !== false) { */
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            // remove user from the list of connected clients
            clients.splice(index, 1);
/*
            // push back user's color to be reused by another user
            colors.push(userColor);
*/
/*         } */
    });

});