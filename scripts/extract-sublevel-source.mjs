import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const j = JSON.parse(
  fs.readFileSync(path.join(root, ".tmp-sublevel-source.json"), "utf8"),
);

for (const f of j.files) {
  if (!f.code) continue;
  const dest = path.join(root, ...f.path.split("/"));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, f.code);
  console.log("wrote", dest);
}
