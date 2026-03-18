import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register(new URL('./protocol-sdk-adapter-loader.mjs', import.meta.url), pathToFileURL(`${process.cwd()}/`));
