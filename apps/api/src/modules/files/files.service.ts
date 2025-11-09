import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  signedUrl() {
    return { url: 'https://storage.example/upload' };
  }
}
