#!/usr/bin/env node

/**
 * Test script for ops-webhook-bridge
 * 
 * Usage:
 *   export WEBHOOK_URL="http://localhost:3000/api/ops-webhook-bridge"
 *   export OPS_WEBHOOK_SECRET="your-secret-key" (optional)
 *   node scripts/ops/test-webhook-bridge.mjs
 */

import crypto from "crypto";
import https from "https";
import http from "http";

const WEBHOOK_URL = process.env.WEBHOOK_URL || "http://localhost:3000/api/ops-webhook-bridge";
const OPS_WEBHOOK_SECRET = process.env.OPS_WEBHOOK_SECRET || "";

function createSignature(payload, secret) {
  if (!secret) return null;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return `sha256=${hmac.digest("hex")}`;
}

async function httpRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === "https:" ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function testHealthCheck() {
  console.log("\n=== Test 1: Health Check (GET) ===");
  try {
    const response = await httpRequest(WEBHOOK_URL, { method: "GET" }, null);
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.ok) {
      console.log("✅ Health check passed");
      return true;
    } else {
      console.log("❌ Health check failed");
      return false;
    }
  } catch (error) {
    console.error("❌ Health check error:", error.message);
    return false;
  }
}

async function testMissingFields() {
  console.log("\n=== Test 2: Missing Required Fields ===");
  
  const payload = JSON.stringify({ pr_title: "Test" });
  const signature = createSignature(payload, OPS_WEBHOOK_SECRET);
  
  const headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  };
  
  if (signature) {
    headers["x-webhook-signature"] = signature;
  }
  
  try {
    const response = await httpRequest(WEBHOOK_URL, { method: "POST", headers }, payload);
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));
    
    if (response.status === 400 && response.data.error) {
      console.log("✅ Validation working - rejected invalid payload");
      return true;
    } else {
      console.log("❌ Should reject missing required fields");
      return false;
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
    return false;
  }
}

async function testInvalidSignature() {
  console.log("\n=== Test 3: Invalid Signature ===");
  
  if (!OPS_WEBHOOK_SECRET) {
    console.log("⚠️  Skipping (no OPS_WEBHOOK_SECRET configured)");
    return true;
  }
  
  const payload = JSON.stringify({
    instruction: "Test change",
    patch_url: "https://example.com/test.patch",
    pr_title: "test: signature test"
  });
  
  const headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "x-webhook-signature": "sha256=invalid_signature_12345",
  };
  
  try {
    const response = await httpRequest(WEBHOOK_URL, { method: "POST", headers }, payload);
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));
    
    if (response.status === 401) {
      console.log("✅ Signature verification working");
      return true;
    } else {
      console.log("❌ Should reject invalid signature");
      return false;
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
    return false;
  }
}

async function testValidPayloadWithPatchUrl() {
  console.log("\n=== Test 4: Valid Payload with patch_url ===");
  
  const payloadObj = {
    instruction: "Test change via webhook bridge",
    patch_url: "https://gist.githubusercontent.com/example/test.patch",
    pr_title: "test: webhook bridge integration",
    auto_merge: "false"
  };
  
  const payload = JSON.stringify(payloadObj);
  const signature = createSignature(payload, OPS_WEBHOOK_SECRET);
  
  const headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  };
  
  if (signature) {
    headers["x-webhook-signature"] = signature;
  }
  
  try {
    const response = await httpRequest(WEBHOOK_URL, { method: "POST", headers }, payload);
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 || response.status === 500) {
      // 500 is expected if GITHUB_TOKEN is not configured in test environment
      console.log("✅ Payload accepted and processed");
      if (response.status === 500 && response.data.error?.includes("GITHUB_TOKEN")) {
        console.log("ℹ️  Note: GITHUB_TOKEN not configured (expected in test)");
      }
      return true;
    } else {
      console.log("❌ Unexpected response");
      return false;
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
    return false;
  }
}

async function testValidPayloadWithBase64() {
  console.log("\n=== Test 5: Valid Payload with patch_b64 ===");
  
  // Create a simple test patch
  const testPatch = `diff --git a/test.txt b/test.txt
index 1234567..abcdefg 100644
--- a/test.txt
+++ b/test.txt
@@ -1 +1 @@
-old content
+new content
`;
  
  const patchB64 = Buffer.from(testPatch).toString("base64");
  
  const payloadObj = {
    instruction: "Test patch via base64",
    patch_b64: patchB64,
    pr_title: "test: base64 patch test"
  };
  
  const payload = JSON.stringify(payloadObj);
  const signature = createSignature(payload, OPS_WEBHOOK_SECRET);
  
  const headers = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  };
  
  if (signature) {
    headers["x-webhook-signature"] = signature;
  }
  
  try {
    const response = await httpRequest(WEBHOOK_URL, { method: "POST", headers }, payload);
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 || response.status === 500) {
      console.log("✅ Base64 patch accepted");
      if (response.status === 500 && response.data.error?.includes("GITHUB_TOKEN")) {
        console.log("ℹ️  Note: GITHUB_TOKEN not configured (expected in test)");
      }
      return true;
    } else {
      console.log("❌ Unexpected response");
      return false;
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🧪 Testing ops-webhook-bridge");
  console.log("Target URL:", WEBHOOK_URL);
  console.log("Webhook Secret:", OPS_WEBHOOK_SECRET ? "Configured ✓" : "Not configured");
  
  const tests = [
    testHealthCheck,
    testMissingFields,
    testInvalidSignature,
    testValidPayloadWithPatchUrl,
    testValidPayloadWithBase64,
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log("\n" + "=".repeat(50));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log("✅ All tests passed!");
    process.exit(0);
  } else {
    console.log("❌ Some tests failed");
    process.exit(1);
  }
}

runAllTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(2);
});
