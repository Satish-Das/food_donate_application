// Script to remove the existing unique index on email field in donations collection

const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../database/db');

async function removeEmailIndex() {
  try {
    // Connect to database
    await connectDB();

    console.log('Connected to database...');
    
    // Get collection reference
    const collection = mongoose.connection.collection('donates');
    
    // Drop the specific index that's causing issues
    console.log('Attempting to drop index on email field...');
    await collection.dropIndex('email_1');
    
    console.log('✅ Successfully removed unique index on email field');
    console.log('Users can now donate multiple times with the same email address');
    
    return true;
  } catch (error) {
    if (error.codeName === 'IndexNotFound') {
      console.log('Index was already removed or does not exist');
      return true;
    }
    
    console.error('❌ Error removing index:', error);
    return false;
  } finally {
    // Close the connection after a short delay to ensure operations complete
    setTimeout(async () => {
      console.log('Closing database connection...');
      await mongoose.connection.close();
      console.log('Database connection closed');
    }, 1000);
  }
}

// Execute if this file is run directly
if (require.main === module) {
  removeEmailIndex()
    .then(success => {
      if (success) {
        console.log('Operation completed successfully');
        // Allow time for connection to close before exiting
        setTimeout(() => process.exit(0), 2000);
      } else {
        console.log('Operation failed');
        setTimeout(() => process.exit(1), 2000);
      }
    })
    .catch(err => {
      console.error('Unhandled error:', err);
      setTimeout(() => process.exit(1), 2000);
    });
}

module.exports = { removeEmailIndex };