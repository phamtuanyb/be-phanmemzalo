import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactService } from './contact.service';

@ApiTags('Admin / Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/admin/contacts')
export class AdminContactsController {
  constructor(private contactService: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách yêu cầu liên hệ' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contactService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa yêu cầu liên hệ' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactService.remove(id);
  }
}
