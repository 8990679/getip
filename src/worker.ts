export interface Env {
    APP_NAME: string;
}

type JsonDict = Record<string, unknown>;

function jsonResponse(body: JsonDict, init: ResponseInit = {}): Response {
    const headers = new Headers(init.headers);
    headers.set("content-type", "application/json; charset=utf-8");
    headers.set("cache-control", "no-store");
    return new Response(JSON.stringify(body), { ...init, headers });
}

function parseIp(headers: Headers): { ipv4: string; ipv6: string } {
    const ipHeader = headers.get("CF-Connecting-IP") || headers.get("x-forwarded-for") || "";
    const ip = ipHeader.split(",")[0].trim();
    const isIpv6 = ip.includes(":");
    return { ipv4: isIpv6 ? "" : ip, ipv6: isIpv6 ? ip : "" };
}

function getUserAgent(headers: Headers): string {
    return headers.get("user-agent") || "";
}

function getCountry(headers: Headers): string {
    return headers.get("cf-ipcountry") || "";
}

function getRay(headers: Headers): string {
    return headers.get("cf-ray") || "";
}

function getAsn(headers: Headers): string {
    return headers.get("cf-asn") || "";
}

function textResponse(body: string, init: ResponseInit = {}): Response {
    const headers = new Headers(init.headers);
    headers.set("content-type", "text/plain; charset=utf-8");
    headers.set("cache-control", "no-store");
    return new Response(body, { ...init, headers });
}

function route(request: Request): { path: string; query: URLSearchParams } {
    const url = new URL(request.url);
    return { path: url.pathname.replace(/\/$/, ""), query: url.searchParams };
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const { path, query } = route(request);
        const { ipv4, ipv6 } = parseIp(request.headers);

        if (path === "" || path === "/") {
            return jsonResponse({ IPv4: ipv4, IPv6: ipv6 });
        }

        if (path === "/plain") {
            const prefer = query.get("v");
            const out = prefer === "4" ? ipv4 : prefer === "6" ? ipv6 : ipv4 || ipv6;
            return textResponse(out);
        }

        if (path === "/json") {
            const ua = getUserAgent(request.headers);
            const country = getCountry(request.headers);
            const ray = getRay(request.headers);
            const asn = getAsn(request.headers);
            return jsonResponse({ IPv4: ipv4, IPv6: ipv6, userAgent: ua, country, ray, asn, app: env.APP_NAME });
        }

        if (path === "/headers") {
            const obj: Record<string, string> = {};
            request.headers.forEach((value, key) => {
                obj[key] = value;
            });
            return jsonResponse(obj);
        }

        if (path === "/health") {
            return jsonResponse({ status: "ok", app: env.APP_NAME });
        }

        return jsonResponse({ error: "Not Found" }, { status: 404 });
    },
} satisfies ExportedHandler<Env>;

