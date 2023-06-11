import fs from 'fs'
import path from 'path'

export async function createEmptyFileOrFolder(inputPath) {
  const resolvedPath = path.resolve(inputPath);

  // 检查输入路径是文件还是文件夹
  const isDirectory = inputPath.endsWith('/');
  
  fs.access(resolvedPath, fs.constants.F_OK, (err) => {
    // 如果文件或文件夹不存在，则创建
    if (err) {
      if (isDirectory) {
        fs.mkdir(resolvedPath, { recursive: true }, (err) => {
          if (err) {
            console.error(`创建文件夹失败: ${err.message}`);
          } else {
            console.log(`文件夹已创建: ${resolvedPath}`);
          }
        });
      } else {
        fs.writeFile(resolvedPath, '', (err) => {
          if (err) {
            console.error(`创建文件失败: ${err.message}`);
          } else {
            console.log(`文件已创建: ${resolvedPath}`);
          }
        });
      }
    } else {
      console.log(`路径已存在: ${resolvedPath}`);
    }
  });
}

