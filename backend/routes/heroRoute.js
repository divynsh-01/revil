import express from "express";
import { addHero, listHeroes, removeHero, updateHero } from "../controllers/heroController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const heroRouter = express.Router();

heroRouter.post("/add", adminAuth, upload.single("image"), addHero);
heroRouter.get("/list", listHeroes);
heroRouter.post("/remove", adminAuth, removeHero);
heroRouter.post("/update", adminAuth, upload.single("image"), updateHero);

export default heroRouter;
