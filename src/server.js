const createApp = require('./app'); 

const transactionRouter = require('./routes/transactionRoutes');
const userRouter = require('./routes/userRoutes');
const { hookRouter } = require('./routes/webhookRoute');




const app = createApp([ userRouter, transactionRouter, hookRouter ]);

app.listen();
