/**
 * Log Handover & Monitoring System Core Types
 */

export type Priority = 'critical' | 'high' | 'medium' | 'low'; // 特急 | 紧急 | 普通 | 较低
export type HandoverStatus = 'pending' | 'completed'; // 待交接 | 已完成
export type TodoStatus = 'todo' | 'in_progress' | 'done'; // 未开始 | 进行中 | 已完成
export type IssueStatus = 'pending' | 'resolving' | 'resolved' | 'none'; // 挂起未决 | 解决中 | 已解决 | 无故障

export interface LogEntry {
  id: string;
  department: string; // 哪个处/团队，如：运维处、网络组、研发部、安全组、客服中心
  systemName: string; // 哪个系统，如：ERP系统、支付网关、核心数据库、账单系统、负载均衡
  title: string;
  content: string;
  reporter: string;
  timestamp: string;
  isMajorIssue: boolean; // 是否属于“出了什么大问题” (d)
  issueStatus: IssueStatus;
  issueSeverity: 'info' | 'warning' | 'critical';
}

export interface HandoverItem {
  id: string;
  department: string;
  systemName: string;
  title: string;
  content: string;
  fromStaff: string; // 交接人
  toStaff: string; // 接替人
  priority: Priority; // 优先级 (c)
  status: HandoverStatus; // 状态 (b)
  createdAt: string;
  completedAt: string | null;
}

export interface TodoItem {
  id: string;
  department: string;
  systemName: string;
  title: string;
  priority: Priority; // 优先级 (c)
  assignee: string; // 指派人/责任人
  status: TodoStatus; // 状态 (a) - 未干、没干完、已完成
  deadline: string;
  createdAt: string;
}

export interface SystemStatus {
  systemName: string;
  department: string;
  healthScore: number;
  activeLogsCount: number;
  pendingHandoversCount: number;
  uncompletedTodosCount: number;
  criticalIssuesCount: number;
}

// AI 智能分析报告结构
export interface AiSummaryReport {
  overallHealthScore: number; // 整体健康分 (0-100)
  overallRiskLevel: 'high' | 'medium' | 'low'; // 今日整体风险级别
  oneSentenceSummary: string; // 核心一句话摘要，给老板大局观
  criticalIssuesAnalysis: Array<{
    title: string;
    system: string;
    impact: string;
    suggestion: string;
  }>; // (d) 出了什么大问题研判
  uncompletedTasksAlert: Array<{
    team: string;
    systemName: string;
    count: number;
    details: string;
  }>; // (a) 哪个团队哪个系统有什么事没干完
  handoverGaps: Array<{
    title: string;
    fromStaff: string;
    toStaff: string;
    risk: string;
  }>; // (b) 还有哪些交接事项以及可能得断层
  managementRecommendation: string; // 给老板的管理和决策建议
  generatedAt: string;
}

// 邮件与语音播报配置类型
export interface NotificationSettings {
  enableVoice: boolean; // 开启语音播报
  voiceSpeed: number; // 语速 (0.5 - 2)
  voicePitch: number; // 音调 (0.5 - 2)
  voiceVolume: number; // 音量 (0 - 1)
  enableEmailAlert: boolean; // 开启高危邮件提醒
  recipientEmail: string; // 默认接收人
}

// 模拟发送邮件记录类型
export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'failed';
  triggerType: 'manual' | 'auto_critical_log' | 'auto_critical_todo';
}

