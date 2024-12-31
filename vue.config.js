module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
        ? '/your-repo-name/'  // 替换成你的仓库名
        : '/',
    devServer: {
        port: 8080,
        open: true
    },
    lintOnSave: false
}