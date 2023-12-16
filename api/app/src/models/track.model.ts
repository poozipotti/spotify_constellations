import { Table, Column, Model, HasMany, PrimaryKey, ForeignKey, AutoIncrement, HasOne, BelongsTo } from "sequelize-typescript";

@Table
export default class TrackModel extends Model {

  @ForeignKey(()=>TrackModel)
  @Column
  parent_id: number;

  @BelongsTo(() => TrackModel)
  team: TrackModel;

  @Column
  spotify_id: string;

  @Column
  name: string;
}

