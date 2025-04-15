import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type CustomerSpending {
    customerId: ID!
    totalSpent: Float
    averageOrderValue: Float
    lastOrderDate: String
  }

  type TopProduct {
    productId: ID!
    name: String
    totalSold: Int
  }

  type CategoryBreakdown {
    category: String
    revenue: Float
  }

  type SalesAnalytics {
    totalRevenue: Float
    completedOrders: Int
    categoryBreakdown: [CategoryBreakdown]
  }
input ProductInput {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
  }

  input OrderInput {
    customerId: ID!
    products: [ProductInput]!
    orderDate: String!
    status: String!
  }

  type Order {
    id: ID!
    customerId: ID!
    products: [Product!]!
    totalAmount: Float!
    orderDate: String!
    status: String!
  }

  type Product {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
  }

  type Query {
    getCustomerSpending(customerId: ID!): CustomerSpending
    getTopSellingProducts(limit: Int!): [TopProduct]
    getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics
    getCustomerOrders(customerId: ID!, limit: Int!, offset: Int!): [Order]
  }

  
  type Mutation {
    placeOrder(order: OrderInput!): Order!
  }
    
`;
