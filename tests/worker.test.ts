import { describe, it, expect } from "vitest";
import worker from "../src/worker";

function makeRequest(path: string = "/", headers: Record<string, string> = {}) {
    const url = new URL("http://localhost" + path);
    return new Request(url, { headers: new Headers(headers) });
}

describe("worker", () => {
    it("returns IPv4 in JSON at /", async () => {
        const req = makeRequest("/", { "CF-Connecting-IP": "1.2.3.4" });
        const res = await worker.fetch(req, { APP_NAME: "getip" } as any);
        expect(res.headers.get("content-type")).toContain("application/json");
        const body = await res.json();
        expect(body).toEqual({ IPv4: "1.2.3.4", IPv6: "" });
    });

    it("returns IPv6 in JSON at /", async () => {
        const req = makeRequest("/", { "CF-Connecting-IP": "2001:db8::1" });
        const res = await worker.fetch(req, { APP_NAME: "getip" } as any);
        const body = await res.json();
        expect(body).toEqual({ IPv4: "", IPv6: "2001:db8::1" });
    });

    it("/plain returns the preferred version", async () => {
        const req4 = makeRequest("/plain?v=4", { "CF-Connecting-IP": "1.2.3.4" });
        const res4 = await worker.fetch(req4, { APP_NAME: "getip" } as any);
        expect(await res4.text()).toBe("1.2.3.4");

        const req6 = makeRequest("/plain?v=6", { "CF-Connecting-IP": "2001:db8::1" });
        const res6 = await worker.fetch(req6, { APP_NAME: "getip" } as any);
        expect(await res6.text()).toBe("2001:db8::1");
    });

    it("/json includes metadata", async () => {
        const req = makeRequest("/json", {
            "CF-Connecting-IP": "1.2.3.4",
            "user-agent": "test",
            "cf-ipcountry": "US",
            "cf-ray": "abc",
            "cf-asn": "13335"
        });
        const res = await worker.fetch(req, { APP_NAME: "getip" } as any);
        const body = await res.json();
        expect(body.IPv4).toBe("1.2.3.4");
        expect(body.userAgent).toBe("test");
        expect(body.country).toBe("US");
        expect(body.app).toBe("getip");
    });

    it("/headers returns request headers", async () => {
        const req = makeRequest("/headers", { foo: "bar" });
        const res = await worker.fetch(req, { APP_NAME: "getip" } as any);
        const body = await res.json();
        expect(body.foo).toBe("bar");
    });

    it("404 for unknown path", async () => {
        const req = makeRequest("/nope");
        const res = await worker.fetch(req, { APP_NAME: "getip" } as any);
        expect(res.status).toBe(404);
    });
});

