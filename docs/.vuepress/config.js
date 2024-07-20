import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress/cli";
import { viteBundler } from "@vuepress/bundler-vite";

export default defineUserConfig({
  lang: "en-US",

  title: "Mirza's Documentation Site",
  description: "My Documentation",

  theme: defaultTheme({
    logo: "https://cdn-icons-png.flaticon.com/512/1048/1048927.png",

    navbar: ["/", "/deploy-vm", "/cert-vm", "/metrics"],
  }),

  bundler: viteBundler(),
});
