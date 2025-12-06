export async function onRequest(context) {
  try {
    return await context.next();
  } catch (err) {
    // If asset not found, serve index.html for client-side routing
    if (err.status === 404) {
      return context.env.ASSETS.fetch(new URL('/index.html', context.request.url));
    }
    throw err;
  }
}
