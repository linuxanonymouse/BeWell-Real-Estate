const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');

async function run() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log(`\n=========================================\n🚀 In-memory MongoDB started at ${uri}\n=========================================\n`);

  process.env.MONGO_URI = uri;
  process.env.PORT = '3001';

  const nestProcess = spawn('npm.cmd', ['run', 'start'], { stdio: 'inherit', shell: true });
  
  nestProcess.on('exit', code => {
    console.log(`NestJS process exited with code ${code}`);
    mongod.stop();
    process.exit(code);
  });
}

run().catch(console.error);
