import { Role } from '.prisma/client';
import {
  Controller,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiTags,
  ApiConsumes,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/auth/guards/jwt-auth.guard';
import { Roles } from 'src/core/auth/roles/roles.decorator';
import { RolesGuard } from 'src/core/auth/roles/roles.guard';
import { editFileName, toResponseFiles } from 'src/utils/file-util';
import { FileUploadDto } from './dto/file-upload.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@ApiTags('upload')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('upload')
// @Roles(Role.MAC)
export class UploadController {
  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads',
        filename: editFileName,
      }),
    }),
  )
  // @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload file',
    type: FileUploadDto,
  })
  async upload(@UploadedFiles() files: Array<Express.Multer.File>) {
    try {
      const response = [];
      files.forEach((file) => {
        const fileReponse = {
          filename: file.filename,
          minetype: file.mimetype,
        };
        response.push(fileReponse);
      });
      return toResponseFiles(files);
    } catch (e) {
      throw e;
    }
  }
}
