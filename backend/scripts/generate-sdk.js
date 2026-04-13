#!/usr/bin/env node
/**
 * Generates OpenAPI TypeScript SDK from the running backend.
 * Usage: node scripts/generate-sdk.js
 */
const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(__dirname, '../../sdk');

async function main() {
  console.log(`Fetching OpenAPI spec from ${API_URL}/api/docs-json...`);

  const response = await fetch(`${API_URL}/api/docs-json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch spec: ${response.statusText}`);
  }

  const spec = await response.json();
  const specPath = path.resolve(__dirname, '../openapi.json');
  writeFileSync(specPath, JSON.stringify(spec, null, 2));
  console.log(`Spec saved to ${specPath}`);

  console.log(`Generating SDK to ${OUTPUT_DIR}...`);
  execSync(
    `npx @openapitools/openapi-generator-cli generate \
      -i ${specPath} \
      -g typescript-fetch \
      -o ${OUTPUT_DIR} \
      --additional-properties=typescriptThreePlus=true,supportsES6=true,withSeparateModelsAndApi=true,modelPackage=models,apiPackage=apis`,
    { stdio: 'inherit' },
  );

  console.log('SDK generated successfully!');
}

main().catch((err) => {
  console.error('SDK generation failed:', err);
  process.exit(1);
});
