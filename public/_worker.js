export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Try to get the asset
    let response = await env.ASSETS.fetch(request);

    // If 404, serve index.html for client-side routing
    if (response.status === 404) {
      const indexUrl = new URL(url);
      indexUrl.pathname = '/index.html';
      response = await env.ASSETS.fetch(new Request(indexUrl, request));
    }

    return response;
  },
};
