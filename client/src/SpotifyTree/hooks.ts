import {getAllTracks} from "@app/WebSdk";
import { useQuery } from "react-query";

export function useGetAllTracks() {
  const queryData = useQuery(["web-tracks"], () => getAllTracks());
  return queryData;
}
