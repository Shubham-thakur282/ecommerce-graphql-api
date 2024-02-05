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