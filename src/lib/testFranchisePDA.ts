// Test file for franchise PDA functionality
import { createFranchisePDA, generateFranchisePDA } from './franchisePDA';

// Test function to verify PDA creation
export async function testFranchisePDA() {
  try {
    console.log('Testing franchise PDA creation...');
    
    // Test with a sample franchise ID
    const franchiseId = 'nike-01';
    const totalShares = 1000;
    const sharePrice = 1;
    
    // Test PDA creation
    const { pda, bump } = await createFranchisePDA(franchiseId);
    console.log('✅ PDA created successfully:');
    console.log('  PDA:', pda.toString());
    console.log('  Bump:', bump);
    
    // Test PDA generation
    const franchisePDA = await generateFranchisePDA(franchiseId, totalShares, sharePrice);
    console.log('✅ Franchise PDA generated successfully:');
    console.log('  Franchise ID:', franchisePDA.franchiseId);
    console.log('  PDA:', franchisePDA.pda);
    console.log('  Total Shares:', franchisePDA.totalShares);
    console.log('  Share Price:', franchisePDA.sharePrice);
    
    return true;
  } catch (error) {
    console.error('❌ PDA creation failed:', error);
    return false;
  }
}

// Test with invalid program ID
export async function testInvalidProgramID() {
  try {
    console.log('Testing with invalid program ID...');
    
    const franchiseId = 'nike-02';
    const invalidProgramId = 'invalid-program-id';
    
    const { pda, bump } = await createFranchisePDA(franchiseId, invalidProgramId);
    console.log('✅ PDA created with fallback program ID:');
    console.log('  PDA:', pda.toString());
    console.log('  Bump:', bump);
    
    return true;
  } catch (error) {
    console.error('❌ PDA creation with invalid program ID failed:', error);
    return false;
  }
}

// Run tests
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Running franchise PDA tests in browser...');
  testFranchisePDA();
  testInvalidProgramID();
} else {
  // Node environment
  console.log('Running franchise PDA tests in Node...');
  testFranchisePDA();
  testInvalidProgramID();
}

