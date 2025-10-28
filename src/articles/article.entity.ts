import { User } from 'src/users/user.entity';
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import {
  BODY_MAX_LENGTH,
  DEFAULT_FAVORITE_COUNT,
  TITLE_MAX_LENGTH,
} from 'src/constants';
import { Comment } from 'src/article-comments/comment.entity';

@Entity()
export class Article extends BaseEntity {
  @Column({ length: TITLE_MAX_LENGTH })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: BODY_MAX_LENGTH })
  body: string;

  @Column({ nullable: true, unique: true })
  slug: string;

  @Column('simple-array', { nullable: true })
  tagList: string[];

  @Column({ default: false })
  favorited: boolean;

  @Column({ default: DEFAULT_FAVORITE_COUNT })
  favoritesCount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  authorId: number;

  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];
}
