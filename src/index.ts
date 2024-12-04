import { urlConfig } from "./urlConfig";
import { UrlEntry } from "./types";
import { domain, favicon_image_source, style_attribute } from './html-tags';

export default {
  async fetch(request, env, ctx): Promise<Response> {
    return handleRequest(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.slice(1);

  console.log(`Request URL: ${request.url}`);

  if (request.method === "GET") {
    if (!path) {
      // Return the dynamically generated default page if no short URL is specified
      const defaultContent = generateDefaultPage();
      return new Response(defaultContent, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Access short URLs from config
    const entry = urlConfig.find((entry) => entry.short === path) as UrlEntry | undefined;

    if (entry && entry.enabled) {
      // Redirect to the long URL if the short URL is found and it is enabled
      return Response.redirect(entry.long, 302);
    }

    // Return the dynamically generated "not found" page if the URL is not found or disabled
    const notFoundContent = generateNotFoundPage();
    return new Response(notFoundContent, {
      headers: { "Content-Type": "text/html" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
}

function generateDefaultPage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${domain} - URL List</title>
  <link rel="icon" id="favicon" type="image/png" href="">
  ${style_attribute}
  </head>
<body>
  <h1>${domain} - URL List</h1>
  <p>Below is the list of URLs available on our platform, last updated on ${new Date().toISOString()}:</p>
  <table>
    <thead>
      <tr>
        <th>Short URL</th>
        <th>Long URL</th>
        <th>Description</th>
        <th>Enabled</th>
      </tr>
    </thead>
    <tbody>
      ${urlConfig.map(entry => `
        <tr>
          <td><a href="${domain}/${entry.short}">${domain}/${entry.short}</a></td>
          <td><a href="${entry.long}">${entry.long}</a></td>
          <td>${entry.description}</td>
          <td>${entry.enabled}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Set the favicon dynamically
      document.getElementById('favicon').href = ${favicon_image_source};
    });
  </script>
</body>
</html>
`;
}

function generateNotFoundPage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>URL Not Found</title>
  <link rel="icon" id="favicon" type="image/x-icon">
  ${style_attribute}
 </head>
<body>
  <h1>URL Not Found or Disabled</h1>
  <p>The URL you are looking for does not exist or is disabled.</p>
  <p><a href="/">Go back to ${domain} home ...</a></p>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Set the favicon dynamically
      document.getElementById('favicon').href = ${favicon_image_source};
    });
  </script>
</body>
</html>
`;
}
