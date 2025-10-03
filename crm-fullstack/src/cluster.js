 const cluster = require("cluster");
const os = require("os");

const numCPUs = process.env.WEB_CONCURRENCY
  ? parseInt(process.env.WEB_CONCURRENCY, 10)
  : os.cpus().length;

if (cluster.isPrimary) {
  console.log(`🚀 Master ${process.pid} is running`);
  console.log(`⚡ Starting ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`❌ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  require("./server"); // each worker runs server.js
}
