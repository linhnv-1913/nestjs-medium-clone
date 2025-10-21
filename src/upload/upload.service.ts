import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { UPLOAD_IMAGE_PATH } from 'src/constants';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class UploadService {
  private uploadPath = UPLOAD_IMAGE_PATH;

  constructor(private configService: ConfigService) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    await this.ensureUploadDirectory();

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    const filepath = path.join(this.uploadPath, filename);

    await writeFile(filepath, file.buffer);

    const baseUrl = this.configService.get<string>('BASE_URL');
    return `${baseUrl}/${filepath}`;
  }

  private async ensureUploadDirectory(): Promise<void> {
    if (!fs.existsSync(this.uploadPath)) {
      await mkdir(this.uploadPath, { recursive: true });
    }
  }

  deleteImage(imageUrl: string): void {
    const baseUrl = this.configService.get<string>('BASE_URL');
    const filepath = imageUrl.replace(`${baseUrl}/`, '');

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
}
