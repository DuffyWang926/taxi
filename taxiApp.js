const Koa = require('koa')
const app = new Koa();
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const controller = require('./controller');
const cors = require('koa2-cors')


// app.use(cors());

app.use(cors({
  origin: function(ctx) {
      if (ctx.url === '/test') {
          return false;
      }
      return ['http://172.19.16.1:10086', 'http://192.168.0.101:10086','http://192.168.0.108:10086','http://www.mengshikejiwang.top','http://mengshikejiwang.top', 'https://mengshikejiwang.top'].includes(ctx.request.header.origin) ? ctx.request.header.origin : false; 
  },
  credentials: true,
}));
app.use(bodyParser({
    enableTypes:['json', 'form', 'text'],
    encode: "utf-8"
  }));
app.use(controller());
app.listen(3001);
console.log('app started at port 3001...');
