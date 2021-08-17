import express from 'express';
import db from './mongodb/db.js';
import config from 'config-lite';
import router from './routes/index.js';
import cookieParser from 'cookie-parser'
import session from 'express-session';
import connectMongo from 'connect-mongo';
import path from 'path';
import history from 'connect-history-api-fallback';
import chalk from 'chalk';
import bodyParser from 'body-parser';
const fs = require("fs");
// import Statistic from './middlewares/statistic'

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
var redis = require("redis");  
var client = redis.createClient(6379, "127.0.0.1");  
var http=require('http');
//excel导出文件存放位置， 不存在则创建
fs.exists(config.device_dir, function(exists) {
    console.log(exists ? "设备excel目录存在" : "设备excel目录不存在", config.device_dir);
    if (!exists) fs.mkdirSync(config.device_dir);
});
fs.exists(config.client_dir, function(exists) {
    console.log(exists ? "客户excel目录存在" : "客户excel目录不存在", config.client_dir);
    if (!exists) fs.mkdirSync(config.client_dir);
});

const app = express();

app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.headers.Origin || req.headers.origin || '*');
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("Access-Control-Allow-Credentials", true); //可以带cookies
	res.header("X-Powered-By", '3.2.1')
	if (req.method == 'OPTIONS') {
		res.send(200);
	} else {
		next();
	}
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(Statistic.apiRecord)
const MongoStore = connectMongo(session);
app.use(cookieParser());
console.log(JSON.stringify(config));
app.use(session({
	secret: config.session.secret,
	name: config.session.name,
	resave: true,
	saveUninitialized: false,
	cookie: config.session.cookie,
	store: new MongoStore({
		url: config.mongoUrl
	})
}));

// app.use(expressWinston.logger({
//     transports: [
//         new (winston.transports.Console)({
//           json: true,
//           colorize: true
//         }),
//         new winston.transports.File({
//           filename: 'logs/success.log'
//         })
//     ]
// }));

router(app);

// app.use(expressWinston.errorLogger({
//     transports: [
//         new winston.transports.Console({
//           json: true,
//           colorize: true
//         }),
//         new winston.transports.File({
//           filename: 'logs/error.log'
//         })
//     ]
// }));

app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

app.use(history());
app.use(express.static('./public'));
app.use(express.static(path.join(__dirname,'./public/dist')))
app.get('*',function(req,res){
        const html = fs.readFileSync(path.resolve(__dirname,'./public/dist/index.html'),'utf8');
        res.send(html);
});

if (cluster.isMaster) {
    console.log(`主进程 ${process.pid} 正在运行`);
    subscribeRedisData();
    // 衍生工作进程。
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`工作进程 ${worker.process.pid} 已退出`);
    });
} else {
    app.listen(config.port,'0.0.0.0', () => {
        console.log(
            chalk.green(`成功监听端口：${config.port}`)
        )
    });
    console.log(`工作进程 ${process.pid} 已启动`);
}

function sendoffline(gwid){
    var port=config.port
    http.get('http://localhost:'+port+'/wifidog/offline/?gw_id='+gwid,function(req,res){
	    var html='';
	    req.on('data',function(data){
		    html += data;
	    });
        
	    req.on('end',function(){
		    console.info(html);
	    });
    });
}

function subscribeRedisData() {   
    client.on("message", function (channel, message) {
        //console.log("expired:" + message);
        sendoffline(message);
    });
}
