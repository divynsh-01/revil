import subCategoryModel from "../models/subCategoryModel.js";

// Add sub-category
const addSubCategory = async (req, res) => {
    try {
        const { subCategoryId, categoryId, name, image, isActive } = req.body;

        const subCategoryData = {
            subCategoryId,
            categoryId,
            name,
            image: image || "",
            isActive: isActive !== undefined ? isActive : true
        };

        const subCategory = new subCategoryModel(subCategoryData);
        await subCategory.save();

        res.json({ success: true, message: "Sub-Category added successfully", subCategory });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get sub-categories by categoryId
const getSubCategories = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subCategories = await subCategoryModel.find({ categoryId });

        res.json({ success: true, subCategories });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get active sub-categories by categoryId
const getActiveSubCategories = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subCategories = await subCategoryModel.find({ categoryId, isActive: true });

        res.json({ success: true, subCategories });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get ALL sub-categories
const getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await subCategoryModel.find({});
        res.json({ success: true, subCategories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update sub-category
const updateSubCategory = async (req, res) => {
    try {
        const { subCategoryId, name, image, isActive } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (image !== undefined) updateData.image = image;
        if (isActive !== undefined) updateData.isActive = isActive;

        await subCategoryModel.findOneAndUpdate({ subCategoryId }, updateData);

        res.json({ success: true, message: "Sub-Category updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete sub-category
const deleteSubCategory = async (req, res) => {
    try {
        const { subCategoryId } = req.body;

        await subCategoryModel.findOneAndDelete({ subCategoryId });

        res.json({ success: true, message: "Sub-Category deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addSubCategory, getSubCategories, getActiveSubCategories, getAllSubCategories, updateSubCategory, deleteSubCategory };
