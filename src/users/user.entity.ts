import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { USERNAME_MAX_LENGTH } from 'src/constants';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ length: USERNAME_MAX_LENGTH })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true })
  image: string;
}
