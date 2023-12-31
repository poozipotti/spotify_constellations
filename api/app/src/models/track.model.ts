import { Table, Column, Model, HasMany, PrimaryKey, ForeignKey, AutoIncrement, HasOne, BelongsToMany, Unique, AllowNull } from "sequelize-typescript";
import TrackJunctionModel from "./trackJunctionModel.model";


@Table
export default class TrackModel extends Model {

  @BelongsToMany(() => TrackModel,()=> TrackJunctionModel,'parent_id')
  parents: TrackModel[];

  @BelongsToMany(() => TrackModel,()=> TrackJunctionModel,'child_id')
  children: TrackModel[];


  @Unique
  @Column
  spotify_id: string;

  @Column
  name: string;
}

