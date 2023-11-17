import { Table, Column, Model, HasMany, PrimaryKey, ForeignKey } from "sequelize-typescript";

@Table
export default class Track extends Model {
  @PrimaryKey
  @Column
  id: number;

  @Column
  @ForeignKey(()=>Track)
  parentId: number;

  @Column
  spotify_uri: string;

  @Column
  spotify_id: string;

  @Column
  name: string;

  @Column
  album_uri: string;
}

