import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  CUSTOMER = 'customer',
  RESTAURANT_OWNER = 'restaurant_owner',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'Unique user identifier', example: 'a1b2c3d4-...' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @ApiProperty({ description: 'Full name', example: 'Nguyen Van A' })
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @ApiProperty({ description: 'Phone number', example: '0901234567', nullable: true })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.CUSTOMER })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role!: UserRole;

  @ApiProperty({ description: 'Avatar URL', nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar_url' })
  avatarUrl!: string | null;

  @ApiProperty({ description: 'Account creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
