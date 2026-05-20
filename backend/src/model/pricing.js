import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    features: {
        type: [String],
        required: true,
    },
    isPopular: {
        type: Boolean,
        default: false,
    },
    CtaBtn: {
        type: String,
        required: true,
    },
});

const Pricing = mongoose.model("Pricing", pricingSchema);

export default Pricing;