import { Table, Column, Model, ForeignKey, AllowNull, Unique, PrimaryKey, HasOne, BelongsTo } from "sequelize-typescript";
import TrackModel from "./track.model";

@Table
export default class TrackJunctionModel extends Model {

  @ForeignKey(()=>TrackModel)
  @AllowNull(false)
  @PrimaryKey
  @Unique(false)
  @Column
  parent_id: number;

  @BelongsTo(()=> TrackModel,'parent_id')
  parent: TrackModel


  @ForeignKey(()=>TrackModel)
  @AllowNull(false)
  @PrimaryKey
  @Unique(false)
  @Column
  child_id: number;

  @BelongsTo(()=> TrackModel,'child_id')
  child: TrackModel

}
