import { defineUserConfig } from "vuepress";
import { defaultTheme } from "@vuepress/theme-default";
import { searchPlugin } from "@vuepress/plugin-search";
import { getDirname, path } from "@vuepress/utils";
import { registerComponentsPlugin } from "@vuepress/plugin-register-components";

export default defineUserConfig({
  lang: "zh-CN",
  title: "LPlayer",
  description: "这是我的第一个 VuePress 站点",
  head: [["link", { rel: "icon", href: "/logo.ico" }]],
  theme: defaultTheme({
    // Public 文件路径
    // logo: "/logo.ico",
    home: "/README.md",
    repo: "https://github.com/kon-mio/lplayer",
    navbar: [
      {
        text: "示例",
        link: "/example",
      },
      {
        text: "指南",
        link: "/guide/quick-start.md",
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "指南",
          children: [
            "/guide/quick-start.md",
            "/guide/parameters.md",
            "/guide/api.md",
            "/guide/event.md",
            "/guide/quality.md",
            "/guide/streaming-media.md",
          ],
        },
      ],
    },
    sidebarDepth: 1,

    docsRepo: "https://github.com/kon-mio/lplayer/docs",
    editLink: false,
    editLinkText: "编辑此页",

    lastUpdated: true,
    contributors: true,

    notFound: ["页面不存在"],
    backToHome: "返回主页",

    openInNewWindow: "在新窗口打开",
    toggleColorMode: "切换夜间模式",
    toggleSidebar: "切换侧边栏",
  }),

  plugins: [
    searchPlugin({
      // 配置项
    }),
    registerComponentsPlugin({
      // 配置项
      components: {
        LPlayer: path.resolve(__dirname, "./components/lplayer.vue"),
        LplayerHls: path.resolve(__dirname, "./components/lplayer-hls/LplayerHls.vue"),
        LplayerDash: path.resolve(__dirname, "./components/lplayer-dash/LplayerDash.vue"),
      },
    }),
  ],
});
