import { Table, Column, Model, ForeignKey, AllowNull } from "sequelize-typescript";
import TrackModel from "./track.model";

@Table
export default class TrackJunctionModel extends Model {

  @ForeignKey(()=>TrackModel)
  @AllowNull(false)
  @Column
  parent_id: number;

  @ForeignKey(()=>TrackModel)
  @AllowNull(false)
  @Column
  child_id: number;

}
