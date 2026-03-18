import { resolve as pathResolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const loaderDir = fileURLToPath(new URL('.', import.meta.url));
const adapterUrl = pathToFileURL(
  pathResolve(loaderDir, '../e2e/sdk_protocol_frontend_adapter.mjs'),
).href;

export async function resolve(specifier, context, nextResolve) {
  if (
    (specifier === '../frontend/lib/protocol.ts' || specifier === '../../frontend/lib/protocol.ts')
    && context.parentURL?.includes('/omegax-protocol/')
  ) {
    return {
      url: adapterUrl,
      shortCircuit: true,
    };
  }

  return nextResolve(specifier, context);
}
