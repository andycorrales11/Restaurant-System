import * as http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, world!");
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001/");
});