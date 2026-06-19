import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const SECRET_KEY: string | undefined = "dev-secret-key-32-bytes-xxxxxxxx";
const ALGORITHM: string = 'aes-256-cbc';
const IV_LENGTH: number = 16;

function encryptFile(mode: string): void {
    // 💡 1. SECRET_KEY가 undefined인지 먼저 엄격하게 체크합니다. (에러 방지, 32자리)

    // 32 자리 만들기
    // node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

    if (!SECRET_KEY || SECRET_KEY.length !== 32) {
        console.error("❌ 에러: 시스템 환경 변수 'MY_SECRET_KEY'가 설정되지 않았거나 32바이트가 아닙니다.");
        console.error(`현재 입력된 키: ${SECRET_KEY}`);
        process.exit(1);
    }

    const inputPath: string = path.join(process.cwd(), 'nunjucks', '_data', `.${mode}`);
    const outputPath: string = path.join(process.cwd(), 'nunjucks', '_data', `${mode}x`);

    if (!fs.existsSync(inputPath)) {
        console.error(`❌ 원본 파일이 없습니다: ${inputPath}`);
        return;
    }

    const plainText: string = fs.readFileSync(inputPath, 'utf8');

    // 💡 2. 원본 .env 파일이 아예 비어있는지도 체크합니다.
    if (!plainText.trim()) {
        console.error(`❌ 에러: 원본 파일이 비어있습니다: ${inputPath}`);
        return;
    }

    const iv: Buffer = crypto.randomBytes(IV_LENGTH);
    
    const cipher: crypto.Cipheriv = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv)
    
    let encrypted: string = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const finalResult: string = `${iv.toString('hex')}:${encrypted}`;
    fs.writeFileSync(outputPath, finalResult, 'utf8');

    console.log(`✅ [${mode}] 암호화 완료 -> ${outputPath}`);
}

const mode: string = process.argv[2] || 'development';
encryptFile(mode);