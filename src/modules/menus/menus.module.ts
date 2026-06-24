import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from '../../entities/menu.entity';
import { MenuItem } from '../../entities/menu-item.entity';
import { MenusService } from './menus.service';
import { AdminMenusController } from './admin-menus.controller';
import { PublicMenusController } from './public-menus.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, MenuItem])],
  controllers: [AdminMenusController, PublicMenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
