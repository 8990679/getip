addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

function handleRequest(request) {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const isIPv6 = ip.includes(':');

  const result = {
    IPv4: isIPv6 ? '' : ip,
    IPv6: isIPv6 ? ip : ''
  };

  return new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json' }
  });
}
