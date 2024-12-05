# lazyurl

lazyurl is a simple and cost-effective URL shortener designed for those with minimal needs and limited resources. This project was created to provide a straightforward solution without the overhead of more complex URL shorteners.

## Features

- Shorten URLs with ease
- Minimal configuration required
- Lightweight and efficient

## Why lazyurl?

- **Resource-Friendly**: No need to invest in expensive infrastructure or services.
- **Simple Needs**: Perfect for users with basic URL shortening requirements.
- **Lazy-Friendly**: Designed for those who want the simplest and quickest solution.

## Getting Started

1. Clone the repository:
    ```sh
    git clone https://github.com/contento/lazyurl.git
    cd lazyurl
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Build the project:
    ```sh
    npm run build
    ```

4. Run the project:
    ```sh
    npm start
    ```

## Deploying with Wrangler

1. Install Wrangler:
    ```sh
    npm install -g wrangler
    ```

2. Authenticate Wrangler with your Cloudflare account:
    ```sh
    wrangler login
    ```

3. Configure your `wrangler.toml` file with your Cloudflare account details:
    ```toml
    name = "lazyurl"
    type = "javascript"
    account_id = "your-account-id"
    workers_dev = true
    ```

4. Publish your project:
    ```sh
    wrangler publish
    ```

## Usage

- Access the URL shortener via your browser at `http://localhost:3000`.
- Use the provided interface to shorten your URLs.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

