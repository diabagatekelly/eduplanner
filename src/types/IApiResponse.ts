export interface IResponse {
  status: number
  data: IResponseBody
}

interface IResponseBody {
  status: string
  message: string
  details: any
}
