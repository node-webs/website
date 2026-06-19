import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const envMode: string = process.env.NODE_START || 'web';
const envPath: string = path.join(process.cwd(), 'nunjucks', '_data', `${envMode}x`);

const SECRET_KEY: string = process.env.NODE_START_VALUE!;
const ALGORITHM: string = 'aes-256-cbc';

try {
    if (!fs.existsSync(envPath)) {
        throw new Error(`암호화된 환경 변수 파일을 찾을 수 없습니다: ${envPath}`);
    }

    const encryptedData: string = fs.readFileSync(envPath, 'utf8');
    const [ivHex, encryptedText] = encryptedData.split(':');

    if (!ivHex || !encryptedText) {
        throw new Error("암호화 파일의 데이터 형식이 올바르지 않습니다.");
    }

    // 💡 타입을 crypto.Decipheriv 로 변경합니다.
    const decipher: crypto.Decipheriv = crypto.createDecipheriv(
        ALGORITHM, 
        Buffer.from(SECRET_KEY), 
        Buffer.from(ivHex, 'hex')
    );
    
    let decrypted: string = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    decrypted.split('\n').forEach((line: string) => {
        const trimmedLine: string = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;

        const delimiterIndex: number = trimmedLine.indexOf('=');
        if (delimiterIndex === -1) return;

        const key: string = trimmedLine.substring(0, delimiterIndex).trim();
        const value: string = trimmedLine.substring(delimiterIndex + 1).trim();

        if (key) {
            // process.env는 단순한 JavaScript 객체(Object)입니다
            // 일반적인 JavaScript 객체({})와 똑같이 동작
            process.env[key] = value.replace(/^['"]|['"]$/g, '');
            // 환경 변수 파일에 값을 적을 때 DB_PASS="password123" 처럼 따옴표로
            // 감싸서 적는 경우가 있습니다. 이때 실제 문자열 앞뒤에 붙은 불필요한
            // 따옴표(" 또는 ')를 제거하고 맑은 텍스트만 넣기 위한 정규식 예외 처리
        }
    });

    if(process.env.NODE_ENV == 'dev') {
        console.log(`🚀 [${envMode}] 암호화된 환경 변수 파일을 성공적으로 로드했습니다.`);
    }    

} catch (error: any) {
    console.error("❌ 환경 변수 로드 실패! 경로 또는 복호화 키를 확인하세요:", envPath);
    console.error("에러 내용:", error.message);
    process.exit(1);
}