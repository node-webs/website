import express from 'express';

import { page as web_page } from './web.page';

const router = express.Router();

router.get('/', web_page.index);

export default router;