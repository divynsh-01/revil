import { v2 as cloudinary } from "cloudinary";
import heroModel from "../models/heroModel.js";

// Add new hero slide
const addHero = async (req, res) => {
    try {
        const { title, subtitle, link, order, isActive } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.json({ success: false, message: "Image is required" });
        }

        // Upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const heroData = {
            title,
            subtitle: subtitle || "",
            link,
            image: imageUrl,
            order: Number(order) || 0,
            isActive: isActive === "false" ? false : true
        };

        const hero = new heroModel(heroData);
        await hero.save();

        res.json({ success: true, message: "Hero slide added successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// List all hero slides
const listHeroes = async (req, res) => {
    try {
        const heroes = await heroModel.find({}).sort({ order: 1 });
        res.json({ success: true, heroes });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Remove hero slide
const removeHero = async (req, res) => {
    try {
        const { id } = req.body;
        await heroModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Hero slide removed successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update hero slide
const updateHero = async (req, res) => {
    try {
        const { id, title, subtitle, link, order, isActive } = req.body;
        const imageFile = req.file;

        const updateData = {
            title,
            subtitle,
            link,
            order: Number(order)
        };

        if (isActive !== undefined) {
            updateData.isActive = isActive === "true" || isActive === true;
        }

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            updateData.image = imageUpload.secure_url;
        }

        await heroModel.findByIdAndUpdate(id, updateData);
        res.json({ success: true, message: "Hero slide updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addHero, listHeroes, removeHero, updateHero };
