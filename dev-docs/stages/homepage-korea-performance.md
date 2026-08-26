# 韩国节点国内访问优化

## 阶段控制

- schema: sliver-stage/v1
- stage_status: completed
- task_depth: 高风险任务
- product_confirmation: original_request_confirmed: 用户明确要求修复已发现问题并把当前韩国服务器的国内访问调到最优，同时此前明确要求不降低质量、手机优化不影响电脑、不得删除动态效果。
- active_substage: 韩国节点修复与性能发布
- authorized_substage: 韩国节点修复与性能发布
- substage_authorization: confirmed: 用户当前请求明确授权修复和当前服务器生产优化。
- result_status: success
- truth_writeback: completed

## 阶段目标与用户流程

国内用户直接打开 `my.tianyaguanxue.com` 时，地图不再因境外第三方请求而空白，手机按实际显示尺寸获取图片，静态资源复访命中缓存，文本响应启用压缩。视频、音乐、头像律动、流光和桌面交互保持不变；用户仍按原路径浏览 13 个板块、打开无限画布、使用音乐和留言。

## 当前真相与 Owner

- source truth：本仓库前端、`deploy/my.tianyaguanxue.com.korea.nginx.conf` 和韩国服务器现行 Compose。
- 前端 Owner：Location、旅行画廊、照片墙、时间线组件。
- 网络 Owner：韩国 Nginx 反代和 Linux TCP 拥塞控制参数。
- 当前证据：生产镜像 `tianya-homepage:20260826-172040` 与 Nginx 均健康、重启次数为 0；公共 DNS 为 `DNS only → 43.108.18.58`；本机到韩国 Ping 均值 109.6ms，美国回退节点为 168.4ms；Nginx gzip、图片缓存和 Range 直传均已生效。
- 禁止 Owner：不修改无限画布站点代码，不修改 CloudFront 视频内容，不修改留言数据目录和认证边界。

## 调研决策

- research_status: completed: 已完成韩国与美国链路、DNS、源站与 CloudFront Range、桌面和手机浏览器、HTTP 头及服务器资源对比。

保留 CloudFront 视频，因为中国移动实测其 1MiB Range 多数约 0.23 秒，明显快于韩国源站约 2.40 秒中位值；站内图片和服务器配置就地优化。用本地矢量城市脉络图替代 OpenStreetMap 运行时依赖，不复制第三方页面组件。

## 范围与非目标

- 范围：本地地图、响应式图片尺寸、Nginx 压缩/缓存/连接复用、可验证的 TCP 参数和生产发布。
- 非目标：不更换服务器供应商，不接付费大陆 CDN，不改域名备案状态，不删除或降级现有动态效果。
- 质量边界：桌面效果保持原样；手机不降低图片视觉质量，只避免请求超过实际像素需求的资源。

## 子阶段计划

| 子阶段 | 结果 | Owner | 完成标准 | 验证 | 不触碰 |
| --- | --- | --- | --- | --- | --- |
| 韩国节点修复与性能发布 | 国内直连稳定且公开静态资源链路优化 | 前端组件、韩国 Nginx、TCP 参数 | 候选容器通过后切生产，保留回退 | check、build、桌面/手机、HTTP 头、Range、多轮测速 | 视频/音乐/律动/流光、留言数据、电脑布局 |

## 测试、安全与影响

- 测试等级：生产发布与网络配置按 T3；代码回归按 T1。
- 执行 `npm run check`、`npm run build`、候选容器健康检查、桌面 1440×900 和手机 390×844 浏览器验收。
- 检查 13 个板块、图片、三段视频、音乐暂停继续与首次交互解锁、头像律动、无限画布链接、微信复制、留言 GET 只读。
- 不新增公网端口，不改变 SSH、证书、鉴权或留言接口；只缓存公开构建产物与公开图片，不缓存 API 和留言。

## 验证方法

- 代码：ESLint、TypeScript、音乐接口测试、Next 生产构建。
- 视觉：候选环境与生产环境分别复核桌面和手机，无横向溢出、无空白地图、无缺图。
- 网络：验证 gzip、Cache-Control、`X-Image-Cache`、HTTP 206/Range、DNS 直连目标和多轮 TTFB/下载耗时。
- 运行：容器 healthy、restart=0、Nginx `nginx -t` 通过、留言接口 GET 200。

## 停止条件与未验证

- 候选环境任一关键功能退化、桌面布局改变、视频或音乐失效、留言数据路径变化时立即停止发布。
- Nginx 配置校验失败或新镜像不健康时不切生产。
- 全国三网所有城市的绝对最优无法由单一本机线路证明；最终只声明现有韩国节点和当前架构内的可验证最佳状态。

## 回滚与授权

- implementation_authorization: confirmed: 用户明确要求修复当前生产并优化当前服务器。
- authorization_substage: 韩国节点修复与性能发布
- rollback_plan: 保留上一候选镜像 `tianya-homepage:20260826-153853` 和迁移基线 `tianya-homepage:20260826-095537`，切换前已备份线上 Nginx；失败时恢复旧配置和旧镜像并复核健康状态。
- irreversible_boundary: 不执行不可逆数据迁移；唯一外部边界是生产容器和 Nginx 切换，均有明确回退。

## 实施回写

- actual_result: 已用本地 SVG 替代运行时 OpenStreetMap；旅行画廊、照片墙和时间线按显示尺寸请求图片；韩国 Nginx 已启用 gzip、上游 keepalive、静态资源缓存、`/_next/image` 代理缓存和媒体 Range 直传；Cloudflare A 记录保持 `DNS only` 并指向韩国节点；生产镜像为 `tianya-homepage:20260826-172040`。
- changed_owners: Location、旅行画廊、照片墙、时间线、音乐首次交互解锁、韩国 Compose 与 Nginx。
- plan_deviation: 曾错误地在 2 GiB 韩国生产机现场构建，造成内存压力、SSH/HTTPS 暂时失联；通过美国节点临时回退、阿里云控制台重启和命令助手恢复 SSH 后，删除未启用的 2 GiB 临时 Swap，后续全部改为本地构建成品镜像上传，未触碰 `/opt/tianya-homepage/data`。
- evidence_status: live_verified
- fresh_evidence: `npm run check`、`npm run build` 通过；成品镜像 `sha256:2f5f449cac9dababb781e9a7bda64762dfd8a684dc5945338a5a2640ebc09412`，压缩包 SHA256 `7F605359B7B4509A6E3D781658BD9D2B86BE76A40C4171B3F5D873C83B228EBE`；桌面与 390×844 手机均为 13 个板块、无横向溢出、78 张图片无缺图、控制台错误为 0；手机和桌面首屏视频正常播放；无限画布链接正确；音乐点击后 `paused=false`、音量 0.05、头像光环为 active；`/api/wall` 200；gzip 生效；图片缓存首次 MISS、第二次 HIT；本地视频 Range 返回 206。
- network_evidence: 阿里 DNS、腾讯 DNS 和 Google DNS 均返回 `43.108.18.58`；韩国 5 次 HTTPS 首包中位约 0.460 秒，美国回退节点约 0.584 秒；保留更稳定的 `cubic + fq_codel`，CloudFront 视频继续外置。
- remaining_risk: 全国三网多城市尚未外部拨测，不能声明全国所有城市绝对最优；本机系统 DNS/浏览器可能在旧 TTL 到期前短暂保留此前 Cloudflare 地址，但公共主流解析器已收敛。
- next_substage: 生产观察与按需外部三网拨测。
- git_checkpoint: 基线为 6c0b73f；本次发布改动与本文件同批提交，提交哈希以 Git 记录为准。
