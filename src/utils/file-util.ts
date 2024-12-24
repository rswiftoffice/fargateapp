import { Guid } from '../utils';
import { extname } from 'path';

export const editFileName = (req, file: Express.Multer.File, callback) => {
  const fileExtName = extname(file.originalname);
  const fileId = Guid.newGuid();
  callback(null, `${fileId}-${Date.now()}-${file.originalname}`);
};

export const toResponseFiles = (
  files: Array<Express.Multer.File>,
): Array<Partial<Express.Multer.File>> => {
  const response = [];
  files.forEach((file) => {
    const fileReponse = {
      filename: `uploads/${file.filename}`,
      minetype: file.mimetype,
    };
    response.push(fileReponse);
  });
  return response;
};
