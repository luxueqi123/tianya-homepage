# 生产维护说明

## 当前边界

- 公网域名：`https://my.tianyaguanxue.com/`
- 生产节点：韩国首尔 `43.108.18.58`，Cloudflare 记录为 `DNS only`，国内用户直接连接源站。
- 生产镜像：`tianya-homepage:20260826-095537`。
- 韩国部署入口：`deploy/docker-compose.korea.yml`。
- 美国旧节点 `154.44.13.182` 保留同一镜像和留言数据备份，只作为紧急回退，不再承载正常流量。
- 本仓库中的代码是后续版本候选源码，不应未经候选验收直接覆盖线上镜像。

## 发布原则

1. 使用日期时间生成不可变镜像标签。
2. 启动独立候选容器，不直接替换生产容器。
3. 验证主页、`/api/wall`、桌面端、手机端、视频与动画。
4. 验收通过后再切换生产容器。
5. 至少保留当前生产镜像和上一可靠版本作为回退点。

## 必查项目

- 页面 HTTP 200，留言接口 HTTP 200；
- 390×844 下无横向溢出；
- 月亮海面视频和“我渴望自由”视频能够持续播放；
- 标题呼吸、组件流光、头像律动、照片墙、时间线和赞助环正常；
- 无限画布链接仍指向 `https://tianyayingxue.cn/login?next=%2Fcreate`；
- 浏览器无未处理异常和控制台错误。

## 数据与回退

生产留言数据使用 Docker 卷挂载到 `/opt/tianya-homepage/data`。发布和回退镜像时不得覆盖该目录。仓库内不保存生产留言、限流状态、会话密钥或服务器凭据。

韩国节点的发布目录为 `/opt/tianya-homepage/releases/<release>`，Nginx 配置位于 `/opt/tianya-homepage/nginx/conf.d/default.conf`，证书目录为 `/etc/letsencrypt`。应用容器和 Nginx 容器必须同时处于 `healthy`，才能视为节点可用。

## 韩国节点操作

```bash
TIANYA_HOMEPAGE_IMAGE=tianya-homepage:<tag> \
  docker compose -f /opt/tianya-homepage/releases/<release>/docker-compose.korea.yml up -d

docker compose -f /opt/tianya-homepage/releases/<release>/docker-compose.korea.yml ps
curl --resolve my.tianyaguanxue.com:443:127.0.0.1 \
  https://my.tianyaguanxue.com/api/wall
```

证书续期脚本安装在 `/opt/tianya-homepage/renew-cert.sh`。续期后必须执行 Nginx 配置检查和热加载；续期任务失败时不得删除仍有效的现有证书。

## 紧急回退

1. 不删除或停止韩国容器，先保留现场以便排障。
2. 在 Cloudflare 中仅把 `my.tianyaguanxue.com` 的 A 记录改回 `154.44.13.182`；若要恢复迁移前链路，同时把代理状态改回 `Proxied`。
3. 等待公共解析器返回旧地址后，验证首页、`/api/wall`、桌面视频和手机视频。
4. 若韩国节点仅是镜像故障，可保持 DNS 不变，使用上一个可靠镜像标签重新启动 Compose；不得覆盖 `/opt/tianya-homepage/data`。

回退完成的判定不是“DNS 已保存”，而是公共解析、HTTPS、页面、留言接口和移动端视频均从目标节点正常返回。
