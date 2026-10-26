import { Router } from 'express';
import * as questionTypeController from "../controllers/questionController";
import { checkIdParam } from '../middlewares/checkIdParam';
import multer from 'multer';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

router.get('/', questionTypeController.getAllQuestions);


router.post('/', upload.single('pieceJointe'), questionTypeController.createQuestion);


router.delete('/:id', checkIdParam, questionTypeController.deleteQuestion);


export default router;