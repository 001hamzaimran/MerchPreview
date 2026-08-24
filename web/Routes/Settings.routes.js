import { Router } from "express";
import { getSettings, saveSettings } from "../Controllers/Settings.Controller.js";

const router = Router();

router.get("/", getSettings);
router.post("/", saveSettings);

export default router;
