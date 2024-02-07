import { IUser } from "./IUser"

export interface IResponse {
  status: number,
  data: IResponseBody
}

interface IResponseBody {
  status: string,
  message: string,
  details?: {token: string, user: IUser}
}