export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Try to serve the requested asset
    const response = await env.ASSETS.fetch(request);

    // If the asset exists (200 status), return it
    if (response.status === 200) {
      return response;
    }

    // For all other paths (404s), serve index.html to support SPA routing
    // Skip this for actual file extensions that should 404
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(pathname);

    if (!hasFileExtension || pathname.endsWith('.html')) {
      const indexRequest = new Request(new URL('/index.html', request.url), request);
      return env.ASSETS.fetch(indexRequest);
    }

    // Return the original 404 for actual missing files with extensions
    return response;
  },
};
