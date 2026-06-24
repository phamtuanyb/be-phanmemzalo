import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../../entities/menu.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { generateSlug } from '../../common/utils/slug.util';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ReorderMenuItemsDto } from './dto/reorder-menu-items.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu) private menuRepo: Repository<Menu>,
    @InjectRepository(MenuItem) private itemRepo: Repository<MenuItem>,
  ) {}

  findAll() {
    return this.menuRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('Menu không tồn tại');
    menu.items = await this.buildTree(id);
    return menu;
  }

  async findBySlug(slug: string) {
    const menu = await this.menuRepo.findOne({ where: { slug } });
    if (!menu) throw new NotFoundException('Menu không tồn tại');
    menu.items = await this.buildTree(menu.id);
    return menu;
  }

  async create(dto: CreateMenuDto) {
    const slug = dto.slug || generateSlug(dto.name);
    await this.checkSlugUnique(slug);
    const menu = this.menuRepo.create({ ...dto, slug });
    return this.menuRepo.save(menu);
  }

  async update(id: number, dto: UpdateMenuDto) {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('Menu không tồn tại');
    if (dto.slug && dto.slug !== menu.slug) {
      await this.checkSlugUnique(dto.slug);
    }
    Object.assign(menu, dto);
    return this.menuRepo.save(menu);
  }

  async remove(id: number) {
    const menu = await this.menuRepo.findOne({ where: { id } });
    if (!menu) throw new NotFoundException('Menu không tồn tại');
    return this.menuRepo.remove(menu);
  }

  async addItem(menuId: number, dto: CreateMenuItemDto) {
    const menu = await this.menuRepo.findOne({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('Menu không tồn tại');

    if (dto.parentId) {
      const parent = await this.itemRepo.findOne({
        where: { id: dto.parentId, menuId },
      });
      if (!parent) throw new BadRequestException('Item cha không tồn tại trong menu này');
    }

    const depth = dto.parentId ? await this.getDepth(dto.parentId) + 1 : 0;
    const item = this.itemRepo.create({ ...dto, menuId, depth, order: dto.order ?? 0 });
    return this.itemRepo.save(item);
  }

  async updateItem(menuId: number, itemId: number, dto: UpdateMenuItemDto) {
    const item = await this.itemRepo.findOne({ where: { id: itemId, menuId } });
    if (!item) throw new NotFoundException('Item không tồn tại');

    if (dto.parentId !== undefined) {
      if (dto.parentId === itemId) throw new BadRequestException('Item không thể là cha của chính nó');
      if (dto.parentId) {
        const parent = await this.itemRepo.findOne({ where: { id: dto.parentId, menuId } });
        if (!parent) throw new BadRequestException('Item cha không tồn tại trong menu này');
        item.depth = parent.depth + 1;
      } else {
        item.depth = 0;
      }
    }

    Object.assign(item, dto);
    return this.itemRepo.save(item);
  }

  async removeItem(menuId: number, itemId: number) {
    const item = await this.itemRepo.findOne({ where: { id: itemId, menuId } });
    if (!item) throw new NotFoundException('Item không tồn tại');
    await this.removeItemRecursive(itemId);
  }

  async reorderItems(menuId: number, dto: ReorderMenuItemsDto) {
    const menu = await this.menuRepo.findOne({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('Menu không tồn tại');

    await Promise.all(
      dto.items.map(({ id, parentId, order }) =>
        this.itemRepo.update({ id, menuId }, { parentId: parentId ?? null, order }),
      ),
    );
    return this.findOne(menuId);
  }

  private async buildTree(menuId: number) {
    const all = await this.itemRepo.find({
      where: { menuId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });

    const map = new Map<number, MenuItem & { children: any[] }>();
    all.forEach((item) => map.set(item.id, { ...item, children: [] }));

    const roots: (MenuItem & { children: any[] })[] = [];
    map.forEach((item) => {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children.push(item);
      } else {
        roots.push(item);
      }
    });

    return roots;
  }

  private async getDepth(itemId: number): Promise<number> {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    return item ? item.depth : 0;
  }

  private async removeItemRecursive(itemId: number) {
    const children = await this.itemRepo.find({ where: { parentId: itemId } });
    for (const child of children) {
      await this.removeItemRecursive(child.id);
    }
    await this.itemRepo.delete(itemId);
  }

  private async checkSlugUnique(slug: string) {
    const existing = await this.menuRepo.findOne({ where: { slug } });
    if (existing) throw new ConflictException(`Slug "${slug}" đã tồn tại`);
  }
}
