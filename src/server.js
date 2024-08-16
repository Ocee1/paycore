const createApp = require('./app'); 

const transactionRouter = require('./routes/transactionRoutes');
const userRouter = require('./routes/userRoutes');



const app = createApp([ userRouter, transactionRouter ]);

app.listen();
