require('dotenv').config();

module.exports = {
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  ACCOUNT_ID: process.env.ACCOUNT_ID,
  ZONE_ID: process.env.ZONE_ID,
};
