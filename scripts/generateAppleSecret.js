const jwt = require('jsonwebtoken');
const fs = require('fs');

// Apple Sign-In JWT Secret Generator
// Run this script to generate your Apple Client Secret for Supabase

const APPLE_TEAM_ID = 'S567A46Q3N'; // Your Apple Team ID
const APPLE_KEY_ID = 'H587598RPL'; // From the .p8 file you downloaded
const APPLE_SERVICE_ID = 'com.anonymous.chargequest-app.web'; // Your Service ID
const APPLE_PRIVATE_KEY_PATH = './AuthKey_H587598RPL.p8'; // Path to your .p8 file

function generateAppleSecret() {
  try {
    // Read the private key and clean up any formatting issues
    let privateKey = fs.readFileSync(APPLE_PRIVATE_KEY_PATH, 'utf8');
    
    // Clean up the private key - remove any extra whitespace and ensure proper formatting
    privateKey = privateKey.trim();
    
    // Handle keys that might be on a single line or have formatting issues
    if (!privateKey.includes('\n') || privateKey.includes('\\n')) {
      console.log('🔧 Fixing key formatting...');
      
      // Remove any escaped newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // If still no proper newlines, reconstruct the key
      if (!privateKey.includes('\n')) {
        const keyContent = privateKey
          .replace('-----BEGIN PRIVATE KEY-----', '')
          .replace('-----END PRIVATE KEY-----', '')
          .trim();
        
        // Split into 64-character lines (standard for PEM format)
        const formattedKeyContent = keyContent.match(/.{1,64}/g)?.join('\n') || keyContent;
        privateKey = `-----BEGIN PRIVATE KEY-----\n${formattedKeyContent}\n-----END PRIVATE KEY-----`;
      }
    }
    
    console.log('🔑 Using private key format:');
    console.log(privateKey.substring(0, 50) + '...' + privateKey.substring(privateKey.length - 30));
    
    // Create the JWT payload
    const payload = {
      iss: APPLE_TEAM_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (6 * 30 * 24 * 60 * 60), // 6 months
      aud: 'https://appleid.apple.com',
      sub: APPLE_SERVICE_ID
    };
    
    // Sign the JWT
    const token = jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      header: {
        alg: 'ES256',
        kid: APPLE_KEY_ID
      }
    });
    
    console.log('\n🍎 Apple Client Secret Generated:');
    console.log('=====================================');
    console.log(token);
    console.log('=====================================');
    console.log('\n📋 Copy this token and paste it in your Supabase Apple provider settings');
    console.log('\n⚠️  Note: This token expires in 6 months. You\'ll need to regenerate it.');
    
  } catch (error) {
    console.error('❌ Error generating Apple secret:', error.message);
    console.log('\n📝 Make sure you have:');
    console.log('1. Downloaded the .p8 file from Apple Developer Console');
    console.log('2. Updated APPLE_KEY_ID with your Key ID');
    console.log('3. Updated APPLE_PRIVATE_KEY_PATH to point to your .p8 file');
    console.log('4. The .p8 file is properly formatted (this script will try to fix formatting issues)');
  }
}

generateAppleSecret(); 