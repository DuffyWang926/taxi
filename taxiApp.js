const Koa = require('koa')
const app = new Koa();
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const controller = require('./controller');
const cors = require('koa2-cors')


app.use(cors());
app.use(
  cors({
    origin: 'http://172.19.16.1:10086',
    credentials: true,
  })
);
app.use(bodyParser({
    enableTypes:['json', 'form', 'text'],
    encode: "utf-8"
  }));
app.use(controller());
app.listen(3001);
console.log('app started at port 3001...');
