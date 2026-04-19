const path = require('path')
const os = require('os')
const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const portFinderSync = require('portfinder-sync')

const getLocalIpAddress = () =>
{
    for (const networkInterface of Object.values(os.networkInterfaces()))
    {
        if (!networkInterface)
        {
            continue
        }

        for (const address of networkInterface)
        {
            if (address.family === 'IPv4' && !address.internal)
            {
                return address.address
            }
        }
    }

    return null
}

const infoColor = (_message) =>
{
    return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`
}

module.exports = merge(
    commonConfiguration,
    {
        stats: 'errors-warnings',
        mode: 'development',
        infrastructureLogging:
        {
            level: 'warn',
        },
        devServer:
        {
            host: 'local-ip',
            port: portFinderSync.getPort(8080),
            open: true,
            server: 'http',
            allowedHosts: 'all',
            hot: false,
            watchFiles: ['src/**', 'static/**'],
            static:
            {
                watch: true,
                directory: path.join(__dirname, '../static')
            },
            client:
            {
                logging: 'none',
                overlay: true,
                progress: false
            },
            setupMiddlewares: function(middlewares, devServer)
            {
                const port = devServer.options.port
                const server = devServer.options.server
                const https = server === 'https' || (typeof server === 'object' && server.type === 'https') ? 's' : ''
                const localIp = getLocalIpAddress()
                const domains = []

                if (localIp)
                {
                    domains.push(`http${https}://${localIp}:${port}`)
                }

                domains.push(`http${https}://localhost:${port}`)
                
                console.log(`Project running at:\n${domains.map((domain) => `  - ${infoColor(domain)}`).join('\n')}`)

                return middlewares
            }
        }
    }
)
