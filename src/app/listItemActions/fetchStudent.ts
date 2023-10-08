import { findUser } from "../api/controller";

class ListFetchStudent {
  declare onError;
  declare onSuccess;

  constructor(onError, onSuccess) {
    this.onError = onError;
    this.onSuccess = onSuccess;
  }

  listAction = async (userEmail) => {
    try {
      const studentEmail = {
        params: {
          email: userEmail
        }
      }
      const response = await findUser(studentEmail)
        .then(async (response) => {
          if (response.status !== 200) {
            this.onError(response.data.message)
          } else {
            this.onSuccess(response.data)
          }
        })
    } catch(error) {
      console.error(error)
      if (error.response) {
        this.onError(error.response.data.message)
      }
    }
  }
}

export default ListFetchStudent;