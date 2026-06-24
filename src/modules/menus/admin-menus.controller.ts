import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ReorderMenuItemsDto } from './dto/reorder-menu-items.dto';
import { MenuItemType } from '../../entities/menu-item.entity';

@ApiTags('Menus')
@ApiBearerAuth()
@Controller('api/admin/menus')
@UseGuards(JwtAuthGuard)
export class AdminMenusController {
  constructor(private menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách tất cả menu' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết menu kèm cây items' })
  @ApiParam({ name: 'id', example: 1 })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo menu mới' })
  @ApiBody({
    type: CreateMenuDto,
    examples: {
      header: {
        summary: 'Menu header',
        value: { name: 'Header Menu', slug: 'header-menu', description: 'Menu hiển thị ở header' },
      },
      footer: {
        summary: 'Menu footer',
        value: { name: 'Footer Menu', description: 'Menu hiển thị ở footer' },
      },
    },
  })
  create(@Body() dto: CreateMenuDto) {
    return this.menusService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sửa tên/mô tả menu' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateMenuDto, examples: { example: { value: { name: 'Header Menu v2' } } } })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMenuDto) {
    return this.menusService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa menu và toàn bộ items' })
  @ApiParam({ name: 'id', example: 1 })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.remove(id);
  }

  // ── Items ──────────────────────────────────────────────────────────────────

  @Post(':id/items')
  @ApiOperation({ summary: 'Thêm item vào menu' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({
    type: CreateMenuItemDto,
    examples: {
      custom: {
        summary: 'Link tùy chọn (top-level)',
        value: { label: 'Trang chủ', type: MenuItemType.CUSTOM, url: '/', order: 0 },
      },
      category: {
        summary: 'Danh mục (sub-item)',
        value: { label: 'Tin tức', type: MenuItemType.CATEGORY, targetId: 1, parentId: null, order: 1 },
      },
      post: {
        summary: 'Bài viết cụ thể',
        value: { label: 'Bài viết nổi bật', type: MenuItemType.POST, targetId: 5, order: 2 },
      },
    },
  })
  addItem(@Param('id', ParseIntPipe) menuId: number, @Body() dto: CreateMenuItemDto) {
    return this.menusService.addItem(menuId, dto);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Sửa label/url/parentId/order của item' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiParam({ name: 'itemId', example: 3 })
  @ApiBody({
    type: UpdateMenuItemDto,
    examples: {
      rename: { summary: 'Đổi tên', value: { label: 'Sản Phẩm Mới' } },
      move: { summary: 'Chuyển thành sub-item', value: { parentId: 2, order: 0 } },
    },
  })
  updateItem(
    @Param('id', ParseIntPipe) menuId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menusService.updateItem(menuId, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa item và tất cả sub-items con' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiParam({ name: 'itemId', example: 3 })
  removeItem(
    @Param('id', ParseIntPipe) menuId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.menusService.removeItem(menuId, itemId);
  }

  @Put(':id/items/reorder')
  @ApiOperation({ summary: 'Cập nhật thứ tự và parentId hàng loạt (drag & drop)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({
    type: ReorderMenuItemsDto,
    examples: {
      example: {
        summary: 'Reorder sau khi kéo thả',
        value: {
          items: [
            { id: 1, parentId: null, order: 0 },
            { id: 2, parentId: null, order: 1 },
            { id: 3, parentId: 2, order: 0 },
            { id: 4, parentId: 2, order: 1 },
          ],
        },
      },
    },
  })
  reorderItems(
    @Param('id', ParseIntPipe) menuId: number,
    @Body() dto: ReorderMenuItemsDto,
  ) {
    return this.menusService.reorderItems(menuId, dto);
  }
}
