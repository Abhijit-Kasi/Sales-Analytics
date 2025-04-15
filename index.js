import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import { ApolloServer } from 'apollo-server-express';
import {typeDefs} from './app/graphQL/typeDefs.js';
import resolvers  from './app/graphQL/resolvers/Resolvers.js';
import redisClient from './app/utils/redisClient.js';
import { InternalServerError } from './app/utils/CustomErrors.js';

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers,formatError: (err) => {
   
    console.error('[GraphQL Error]', err);

    // Return only safe fields to client
    return {
      message: err.message,
      code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
      path: err.path,
    };
  }, });

  await server.start();
  server.applyMiddleware({ app });
  console.log('Connection:',process.env.MONGODB_URI)
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await redisClient.connect()
  app.listen({ port: 4000 }, () => {
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  });
}

startServer();
