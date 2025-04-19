#!/usr/bin/env node

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');
const Admin = require('../models/adminModel');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI not found in environment variables.');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Reset admin password
const resetPassword = async (email, newPassword) => {
  try {
    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.error(`No admin found with email: ${email}`);
      return false;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update admin password
    admin.password = hashedPassword;
    await admin.save();

    console.log(`Password for admin ${email} has been reset successfully.`);
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
};

// Create a new admin account
const createAdmin = async (adminData) => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.error(`Admin with email ${adminData.email} already exists.`);
      return false;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create new admin
    const admin = new Admin(adminData);
    await admin.save();

    console.log(`New admin ${adminData.email} created successfully.`);
    return true;
  } catch (error) {
    console.error('Error creating admin:', error);
    return false;
  }
};

// Main function
const main = async () => {
  await connectDB();

  rl.question('Enter admin email: ', async (email) => {
    // Check if admin exists
    const admin = await Admin.findOne({ email });
    
    if (admin) {
      // Reset password flow
      console.log(`Found admin: ${admin.fullname} (${admin.email})`);
      rl.question('Enter new password (min 6 characters): ', async (password) => {
        if (password.length < 6) {
          console.error('Password must be at least 6 characters long.');
          rl.close();
          process.exit(1);
        }

        const success = await resetPassword(email, password);
        if (success) {
          console.log('Password reset successful!');
        } else {
          console.error('Failed to reset password.');
        }
        
        mongoose.connection.close();
        rl.close();
      });
    } else {
      // Create new admin flow
      console.log('Admin not found. Let\'s create a new admin account.');
      
      rl.question('Enter full name: ', (fullname) => {
        rl.question('Enter phone number: ', (phone) => {
          rl.question('Enter city: ', (city) => {
            rl.question('Enter pincode: ', (pincode) => {
              rl.question('Enter address: ', (address) => {
                rl.question('Enter new password (min 6 characters): ', async (password) => {
                  if (password.length < 6) {
                    console.error('Password must be at least 6 characters long.');
                    rl.close();
                    process.exit(1);
                  }

                  const success = await createAdmin({
                    fullname,
                    email,
                    password,
                    phone,
                    city,
                    pincode,
                    address
                  });
                  
                  if (success) {
                    console.log('New admin account created successfully!');
                  } else {
                    console.error('Failed to create admin account.');
                  }
                  
                  mongoose.connection.close();
                  rl.close();
                });
              });
            });
          });
        });
      });
    }
  });
};

// Run the script
main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
}); 