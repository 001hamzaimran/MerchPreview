import { Router } from "express";
import { getThemeEditorUrl } from "../Controllers/Themes.Controller.js";

const router = Router();

router.get("/editor-url", getThemeEditorUrl);

export default router;
