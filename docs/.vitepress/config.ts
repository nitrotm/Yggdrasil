import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/Yggdrasil/",
  title: "Yggdrasil",
  description: "Give your AI agent structural understanding of your system",
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/getting-started" },
      { text: "Concept", link: "/concept/foundation" },
      { text: "GitHub", link: "https://github.com/krzysztofdudek/Yggdrasil" },
    ],
    sidebar: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/getting-started" },
      { text: "Supported Platforms", link: "/platforms" },
      { text: "CLI Reference", link: "/cli-reference" },
      { text: "Configuration", link: "/configuration" },
      {
        text: "Concept",
        collapsed: true,
        items: [
          { text: "Foundation", link: "/concept/foundation" },
          { text: "Graph", link: "/concept/graph" },
          { text: "Engine", link: "/concept/engine" },
          { text: "Materialization", link: "/concept/materialization" },
          { text: "Integration", link: "/concept/integration" },
          { text: "Tools", link: "/concept/tools" },
        ],
      },
    ],
  },
});
