import { Router } from "express";
import {
  getThemeEditorUrl,
  getBlockStatus,
  verifyBlock,
} from "../Controllers/Themes.Controller.js";

const router = Router();

router.get("/editor-url", getThemeEditorUrl);
router.get("/block-status", getBlockStatus);
router.post("/verify-block", verifyBlock);

export default router;
