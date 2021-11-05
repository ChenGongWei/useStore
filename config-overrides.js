const {
    override,
    addWebpackAlias,
} = require('customize-cra')
const path = require('path')


module.exports = override(
    addWebpackAlias({
        '@/lib': path.resolve(__dirname, 'src/lib'),
        '@/pages': path.resolve(__dirname, 'src/pages'),
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/assets': path.resolve(__dirname, 'src/assets'),
        '@/style': path.resolve(__dirname, 'src/style'),
    })
)
