const PORT = 8080 //Using port 8080 by default (change this)
//{{{ Imports
var WebSocketServer = require('websocket').server;
var http = require('http');
//}}} 

// {{{  Creating the server
var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(PORT, function() { });

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});
//}}} 
//List of tasks
let X = ["Task 1", "Task 2"]
//list of (connected) clients
let clients = []
// WebSocket server
wsServer.on('request', function(request) {

    /* Description of the protocol : 
    The client can send : 
    {type : "ADD", value: "the task"} -> we add the task "the task" to X (server variable)
    {type : "DEL", value : index} -> we del the index-th task from X (server variable)

    The server can send : 
    {type : "DVL", value : some_list } -> sends to the clients the updated list (runs whenever a client hits the server
                                          with a ADD or a DEL command).
    */

    var connection = request.accept(null, request.origin);
    // Adds the client to the list of clients, if it isn't already present
    clients.indexOf(connection) === -1 ? clients.push(connection) : console.log();
    connection.sendUTF( JSON.stringify( {type: "DLV" , value: X} ) ) //When the client connects, we send the task list

    connection.on('message', function(message) {
      if (message.type === 'utf8') {

          let message_from_client=JSON.parse(message.utf8Data);

          if (message_from_client.type === "ADD"){
              X.push(message_from_client.value)

          } else if (message_from_client.type === "DEL") {
              X.splice(message_from_client.value,1);
          }
          
          // Sends the update to all connected clients
          for (let j = 0 ; j < clients.length ; j ++){
              clients[j].sendUTF(JSON.stringify( { type:"DLV" , value : X } ))
          }
      }
    });

    //Removes the disconnected client from the list of connected clients
    connection.on('close', function(connection) {
      clients.splice(clients.indexOf(connection),1);
    });
});
