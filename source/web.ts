import path from 'path';
import nunjucks from 'nunjucks';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';

import './module/env/dot.env';
import webRouter from './webpage/zoo.router';

// [ Express ]
const app: Express = express();
app.set("port", process.env.PORT || 3000);

// [ Nunjucks ]
app.engine('pet', nunjucks.render);
app.set("view engine", "pet");
const env = nunjucks.configure(path.join(process.cwd(), "nunjucks"), {
    express: app, autoescape: true,
    watch: process.env.NODE_ENV !== 'web'
});

// [ Passport 전략 사전 초기화 ]
// passportConfig();

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

// [ Passport ]
app.use(passport.initialize()); // req 객체에 passport 설정을 초기화
app.use(passport.session()); // req.session 객체에 저장된 정보를 바탕으로 passport.deserializeUser를 호출하여 req.user를 생성

app.use('/', webRouter);

app.listen(app.get('port'), () => {
    console.log(`http://localhost:${app.get('port')}`);
});