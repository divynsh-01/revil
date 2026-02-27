
import mongoose from 'mongoose';
import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]); // Cloudflare + Google DNS

const mongoUri = 'mongodb+srv://revil1234:div123456@cluster0.4skz0tm.mongodb.net/?appName=Cluster0';
mongoose.connect(mongoUri).then(async () => {
    const userSchema = new mongoose.Schema({ email: String, role: String });
    const User = mongoose.models.user || mongoose.model('user', userSchema);
    const users = await User.find({ role: { $in: ['admin', 'owner'] } });
    console.log(JSON.stringify(users));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
