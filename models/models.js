const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    variants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Variant"
    }]
});

const Product = mongoose.model("Product",productSchema);

const variantSchema = mongoose.Schema({
    prdouctId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    variantName:{
        type:String,
        required:true,
    },
    inventoryCount:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true
    }
});

const Variant = mongoose.model("Variant",variantSchema);


const buyerSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
});

const Buyer = mongoose.model("Buyer",buyerSchema);


const orderItemSchema = mongoose.Schema({
    variant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Variant",
    },
    quantity:{
        type:Number,
        required:true
    },
    subTotal:{
        type:Number,
        required:true
    }
})

const orderSchema = mongoose.Schema({
    buyerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Buyer",
    },
    totalAmount:{
        type:Number,
        required:true,
    },
    status:{
        type:String,
        required:true
    },
    items:[orderItemSchema],

});

const Order = mongoose.model("Order",orderSchema);

module.exports = {Product,Variant,Buyer,Order};