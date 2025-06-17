import { exec } from "child_process";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const args = JSON.stringify(req.body);
    const scriptPath = path.join(process.cwd(), "backend/main.py");

    exec(`python ${scriptPath} '${args}'`, (err, stdout, stderr) => {
      if (err) {
        console.error("Error:", stderr);
        return res.status(500).json({ error: "Gagal menjalankan skrip" });
      }
      try {
        const data = JSON.parse(stdout);
        return res.status(200).json(data);
      } catch {
        return res.status(500).json({ error: "Gagal parsing hasil" });
      }
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
