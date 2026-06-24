import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { MenusService } from './menus.service';

@ApiTags('Menus')
@Controller('api/menus')
export class PublicMenusController {
  constructor(private menusService: MenusService) {}

  @Get(':slug')
  @ApiOperation({ summary: 'Lấy cây menu theo slug (public — không cần auth)' })
  @ApiParam({ name: 'slug', example: 'header-menu' })
  findBySlug(@Param('slug') slug: string) {
    return this.menusService.findBySlug(slug);
  }
}
