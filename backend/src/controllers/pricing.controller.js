import Pricing from "../model/pricing.js";

export const getAllPricing = async (req, res) => {
    try {
        const pricing = await Pricing.find();
        res.status(200).json({ success: true,  pricing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPricing = async (req, res) => {
    try {
        const pricing = new Pricing(req.body);
        await pricing.save();
        res.status(201).json({ success: true, data: pricing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePricing = async (req, res) => {
    try {
        const pricing = await Pricing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: pricing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePricing = async (req, res) => {
    try {
        const pricing = await Pricing.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: pricing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};