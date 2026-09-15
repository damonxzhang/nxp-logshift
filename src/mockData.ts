import { LogEntry, HandoverItem, TodoItem } from './types';

export const INITIAL_LOG_ENTRIES: LogEntry[] = [
  {
    id: 'log-1',
    department: '运维管理处',
    systemName: 'ERP核心业务系统',
    title: 'ERP核心库触发高频死锁告警',
    content: '今日 10:15 起，ERP主数据库在高频写入期间频繁发生 Table Lock 冲突，已自动重启死锁解决进程 5 次。影响了华东区订单的出库延迟，最大延迟 12 分钟。目前已临时扩容主库连接池。',
    reporter: '张伟 (资深DBA)',
    timestamp: '2026-09-15T10:30:00Z',
    isMajorIssue: true, // 出重大问题
    issueStatus: 'resolving', // 解决中
    issueSeverity: 'critical',
  },
  {
    id: 'log-2',
    department: '安全监控组',
    systemName: '安全堡垒机',
    title: '检测到来自外部IP段的越权扫描',
    content: '堡垒机于 11:00 监听到持续的 22 端口爆破和 443 端口反向扫描。防火墙已成功自动封禁该段 B 级 IP，安全策略已提升。暂无数据泄露和侵入迹象。',
    reporter: '李娜 (安全专家)',
    timestamp: '2026-09-15T11:15:00Z',
    isMajorIssue: false,
    issueStatus: 'none',
    issueSeverity: 'warning',
  },
  {
    id: 'log-3',
    department: '客户服务中心',
    systemName: '统一支付网关',
    title: '接到多起用户微信扫码支付502报错反馈',
    content: '客服接线员陆续收到 18 起报障，用户在收银台结账时微信支付转圈并抛出“502 Bad Gateway”错误，支付宝正常。经查是微信回调网关的 DNS 解析不稳定导致。已联系网络服务商处理。',
    reporter: '王芳 (客服组长)',
    timestamp: '2026-09-15T09:40:00Z',
    isMajorIssue: true, // 出大问题
    issueStatus: 'pending', // 挂起挂决
    issueSeverity: 'critical',
  },
  {
    id: 'log-4',
    department: '软件研发一部',
    systemName: '账单与结算中心',
    title: '账单月结跑批性能调优包上线',
    content: '昨晚 23:00 完成了本月结账优化包 (v3.4.1) 的无缝热发布，经早班观察，日切结算时间由原来的 4.5 小时降至 2.1 小时，内存占用趋于平稳，符合预期。',
    reporter: '赵强 (研发负责人)',
    timestamp: '2026-09-15T08:10:00Z',
    isMajorIssue: false,
    issueStatus: 'none',
    issueSeverity: 'info',
  },
  {
    id: 'log-5',
    department: '运维管理处',
    systemName: '专线与网络骨干',
    title: '深圳灾备机房专线光纤抖动',
    content: '接到电信反馈，深港光缆因市政施工有轻微机械压迫导致抖动，丢包率飙升至 8%。目前已将备用路由切换至联通 BGP 链路，主专线仍在阻断测试中。',
    reporter: '孙明 (网络工程师)',
    timestamp: '2026-09-15T12:05:00Z',
    isMajorIssue: true, // 重大问题
    issueStatus: 'resolving',
    issueSeverity: 'critical',
  }
];

