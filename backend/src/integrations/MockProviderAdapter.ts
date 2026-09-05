export class MockProviderAdapter {
  async submitClaim(payload: any): Promise<{ claimNumber: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ claimNumber: `MOCK-CLM-${Math.floor(Math.random() * 1000000)}` });
      }, 1500);
    });
  }
}
