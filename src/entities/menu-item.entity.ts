import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Menu } from './menu.entity';

export enum MenuItemType {
  PAGE = 'page',
  POST = 'post',
  CATEGORY = 'category',
  CUSTOM = 'custom',
}

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  menuId: number;

  @ManyToOne(() => Menu, (menu) => menu.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menuId' })
  menu: Menu;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'enum', enum: MenuItemType, default: MenuItemType.CUSTOM })
  type: MenuItemType;

  @Column({ nullable: true })
  targetId: number;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ default: 0 })
  order: number;

  @Column({ nullable: true })
  parentId: number;

  @Column({ default: 0 })
  depth: number;

  @ManyToOne(() => MenuItem, (item) => item.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: MenuItem;

  @OneToMany(() => MenuItem, (item) => item.parent)
  children: MenuItem[];

  @CreateDateColumn()
  createdAt: Date;
}