export const INITIAL_HANDOVER_ITEMS: HandoverItem[] = [
  {
    id: 'handover-1',
    department: '运维管理处',
    systemName: 'ERP核心业务系统',
    title: 'ERP扩容节点负载均衡证书到期交接',
    content: 'ERP新注册的 4 个集群节点使用的 SSL 证书将于 9 月 17 日到期。我已经把购买好的新证书放在了堡垒机 /tmp/certs/ 下，需晚班接替人完成 nginx 的热重载和配置测试。',
    fromStaff: '张伟 (运维白班)',
    toStaff: '刘杰 (运维晚班)',
    priority: 'high', // 优先级
    status: 'pending', // 待交接
    createdAt: '2026-09-15T10:00:00Z',
    completedAt: null,
  },
  {
    id: 'handover-2',
    department: '安全监控组',
    systemName: '安全堡垒机',
    title: '堡垒机黑名单临时放行说明',
    content: '由于软件研发一部今天下午要压测账单系统，我临时将 IP [192.168.4.150] 加入了白名单。明天早上 9:00 前必须把它重新拉黑，防止暴露非必要的开发端口。',
    fromStaff: '李娜 (安全白班)',
    toStaff: '陈刚 (安全晚班)',
    priority: 'medium',
    status: 'pending',
    createdAt: '2026-09-15T11:30:00Z',
    completedAt: null,
  },
  {
    id: 'handover-3',
    department: '软件研发一部',
    systemName: '账单与结算中心',
    title: '结算差错调账核对交接',
    content: '今天上午微信通道有 3 笔因 DNS 抖动导致的回调异常，我已经在后台进行了系统补单，但还剩下 1 笔 240 元的交易需要财务晚班手工核对。流水号已经发在交接表单，请务必跟踪。',
    fromStaff: '赵强 (研发主管)',
    toStaff: '财务核对组-小梅',
    priority: 'high',
    status: 'pending',
    createdAt: '2026-09-15T12:10:00Z',
    completedAt: null,
  },
  {
    id: 'handover-4',
    department: '客户服务中心',
    systemName: '统一支付网关',
    title: '微信502故障期间VIP退款催办交接',
    content: '今天支付异常期间有 2 位高客 (VIP10) 在微信扫码支付时由于扣款但未出票，发起了紧急退款。我已经流转到了财务出纳，晚班值班客服需要每 2 小时通过电话回访跟进，消除舆情风险。',
    fromStaff: '王芳 (客服白班)',
    toStaff: '周敏 (客服晚班)',
    priority: 'high',
    status: 'pending',
    createdAt: '2026-09-15T12:15:00Z',
    completedAt: null,
  },
  {
    id: 'handover-5',
    department: '运维管理处',
    systemName: '专线与网络骨干',
    title: '网络备用备线链路带宽限额监控',
    content: '由于网络由电信主线切到了联通备线，目前联通备用带宽只有 100M。已经限制了非业务类的多媒体和下载流量。晚班网络工程师陈建需每隔一小时监控一次骨干流量，若超出 85% 需进一步下调研发环境出口限速。',
    fromStaff: '孙明 (网络白班)',
    toStaff: '陈建 (网络晚班)',
    priority: 'critical', // 特急
    status: 'pending',
    createdAt: '2026-09-15T12:20:00Z',
    completedAt: null,
  },
  {
    id: 'handover-6',
    department: '软件研发一部',
    systemName: 'ERP核心业务系统',
    title: 'ERP月度对账缓存清理',
    content: '昨晚跑批跑完后，有些数据被缓存在了 Redis 第 5 库。我已经手动做了一次清理，确认今日清晨报表数据正确。此项例行交接已成功验证完毕。',
    fromStaff: '赵强',
    toStaff: '运维组',
    priority: 'low',
    status: 'completed', // 已完成交接
    createdAt: '2026-09-14T18:00:00Z',
    completedAt: '2026-09-15T01:30:00Z',
  }
];

export const INITIAL_TODO_ITEMS: TodoItem[] = [
  {
    id: 'todo-1',
    department: '运维管理处',
    systemName: 'ERP核心业务系统',
    title: '排查ERP数据库慢查询并补充索引',
    priority: 'high', // 紧急
    assignee: '张伟 (资深DBA)',
    status: 'in_progress', // 进行中 (没干完)
    deadline: '2026-09-15T18:00:00Z',
    createdAt: '2026-09-15T08:30:00Z',
  },
  {
    id: 'todo-2',
    department: '运维管理处',
    systemName: '专线与网络骨干',
    title: '协同电信工程师修复深圳专线压迫光纤',
    priority: 'critical', // 特急
    assignee: '孙明 (网络处)',
    status: 'in_progress', // 进行中 (没干完)
    deadline: '2026-09-16T12:00:00Z',
    createdAt: '2026-09-15T12:10:00Z',
  },
  {
    id: 'todo-3',
    department: '软件研发一部',
    systemName: '统一支付网关',
    title: '微信支付网关域名解析切换备用DNS集群',
    priority: 'high',
    assignee: '刘华 (网络组研发)',
    status: 'todo', // 未开始 (没干)
    deadline: '2026-09-15T16:00:00Z',
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'todo-4',
    department: '安全监控组',
    systemName: '安全堡垒机',
    title: '对恶意扫描的IP所属段进行全网流量特征捕获',
    priority: 'medium',
    assignee: '李娜 (安全组)',
    status: 'todo', // 未开始 (没干)
    deadline: '2026-09-16T17:00:00Z',
    createdAt: '2026-09-15T11:20:00Z',
  },
  {
    id: 'todo-5',
    department: '客户服务中心',
    systemName: '统一支付网关',
    title: '发布官方公告解释今日部分微信支付抖动原因',
    priority: 'medium',
    assignee: '王芳 (公关与客服经理)',
    status: 'todo', // 未开始 (没干)
    deadline: '2026-09-15T15:00:00Z',
    createdAt: '2026-09-15T10:15:00Z',
  },
  {
    id: 'todo-6',
    department: '软件研发一部',
    systemName: '账单与结算中心',
    title: '跑批优化v3.4.1上线后内存监控与垃圾回收调优',
    priority: 'low',
    assignee: '赵强 (研发一部)',
    status: 'done', // 已完成
    deadline: '2026-09-15T10:00:00Z',
    createdAt: '2026-09-15T08:00:00Z',
  }
];

// 所有可供选择的部门
export const DEPARTMENTS = [
  '运维管理处',
  '软件研发一部',
  '安全监控组',
  '客户服务中心'
];

// 所有可供选择的核心系统
export const CORE_SYSTEMS = [
  'ERP核心业务系统',
  '统一支付网关',
  '账单与结算中心',
  '安全堡垒机',
  '专线与网络骨干'
];
