import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress/cli";
import { viteBundler } from "@vuepress/bundler-vite";

export default defineUserConfig({
  lang: "en-US",

  title: "Mirza's Documentation Site",
  description: "My Documentation",

  theme: defaultTheme({
    logo: "https://vuejs.press/images/hero.png",

    navbar: ["/", "/deploy-vm"],
  }),

  bundler: viteBundler(),
});
