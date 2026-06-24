import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('site_settings')
export class SiteSettings {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'jsonb' })
  value: object;

  @UpdateDateColumn()
  updatedAt: Date;
}
