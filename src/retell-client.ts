import Retell from 'retell-sdk';

if(!process.env.RETELL_API_KEY) throw Error("Retell API Key is required.")

const client = new Retell({
  apiKey: process.env.RETELL_API_KEY ?? '',
});

export default client