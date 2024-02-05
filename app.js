require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require('graphql');
const { Product, Variant, Buyer, Order } = require("./models/models");

app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.use("/api", graphqlHTTP({
    schema: buildSchema(`

        type Buyer{
            id: ID!
            username: String!
            email: String!
        }

        type Product{
            id: ID!
            name: String!
            description: String!
            price: Float!
            variants: [Variant]
        }

        type Variant{
            id: ID!
            product: Product!
            variantName: String!
            inventoryCount: Int!
            price: Float!
        }

        type OrderItem{
            variant: Variant!
            quantity: Int!
            subTotal: Float!
        }

        type Order{
            id: ID!
            buyerId:String!
            totalAmount: Float!
            status: String!
            items: [OrderItem]!
        }

        input orderItemInput{
            variantId: ID!
            quantity: Int!
            price: Float!
        }

        input UserInput{
            username: String!
            email: String!
        }

        input ProductInput{
            name: String!
            description: String!
            price: Float!
        }

        input CreateOrderInput{
            buyerId: ID!
            items: [orderItemInput]!
        }

        input VariantInput{
            productId: ID!
            variantName: String!
            inventoryCount: Int!
            price: Float!
        }
        
        input OrderInput{
            orderId: ID!
            productId: ID!
            variantId: ID!
            quantity: Int!
            price: Float!
        }

        type Query{
            products: [Product]
            buyer(id:ID!): Buyer
        }

        type Mutation{
            createOrder(createOrderInput:CreateOrderInput): Order
            createUser(userInput:UserInput):Buyer
            createProduct(productInput:ProductInput):Product
            addProductToOrder(orderInput:OrderInput):Order
            createVariant(variantInput:VariantInput):Variant
        }
    `),
    rootValue: {
        products: async () => {
            const products = await Product.find();
            return products;
        },
        buyer: async (id) => {
            return await Buyer.findById(id);
        },
        createOrder: async (args) => {
            try {
                const orderItems = [];
                for (const item of args.createOrderInput.items) {
                    let quant = item.quantity;
                    const variant = await Variant.
                        findByIdAndUpdate(item.variantId, { $inc: { inventoryCount: -quant } }, { new: true });

                    if (!variant) {
                        throw new Error(`Variant with Id ${item.variantId} not found`);
                    }

                    orderItems.push({
                        variant,
                        quantity: quant,
                        subTotal: quant * item.price,
                    });
                }
                // here for loop ends

                const total_amount = orderItems.reduce((total, item) => total + item.subTotal, 0);
                console.log(orderItems[0].quantity);

                const order = await Order.create({
                    buyerId: args.createOrderInput.buyerId,
                    totalAmount: total_amount,
                    status: 'Pending',
                    items: orderItems
                });

                console.log(order);
                return order;

            } catch (error) {
                console.log(error);
            }
        },
        createUser: async (args) => {
            try {
                const newUser = {
                    username: args.userInput.username,
                    email: args.userInput.email
                }

                const user = await Buyer.create(newUser);
                console.log(user);
                return user;
            } catch (error) {
                console.log(error.message);
            }
        },
        createProduct: async (args) => {
            const product = await Product.create({ name: args.productInput.name, description: args.productInput.description, price: args.productInput.price });
            return product;
        },
        addProductToOrder: async (args) => {
            try {
                const order = await Order.findById(args.orderInput.orderId);

                if (!order) {
                    throw new Error(`Order witht ID ${args.orderInput.orderId} not found`);
                }

                const variant = await Variant.findByIdAndUpdate(args.orderInput.variantId, { $inc: { inventoryCount: -args.orderInput.quantity } }, { new: true });

                if (!variant) {
                    throw new Error(`Variant with Id ${args.orderInput.variantId} not found`);
                }

                const orderItem = {
                    variant: args.orderInput.variantId,
                    quantity:args.orderInput.quantity,
                    subTotal: args.orderInput.quantity * args.orderInput.price,
                };

                order.items.push(orderItem);
                order.totalAmount += orderItem.subTotal;

                await order.save();
                console.log(order);
                return order;

            } catch (error) {
                console.log(error);
            }
        },
        createVariant: async (args) => {
            try {
                console.log(args.variantInput.productId);
                const product = await Product.findById(args.variantInput.productId);

                if (!product) {
                    throw new Error(`Product with ID ${args.variantInput.productId} not found`);
                }

                const variant = await Variant.create({
                    productId: args.variantInput.productId,
                    variantName: args.variantInput.variantName,
                    inventoryCount: args.variantInput.inventoryCount,
                    price: args.variantInput.price
                })

                product.variants.push(variant._id);
                await product.save();

                console.log(variant);
                return variant;

            } catch (error) {
                console.log(error);
            }
        }
    },

    graphiql: true
}));


const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        app.listen(port, (req, res) => {
            console.log(`Server running on port ${port}`);
        });

    } catch (error) {
        console.log(error);
    }
}

start();