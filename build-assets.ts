import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { UrlEntry } from "./src/types";
import * as QRCode from 'qrcode';
import Jimp from 'jimp';

// Add MIME type handler for image/x-icon
(Jimp.decoders as any)['image/x-icon'] = Jimp.decoders['image/png'];

export const style_attribute = `
 <style>
    body {
      font-family: 'Monaco', monospace;
      font-size: 14px;
    }
    a {
      color: #007BFF;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
    }
    img.qr-code {
      width: 150px; /* Set the width to a usable size */
      height: 150px; /* Set the height to a usable size */
    }
  </style>
`;

function readCSVFile(filePath: string): string {
  console.log("Reading the CSV file...");
  const fileContents = fs.readFileSync(filePath, "utf8");
  console.log("CSV file read successfully.");
  return fileContents;
}

function parseCSV(fileContents: string): UrlEntry[] {
  console.log("Parsing the CSV file...");
  const records = parse(fileContents, {
    columns: true,
    skip_empty_lines: true,
  });
  console.log("CSV file parsed successfully.");
  return records.map((record: any) => ({
    enabled: record.enabled === 'true' || record.enabled === true,
    short: record.short,
    long: record.long,
    description: record.description,
  }));
}

async function generateQRCodeWithPlaceholder(url: string, filePath: string, iconPath: string): Promise<void> {
  try {
    console.log(`Generating QR code for ${url}...`);
    const qrCodeBuffer = await QRCode.toBuffer(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',  // QR code color
        light: '#ffffff'  // Background color
      }
    });

    const qrCodeImage = await Jimp.read(qrCodeBuffer);
    const iconSize = 50;
    const iconX = (qrCodeImage.bitmap.width - iconSize) / 2;
    const iconY = (qrCodeImage.bitmap.height - iconSize) / 2;

    // Check if the icon file exists, if not, use the default icon
    if (!fs.existsSync(iconPath)) {
      iconPath = './icons/default.png';
    }

    // Load the icon and overlay it on the QR code
    if (fs.existsSync(iconPath)) {
      const icon = await Jimp.read(iconPath);
      icon.resize(iconSize, iconSize);
      qrCodeImage.composite(icon, iconX, iconY);
    } else {
      // Create a white rectangle in the center as a placeholder for the icon
      const placeholder = new Jimp(iconSize, iconSize, '#ffffff');
      qrCodeImage.composite(placeholder, iconX, iconY);
    }

    await qrCodeImage.writeAsync(filePath);
    console.log(`QR code with placeholder saved to ${filePath}`);
  } catch (err) {
    console.error(`Failed to generate QR code for ${url}:`, err);
  }
}

async function writeConfigFile(filePath: string, urlEntries: UrlEntry[]): Promise<void> {
  console.log("Writing the config to a file...");
  fs.writeFileSync(
    filePath,
    `import { UrlEntry } from "./types";

export const urlConfig: UrlEntry[] = ${JSON.stringify(urlEntries, null, 2)};`,
  );
  console.log("Config file written successfully.");
}

async function generateQRCodes(urlEntries: UrlEntry[]): Promise<void> {
  const qrCodeDir = './qrcodes';
  if (!fs.existsSync(qrCodeDir)) {
    fs.mkdirSync(qrCodeDir);
  }

  for (const entry of urlEntries) {
    const shortUrl = `https://gc2.me/${entry.short}`;
    const qrCodePath = `${qrCodeDir}/${entry.short}.png`;
    const iconPath = `./icons/${entry.short}.png`; // Path to your icon file
    await generateQRCodeWithPlaceholder(shortUrl, qrCodePath, iconPath);
  }

  await generateHTML(urlEntries, qrCodeDir);
}

async function generateHTML(urlEntries: UrlEntry[], qrCodeDir: string): Promise<void> {
  const htmlFilePath = `${qrCodeDir}/index.html`;
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Codes</title>
  ${style_attribute}
</head>
<body>
  <h1>QR Codes</h1>
  <table>
    <thead>
      <tr>
        <th>Short URL</th>
        <th>Long URL</th>
        <th>Description</th>
        <th>Enabled</th>
        <th>QR Code</th>
      </tr>
    </thead>
    <tbody>
      ${urlEntries.map(entry => `
        <tr>
          <td>${entry.short}</td>
          <td>${entry.long}</td>
          <td>${entry.description}</td>
          <td>${entry.enabled}</td>
          <td><img src="${entry.short}.png" alt="QR Code for ${entry.short}" class="qr-code"></td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;

  fs.writeFileSync(htmlFilePath, htmlContent);
  console.log(`HTML file generated at ${htmlFilePath}`);
}

async function main() {
  const csvFilePath = './urls.csv'; // Path to your CSV file
  const configFilePath = './src/urlConfig.ts'; // Path to your config file

  const fileContents = readCSVFile(csvFilePath);
  const urlEntries = parseCSV(fileContents);

  await generateQRCodes(urlEntries);
  await writeConfigFile(configFilePath, urlEntries);
}

main().catch(err => console.error(err));
