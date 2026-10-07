import path from "path";
import { fileURLToPath } from "url";

// Absolute path of the backend folder, independent of where `node` was started from
export const BACKEND_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
