import express from 'express';
import cors from 'cors';
import router from './route.js';
import { cronJob } from './scheduling.js';

const server = express();

server.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}));

server.use('/stock', router)

cronJob();

server.listen(8080, () => {
    console.log(`server started on  port http://127.0.0.1:8080`);
})

