import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const db = async () => {
  try {
    await mongoose.connect(`${process.env.DATABASE}`);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log(error);
  }
};

export default db;