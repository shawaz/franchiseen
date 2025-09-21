// src/lib/moralis.ts
import Moralis from 'moralis';

const moralisApiKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
const workspaceId = process.env.NEXT_PUBLIC_MORALIS_WORKSPACE_ID;

if (!moralisApiKey) {
  throw new Error('Missing MORALIS_SECRET_KEY in environment variables');
}

if (!workspaceId) {
  throw new Error('Missing NEXT_PUBLIC_MORALIS_WORKSPACE_ID in environment variables');
}

const serverUrl = `https://${workspaceId}.usemoralis.com:2053/server`;

export const initializeMoralis = async () => {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: moralisApiKey,
    });
  }
  return Moralis;
};

export default Moralis;