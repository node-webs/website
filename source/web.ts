import path from 'path';
import nunjucks from 'nunjucks';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';

// npm i express express-session express-validator cookie-parser nunjucks
// npm i -D @types/express @types/express-session @types/node ts-node typescript nodemon @types/cookie-parsernp @types/nunjucks

import webRouter from './webpage/zoo.router';

// [ Express ]
const app: Express = express();
app.set("port", process.env.PORT || 3000);

// [ Nunjucks ]
app.engine('web', nunjucks.render);
app.set("view engine", "web");
const env = nunjucks.configure(path.join(process.cwd(), "nunjucks"), {
    express: app, autoescape: true,
    watch: process.env.NODE_ENV !== 'production', // 🌟 프로덕션 환경 성능을 위해 watch 옵션 제어
    // __dirname: 현재 파일(index.ts 등)이 위치한 폴더 기준
    // process.cwd(): 노드 프로세스가 실행된 루트 폴더(package.json이 있는 곳) 
});

// app.use(cors({
//     // 다른 도메인에서 API 요청 허용
//     origin: ['http://localhost:3000', 'http://localhost:8080'],
//     methods: ['GET', 'POST'], // 허용할 HTTP 메서드
//     allowedHeaders: ['Content-Type', 'Authorization'], // 특정 헤더만 허용
//     credentials: true, // 쿠키와 같은 자격 증명 허용
// }));

// [ 정적파일 ]
app.use(express.static(path.join(process.cwd(), "public")));
// 🌟 [정적 파일 미들웨어 추가 추천] Nunjucks 화면용 CSS, JS를 서빙하기 위한 공간
app.use("/script", express.static(path.join(process.cwd(), "nunjucks", "scripts")));

// [ 데이터 파싱 ]
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// [ 쿠키 서명에 사용할 비밀 키, 서명된 쿠키 사용 시 필요 ]
app.use(cookieParser(process.env.COOKIE_SECRET));

// [ 세션 설정 ]
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET || 'your-secret-key',
    cookie: { 
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production', // 🌟 HTTPS 적용 시 true로 자동 전환되도록 최적화
        maxAge: 1000 * 60 * 60   // 1시간 유지
    }
}));

app.use('/', webRouter);

app.listen(app.get('port'), () => {
    console.log(`http://localhost:${app.get('port')}`);
});