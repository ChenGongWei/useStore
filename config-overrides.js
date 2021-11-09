const {
    override,
    addWebpackAlias,
} = require('customize-cra')
const path = require('path')


module.exports = override(
    addWebpackAlias({
        '@/hooks': path.resolve(__dirname, 'src/hooks'),
        '@/pages': path.resolve(__dirname, 'src/pages'),
        '@/components': path.resolve(__dirname, 'src/components')
    })
)
