import { Request, Response } from 'express';

const page = {
    index: (req: Request, res: Response) => {
        res.render('views/index', { title: 'My WEB!! Page' });
    }
};

const test = {};

export { page, test }