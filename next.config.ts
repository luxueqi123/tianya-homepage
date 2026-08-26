import type { NextConfig } from 'next';
import { resolve } from 'node:path';

const projectRoot = process.env.TURBOPACK_ROOT
    ? resolve(process.env.TURBOPACK_ROOT)
    : __dirname;

const nextConfig: NextConfig = {
    output: 'standalone',
    outputFileTracingRoot: projectRoot,
    turbopack: {
        // A clean clone builds from the repository root. Docker may still
        // override this with TURBOPACK_ROOT=/app.
        root: projectRoot,
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: '**' },
        ],
        qualities: [75, 90],
    },
};

export default nextConfig;
