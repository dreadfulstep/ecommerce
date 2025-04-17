/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff',
                },
                {
                    key: 'X-Frame-Options',
                    value: 'DENY',
                },
                {
                    key: 'X-XSS-Protection',
                    value: '1; mode=block',
                },
                {
                    key: 'Referrer-Policy',
                    value: 'strict-origin-when-cross-origin',
                },
                ],
            },
        ];
    },

    // async rewrites() {
    //     return {
    //     beforeFiles: [
    //         {
    //             source: '/api/:path*',
    //             destination: 'https://api/:path*',
    //         },
    //     ],
    //     afterFiles: [],
    //     fallback: [],
    //     };
    // },
};

export default nextConfig;
