import fs from 'fs';
import cron from 'node-cron';
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const tmpAccountMedia = join(__dirname, '..', 'tmp/account_page');
const tmpJsonPath = join(__dirname, '..', 'tmp/jsons');

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Ошибка при удалении файла:', err);
    }
  });
};


const checkFolderAndDeleteFiles = (patch, lifetimeLongerThan) => {
  fs.readdir(patch, (err, files) => {
    if (err) {
      console.error('Ошибка при чтении папки:', err);
    } else {
      const currentTime = Date.now();
      files.forEach((file) => {
        const filePath = join(patch, file);

        fs.stat(filePath, (err, stats) => {
          if (err) {
            console.error(`Ошибка при получении информации о файле "${file}":`, err);
          } else {
            const fileAgeMinutes = (currentTime - stats.mtime.getTime()) / (1000 * 60);

            if (fileAgeMinutes > lifetimeLongerThan) {
              deleteFile(filePath);
            }
          }
        });
      });
    }
  });

}

cron.schedule('*/5 * * * *', () => {
  checkFolderAndDeleteFiles(tmpAccountMedia, 30 )
  checkFolderAndDeleteFiles(tmpJsonPath, 30)
});

