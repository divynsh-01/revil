import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google DNS

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("CONNECTED"))
  .catch(err => console.log("ERROR:", err.message));
