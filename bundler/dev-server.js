const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const devServerConfiguration = require('./webpack.dev.js')

const compiler = webpack(devServerConfiguration)
const server = new WebpackDevServer(devServerConfiguration.devServer || {}, compiler)

const start = async () =>
{
    try
    {
        await server.start()
    }
    catch (error)
    {
        console.error(error)
        process.exit(1)
    }
}

start()
