import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const read = (name) => readFileSync(join(root, name), "utf8");

const headersFile = read("site/_headers");
const nginx = read("nginx.conf");
const index = read("site/index.html");
const app = read("site/app.js");
const account = read("site/account.js");
const page404 = read("site/404.html");
const readme = read("README.md");
const readmePt = read("README.pt-BR.md");

function headerValue(name) {
  const match = headersFile.match(new RegExp("^\\s+" + name + ":\\s*(.+)$", "m"));
  return match ? match[1].trim() : "";
}

function nginxHeader(name) {
  const match = nginx.match(new RegExp('add_header ' + name + ' "([^"]+)"'));
  return match ? match[1] : "";
}

test("version is aligned at 1.1.2", () => {
  assert.equal(read("VERSION").trim(), "1.1.2");
  assert.match(read("site/version.js"), /GW2_VERSION = "1\.1\.2"/);
  assert.match(index, /version\.js\?v=4/);
  assert.match(index, /app\.js\?v=36/);
  assert.match(app, /account\.js\?v=40/);
  assert.match(readme, /Version 1\.1\.2/);
  assert.match(readmePt, /Versão 1\.1\.2/);
});

test("security headers stay in parity for Pages and self-host nginx", () => {
  const csp = headerValue("Content-Security-Policy");
  assert.ok(csp, "CSP missing from _headers");
  assert.equal(csp, nginxHeader("Content-Security-Policy"));
  assert.match(csp, /style-src 'self'/);
  assert.doesNotMatch(csp, /unsafe-inline/);
  assert.match(csp, /frame-ancestors 'none'/);

  assert.equal(headerValue("X-Frame-Options"), "DENY");
  assert.equal(nginxHeader("X-Frame-Options"), "DENY");

  const permissions = headerValue("Permissions-Policy");
  assert.ok(permissions, "Permissions-Policy missing from _headers");
  assert.equal(permissions, nginxHeader("Permissions-Policy"));
  assert.match(permissions, /camera=\(\)/);

  const hsts = headerValue("Strict-Transport-Security");
  assert.equal(hsts, "max-age=31536000");
  assert.equal(nginxHeader("Strict-Transport-Security"), hsts);

  assert.equal(headerValue("X-Content-Type-Options"), "nosniff");
  assert.equal(nginxHeader("X-Content-Type-Options"), "nosniff");
  assert.equal(headerValue("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.equal(nginxHeader("Referrer-Policy"), "strict-origin-when-cross-origin");
});

test("404 is styled by one same-origin CSS file", () => {
  assert.doesNotMatch(page404, /<style/i);
  assert.match(page404, /href="\/404\.css"/);
  assert.ok(existsSync(join(root, "site/404.css")));
  assert.match(read("site/404.css"), /color-scheme: dark/);
});

test("local references exist", () => {
  for (const [file, source] of [["index.html", index], ["404.html", page404]]) {
    for (const match of source.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      const ref = match[1];
      if (/^https?:|^data:|^\/$/.test(ref)) continue;
      const path = ref.startsWith("/") ? join(root, "site", ref.slice(1)) : join(root, "site", ref);
      assert.ok(existsSync(path.replace(/\?.*$/, "")), file + " references missing " + ref);
    }
  }
  for (const source of [app, account]) {
    for (const match of source.matchAll(/["'](assets\/[^"']+)["']/g)) {
      const path = join(root, "site", match[1].replace(/\?.*$/, ""));
      assert.ok(existsSync(path), "missing asset " + match[1]);
    }
  }
});

test("site JavaScript keeps the no-innerHTML and no-eval rule", () => {
  const files = readdirSync(join(root, "site")).filter((name) => extname(name) === ".js");
  for (const file of files) {
    const source = read(join("site", file));
    assert.doesNotMatch(source, /innerHTML/, file + " uses innerHTML");
    assert.doesNotMatch(source, /\beval\s*\(/, file + " uses eval");
    assert.doesNotMatch(source, /new Function\s*\(/, file + " uses new Function");
  }
});

test("token stays in the documented query path until CORS changes", () => {
  assert.match(account, /access_token/);
  assert.doesNotMatch(account, /\bAuthorization\b/);
  assert.match(readme, /access_token/);
  assert.match(readmePt, /access_token/);
});

test("license and self-host config remain present", () => {
  assert.match(read("LICENSE"), /^MIT License/);
  assert.match(readme, /LICENSE/);
  assert.match(readmePt, /LICENSE/);
  assert.match(nginx, /try_files \$uri \$uri\/ =404/);
  assert.match(nginx, /error_page 404 \/404\.html/);
  assert.match(nginx, /charset utf-8/);
});
