import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/database/base.entity';
import { Article } from 'src/articles/article.entity';
import { User } from 'src/users/user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Comment extends BaseEntity {
  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => Article, (article) => article.comments)
  @JoinColumn({ name: 'articleId' })
  article: Article;

  @Column()
  articleId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Exclude()
  @Column()
  authorId: number;
}
