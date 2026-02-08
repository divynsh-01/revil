import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import readline from 'readline';
import userModel from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createOwner = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if owner already exists
        const existingOwner = await userModel.findOne({ role: 'owner' });
        if (existingOwner) {
            console.log('\n⚠️  An owner account already exists!');
            console.log(`Owner: ${existingOwner.name} (${existingOwner.email})`);
            console.log('\nOnly one owner account is allowed per system.');
            rl.close();
            process.exit(0);
        }

        console.log('\n🔐 Create Owner Account\n');
        console.log('This will create the first owner account with full system access.\n');

        const name = await question('Enter owner name: ');
        const email = await question('Enter owner email: ');
        const password = await question('Enter owner password (min 8 characters): ');
        const phone = await question('Enter owner phone (optional): ');

        // Validate inputs
        if (!name || !email || !password) {
            console.log('\n❌ Name, email, and password are required!');
            rl.close();
            process.exit(1);
        }

        if (password.length < 8) {
            console.log('\n❌ Password must be at least 8 characters!');
            rl.close();
            process.exit(1);
        }

        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            console.log('\n❌ A user with this email already exists!');
            rl.close();
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create owner
        const owner = new userModel({
            name,
            email,
            password: hashedPassword,
            phone: phone || '',
            role: 'owner'
        });

        await owner.save();

        console.log('\n✅ Owner account created successfully!');
        console.log(`\nOwner Details:`);
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Role: owner`);
        console.log(`\nYou can now login to the admin panel with these credentials.`);

        rl.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error creating owner:', error.message);
        rl.close();
        process.exit(1);
    }
};

createOwner();
