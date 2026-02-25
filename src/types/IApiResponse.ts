export interface IResponse<TDetails = unknown> {
  status: number
  data: IResponseBody<TDetails>
}

interface IResponseBody<TDetails = unknown> {
  status: string
  message: string
  details: TDetails
}
