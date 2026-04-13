const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/digitalnotes');
    console.log('✅ MongoDB connection test successful');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      name: String
    });
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ name: 'test' });
    await testDoc.save();
    console.log('✅ Document creation test successful');
    
    await TestModel.deleteMany({});
    console.log('✅ Cleanup successful');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ MongoDB test failed:', error);
  }
}

testConnection();
