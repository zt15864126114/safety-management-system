module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
        ? '/safety-management-system/'  // 替换成你的仓库名
        : '/',outputDir: 'docs',
    devServer: {
        port: 8080,
        open: true
    },
    lintOnSave: false
}