 const http = require('http');

const server = http.createServer(function(req,res){
	res.write("ON the way to being a full stack engineer");
	res.end();
}

)

server.listen(3000)

console.log("Server started on port 3000");
