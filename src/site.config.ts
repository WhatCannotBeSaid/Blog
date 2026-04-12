/**
 * 站点外链与评论：按需修改下列常量。
 * Utterances 需在 GitHub 安装 https://github.com/apps/utterances 并指定公开仓库。
 */
export const siteConfig = {
  /** 首页左侧栏「GitHub」指向的地址（一般为个人主页） */
  githubUrl: "https://github.com/WhatCannotBeSaid",

  /** 顶栏中央引文（首页搜索框占位与之相同） */
  headerQuote: "Whereof one cannot speak, thereof one must be silent",

  /** 首页左侧栏「邮件」mailto；改为你的真实邮箱 */
  contactEmail: "blog.grandly739@passmail.com",

  /**
   * Utterances 评论区：`owner/repo`。留空则底部不加载脚本，仅显示简短说明。
   */
  utterancesRepo: "WhatCannotBeSaid/Blog" as string,
};
