import { ApolloError } from "apollo-server-express";

export class UserInputError extends ApolloError{
    constructor(message){
        super(message, 'USER_INPUT_ERROR');
        Object.defineProperty(this,'name',{value: 'UserInputError'})
    }
}

export class NotFoundError extends ApolloError{
    constructor(message){
        super(message,'NOT_FOUND');

        Object.defineProperty(this, 'name', {value:'NotFoundError'})
    }
}
export class InternalServerError extends ApolloError {
    constructor(message = 'Something went wrong.') {
      super(message, 'INTERNAL_SERVER_ERROR');
  
      Object.defineProperty(this, 'name', { value: 'InternalServerError' });
    }
  }