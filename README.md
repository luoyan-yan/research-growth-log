# 科研生长日志

一个基于原生 HTML、CSS 和 JavaScript 的科研成长记录应用，帮助研究生记录真实的日常推进、Idea、困惑与下一步行动。

## 功能概览

- 三分钟科研记录表单
- 新增、编辑、删除记录
- 本周回顾与工作类型分布
- 示例数据加载和清除
- 文本周报复制和 CSV 导出
- localStorage 本地持久化
- 移动端响应式适配

## 运行方式

```bash
python -m http.server 5500
```

然后访问：

```text
http://127.0.0.1:5500/
```

## 数据说明

- 记录保存在浏览器本地，不会自动上传。
- 默认生成的周报不包含焦虑程度和今日状态。
- 示例数据用“示例模式”标记，并且不会覆盖已有个人记录。

## 结构

- `index.html`：页面结构
- `styles.css`：视觉样式与响应式布局
- `app.js`：数据处理、保存逻辑和交互逻辑

## GitHub Pages 发布

项目是纯静态网页，根目录已有 `index.html`，CSS 与 JavaScript 均通过相对路径加载，不依赖后端服务。

准备发布时，可以在 GitHub 仓库的 **Settings → Pages** 中选择 **Deploy from a branch**，再选择包含这些文件的分支和根目录。保存后等待 GitHub Pages 生成访问地址即可。本项目不会把浏览器 `localStorage` 中的个人记录写入源码或上传到 GitHub；发布前仍建议检查提交内容，确认只包含虚拟示例数据。

## .gitignore

项目中已忽略：

- `design-reference.jpg`
- `.DS_Store` / 系统缓存文件
- 其他临时文件
