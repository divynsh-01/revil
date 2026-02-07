import categoryModel from "../models/categoryModel.js";

// Add category
const addCategory = async (req, res) => {
    try {
        const { categoryId, name, image, isActive } = req.body;

        const categoryData = {
            categoryId,
            name,
            image: image || "",
            isActive: isActive !== undefined ? isActive : true
        };

        const category = new categoryModel(categoryData);
        await category.save();

        res.json({ success: true, message: "Category added successfully", category });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({});

        res.json({ success: true, categories });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get active categories only
const getActiveCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({ isActive: true });

        res.json({ success: true, categories });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { categoryId, name, image, isActive } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (image !== undefined) updateData.image = image;
        if (isActive !== undefined) updateData.isActive = isActive;

        await categoryModel.findOneAndUpdate({ categoryId }, updateData);

        res.json({ success: true, message: "Category updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete category
const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.body;

        await categoryModel.findOneAndDelete({ categoryId });

        res.json({ success: true, message: "Category deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addCategory, getCategories, getActiveCategories, updateCategory, deleteCategory };
