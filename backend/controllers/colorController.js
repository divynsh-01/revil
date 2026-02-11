import colorModel from "../models/colorModel.js";

// Add color
const addColor = async (req, res) => {
    try {
        const { name, hexCode } = req.body;

        // Check if exists
        const exists = await colorModel.findOne({ name });
        if (exists) {
            return res.json({ success: false, message: "Color already exists" });
        }

        const color = new colorModel({
            name,
            hexCode: hexCode || ""
        });
        await color.save();

        res.json({ success: true, message: "Color added successfully", color });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all colors
const getColors = async (req, res) => {
    try {
        const colors = await colorModel.find({}).sort({ name: 1 });
        res.json({ success: true, colors });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete color
const deleteColor = async (req, res) => {
    try {
        const { id } = req.body;
        await colorModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Color deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addColor, getColors, deleteColor };
