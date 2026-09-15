import React, { useState, useEffect } from 'react';
import { 
  Server, ShieldAlert, ClipboardCheck, ClipboardList, CheckCircle2, 
  AlertTriangle, RefreshCw, BarChart3, Database, Cable, CreditCard, 
  Layers, Users, Sparkles, Info, Heart, Bell
} from 'lucide-react';
import { LogEntry, HandoverItem, TodoItem, SystemStatus, IssueStatus, TodoStatus, NotificationSettings, EmailLog } from './types';
import { MetricCard } from './components/MetricCard';
import { SystemCard } from './components/SystemCard';
import { LogsPanel } from './components/LogsPanel';
import { HandoversPanel } from './components/HandoversPanel';
import { TodosPanel } from './components/TodosPanel';
import { AiReporter } from './components/AiReporter';
import { NotificationPanel } from './components/NotificationPanel';
import { 
  INITIAL_LOG_ENTRIES, 
  INITIAL_HANDOVER_ITEMS, 
  INITIAL_TODO_ITEMS, 
  CORE_SYSTEMS 
} from './mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs' | 'handovers' | 'todos' | 'ai' | 'notifications'>('dashboard');
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [handovers, setHandovers] = useState<HandoverItem[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  
  // 告警提醒和语音播报设置状态
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enableVoice: true,
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    voiceVolume: 1.0,
    enableEmailAlert: true,
    recipientEmail: 'damonxzhang703@gmail.com', // 自动匹配邮箱
  });
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  
  // 用于大盘筛选系统的联动
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<string>('');

  // 1. 初始化或从 LocalStorage 恢复
  useEffect(() => {
    const savedLogs = localStorage.getItem('unified_dashboard_logs');
    const savedHandovers = localStorage.getItem('unified_dashboard_handovers');
    const savedTodos = localStorage.getItem('unified_dashboard_todos');
    const savedSettings = localStorage.getItem('unified_dashboard_notify_settings');
    const savedEmailLogs = localStorage.getItem('unified_dashboard_email_logs');

    if (savedLogs && savedHandovers && savedTodos) {
      try {
        setLogs(JSON.parse(savedLogs));
        setHandovers(JSON.parse(savedHandovers));
        setTodos(JSON.parse(savedTodos));
      } catch (e) {
        loadDefaultMockData();
      }
    } else {
      loadDefaultMockData();
    }

    if (savedSettings) {
      try {
        setNotificationSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error(e);
      }
    }

    if (savedEmailLogs) {
      try {
        setEmailLogs(JSON.parse(savedEmailLogs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 语音播报方法
  const speakText = (text: string) => {
    if (notificationSettings.enableVoice && typeof window !== 'undefined' && window.speechSynthesis) {
      // 先停止当前的播报
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = notificationSettings.voiceVolume;
      utterance.rate = notificationSettings.voiceSpeed;
      utterance.pitch = notificationSettings.voicePitch;

      // 获取中文发音包
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  // 触发邮件告警日志
  const triggerEmailAlert = (subject: string, body: string, triggerType: 'manual' | 'auto_critical_log' | 'auto_critical_todo') => {
    if (!notificationSettings.enableEmailAlert) return;
    const newLog: EmailLog = {
      id: `email-${Date.now()}`,
      recipient: notificationSettings.recipientEmail,
      subject,
      body,
      sentAt: new Date().toISOString(),
      status: 'sent',
      triggerType,
    };
    const updated = [newLog, ...emailLogs];
    setEmailLogs(updated);
    localStorage.setItem('unified_dashboard_email_logs', JSON.stringify(updated));
  };

  const handleUpdateNotificationSettings = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    localStorage.setItem('unified_dashboard_notify_settings', JSON.stringify(newSettings));
  };

  const handleClearEmailLogs = () => {
    setEmailLogs([]);
    localStorage.removeItem('unified_dashboard_email_logs');
  };

  const handleTriggerTestEmail = () => {
    const activeMajorList = logs.filter(l => l.isMajorIssue && l.issueStatus !== 'resolved');
    const emailSubject = `📊【大屏即时汇报】当前系统运行日报与高急事故清册`;
    const emailBody = `【统一日志交接与监控系统 - 自动邮件网关】\n\n尊敬的 Damon Zhang：\n您好！这是由系统下发模块模拟推送的即时运营日报数据。\n\n----------------------------\n今日平均系统健康度: ${avgHealthScore} 分 / 100\n活动中重大故障: ${activeCriticalIssuesCount} 起\n未签收岗位交接单: ${pendingHandoversTotal} 项\n各团队未清结待办: ${uncompletedTodosTotal} 项\n----------------------------\n\n今日最焦急高危异常清册：\n${activeMajorList.length === 0 ? '暂无高危活动事故' : activeMajorList.map((m, i) => `${i+1}. 【${m.systemName}】 ${m.title} (进度: ${m.issueStatus})`).join('\n')}\n\n此日志由您于 [通知与语音中心] 点击“模拟下发测试”手动触发。SMTP测试通路握手 100% 成功。\n\n发送时间: ${new Date().toLocaleString('zh-CN')}`;
    triggerEmailAlert(emailSubject, emailBody, 'manual');
    alert(`测试告警邮件发送成功！已投递至 [${notificationSettings.recipientEmail}]，请在右侧下发监控台查看 HTML 格式。`);
  };


  // 保存至 LocalStorage
  const saveStateToLocalStorage = (newLogs: LogEntry[], newHandovers: HandoverItem[], newTodos: TodoItem[]) => {
    localStorage.setItem('unified_dashboard_logs', JSON.stringify(newLogs));
    localStorage.setItem('unified_dashboard_handovers', JSON.stringify(newHandovers));
    localStorage.setItem('unified_dashboard_todos', JSON.stringify(newTodos));
  };

  const loadDefaultMockData = () => {
    setLogs(INITIAL_LOG_ENTRIES);
    setHandovers(INITIAL_HANDOVER_ITEMS);
    setTodos(INITIAL_TODO_ITEMS);
    saveStateToLocalStorage(INITIAL_LOG_ENTRIES, INITIAL_HANDOVER_ITEMS, INITIAL_TODO_ITEMS);
  };

  const handleResetData = () => {
    if (confirm('确认重置系统数据吗？重置后，您在界面上的新增/修改记录将被还原为初始高保真模拟场景。')) {
      loadDefaultMockData();
      // 同时清空以前的AI诊断，确保同步
      localStorage.removeItem('unified_dashboard_last_ai_report');
      alert('数据已重置为初始演示状态！由于状态改变，若需要请重新生成 AI 汇报简报。');
    }
  };

  // 2. 日志修改逻辑
  const handleAddLog = (newLog: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const freshLog: LogEntry = {
      ...newLog,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [freshLog, ...logs];
    setLogs(updated);
    saveStateToLocalStorage(updated, handovers, todos);

    // 邮件与语音联动触发 (d)
    if (freshLog.issueSeverity === 'critical' || freshLog.isMajorIssue) {
      const speechMsg = `警告！核心监控检测到 ${freshLog.systemName} 发生重大特急事件：${freshLog.title}。请相关团队立刻介入排查！`;
      speakText(speechMsg);

      const emailSubject = `🚨【紧急事故自动告警】${freshLog.systemName} 爆发重大特急问题!`;
      const emailBody = `【统一日志交接与监控系统 - 自动邮件预警网关】\n\n您好：\n监控探针检测到符合指标的紧急特急事故！\n\n事件概要：\n- 系统名称: ${freshLog.systemName}\n- 归属处室: ${freshLog.department}\n- 上报标题: ${freshLog.title}\n- 级别: 🔴 严重事故 (Critical Severity)\n\n描述细则：\n${freshLog.content}\n\n系统建议您立刻召集该系统的负责团队，或者点击监控大屏将其指派为待办事件督办解决。\n\n发送时间: ${new Date().toLocaleString('zh-CN')}`;
      triggerEmailAlert(emailSubject, emailBody, 'auto_critical_log');
    }
  };

  const handleUpdateIssueStatus = (id: string, status: IssueStatus) => {
    const updated = logs.map(l => {
      if (l.id === id) {
        return { ...l, issueStatus: status };
      }
      return l;
    });
    setLogs(updated);
    saveStateToLocalStorage(updated, handovers, todos);
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter(l => l.id !== id);
    setLogs(updated);
    saveStateToLocalStorage(updated, handovers, todos);
  };

  // 3. 交接修改逻辑
  const handleAddHandover = (newH: Omit<HandoverItem, 'id' | 'createdAt' | 'completedAt' | 'status'>) => {
    const freshH: HandoverItem = {
      ...newH,
      id: `handover-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    const updated = [freshH, ...handovers];
    setHandovers(updated);
    saveStateToLocalStorage(logs, updated, todos);
  };

  const handleCompleteHandover = (id: string) => {
    const updated = handovers.map(h => {
      if (h.id === id) {
        return { ...h, status: 'completed' as const, completedAt: new Date().toISOString() };
      }
      return h;
    });
    setHandovers(updated);
    saveStateToLocalStorage(logs, updated, todos);
  };

  const handleDeleteHandover = (id: string) => {
    const updated = handovers.filter(h => h.id !== id);
    setHandovers(updated);
    saveStateToLocalStorage(logs, updated, todos);
  };

  // 4. 待办修改逻辑
  const handleAddTodo = (newT: Omit<TodoItem, 'id' | 'createdAt'>) => {
    const freshT: TodoItem = {
      ...newT,
      id: `todo-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [freshT, ...todos];
    setTodos(updated);
    saveStateToLocalStorage(logs, handovers, updated);

    // 邮件与语音联动触发 (a/c)
    if (freshT.priority === 'critical') {
      const speechMsg = `提醒！系统已自动委派特急待办事项给 ${freshT.department}，要求限期内对系统 ${freshT.systemName} 的事项进行闭环！`;
      speakText(speechMsg);

      const emailSubject = `⚠️【特急待办自动派发】向 ${freshT.department} 派发特急待办：${freshT.title}`;
      const emailBody = `【统一日志交接与监控系统 - 自动邮件预警网关】\n\n您好：\n系统已向您的团队委派了特急事项。\n\n事项概要：\n- 任务名称: ${freshT.title}\n- 分管系统: ${freshT.systemName}\n- 处室接收方: ${freshT.department}\n- 具体责任人: ${freshT.assignee}\n- 限期要求: ${new Date(freshT.deadline).toLocaleString('zh-CN')}\n\n请尽快登录大屏进入“团队待办清结”板块将该待办更新为【开始干】，并在解决后及时闭环销单。\n\n发送时间: ${new Date().toLocaleString('zh-CN')}`;
      triggerEmailAlert(emailSubject, emailBody, 'auto_critical_todo');
    }
  };

  const handleUpdateTodoStatus = (id: string, status: TodoStatus) => {
    const updated = todos.map(t => {
      if (t.id === id) {
        return { ...t, status };
      }
      return t;
    });
    setTodos(updated);
    saveStateToLocalStorage(logs, handovers, updated);
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);
    saveStateToLocalStorage(logs, handovers, updated);
  };

  // 5. 动态计算各系统状态指标 (健康分和事项统计)
  const calculateSystemStatuses = (): SystemStatus[] => {
    return CORE_SYSTEMS.map(sysName => {
      // 归属部门探测
      let deptName = '多部门协管';
      if (sysName === 'ERP核心业务系统' || sysName === '专线与网络骨干') {
        deptName = '运维管理处';
      } else if (sysName === '安全堡垒机') {
        deptName = '安全监控组';
      } else if (sysName === '统一支付网关') {
        deptName = '客户服务中心';
      } else if (sysName === '账单与结算中心') {
        deptName = '软件研发一部';
      }

      // 数据统计
      const sysLogs = logs.filter(l => l.systemName === sysName);
      const activeMajorLogs = sysLogs.filter(l => l.isMajorIssue && l.issueStatus !== 'resolved');
      const pendingHandovers = handovers.filter(h => h.systemName === sysName && h.status === 'pending');
      const uncompletedTodos = todos.filter(t => t.systemName === sysName && t.status !== 'done');

      // 动态健康分计算模型
      let score = 100;
      score -= activeMajorLogs.length * 15; // 重大未解决故障单扣15分
      score -= pendingHandovers.length * 3; // 待确认交接扣3分
      // 没干待办和进行中待办分档扣分
      const todoCount = todos.filter(t => t.systemName === sysName && t.status === 'todo').length;
      const inProgressCount = todos.filter(t => t.systemName === sysName && t.status === 'in_progress').length;
      score -= todoCount * 4;
      score -= inProgressCount * 2;

      score = Math.max(10, Math.min(100, score));

      return {
        systemName: sysName,
        department: deptName,
        healthScore: score,
        activeLogsCount: sysLogs.length,
        pendingHandoversCount: pendingHandovers.length,
        uncompletedTodosCount: uncompletedTodos.length,
        criticalIssuesCount: activeMajorLogs.length,
      };
    });
  };

  const systemStatuses = calculateSystemStatuses();

  // 全局汇总统计指标
  const activeCriticalIssuesCount = logs.filter(l => l.isMajorIssue && l.issueStatus !== 'resolved').length;
  const pendingHandoversTotal = handovers.filter(h => h.status === 'pending').length;
  const uncompletedTodosTotal = todos.filter(t => t.status !== 'done').length;
  const avgHealthScore = Math.round(
    systemStatuses.reduce((acc, curr) => acc + curr.healthScore, 0) / systemStatuses.length
  );

  // 今日最着急事项排序（待办 + 交接，按优先等级排：critical > high）
  const urgentItems = [
    ...todos.filter(t => t.status !== 'done' && (t.priority === 'critical' || t.priority === 'high')).map(t => ({
      id: t.id,
      type: 'todo' as const,
      title: `【待办】${t.title}`,
      priority: t.priority,
      team: t.department,
      system: t.systemName,
      detail: `责任人: ${t.assignee} | 截至: ${new Date(t.deadline).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`,
    })),
    ...handovers.filter(h => h.status === 'pending' && (h.priority === 'critical' || h.priority === 'high')).map(h => ({
      id: h.id,
      type: 'handover' as const,
      title: `【交接】${h.title}`,
      priority: h.priority,
      team: h.department,
      system: h.systemName,
      detail: `交接双方: ${h.fromStaff} ➜ ${h.toStaff}`,
    })),
  ].sort((a, b) => {
    const weight = { critical: 2, high: 1, medium: 0, low: -1 };
    return weight[b.priority] - weight[a.priority];
  });

  // 如果有严重故障，大屏顶端展示走马灯广告牌
  const activeMajorOutageList = logs.filter(l => l.isMajorIssue && l.issueStatus !== 'resolved');

  return (
    <div className="min-h-screen bg-gray-50/60 font-sans text-gray-900 pb-16">
      
      {/* 1. 紧急大事故警报跑马灯 */}
      {activeMajorOutageList.length > 0 && (
        <div id="outage-ticker" className="bg-red-600 text-white text-xs py-2 px-4 font-bold flex items-center justify-between shadow-md sticky top-0 z-50 animate-pulse">
          <div className="flex items-center space-x-2 truncate">
            <ShieldAlert className="w-4.5 h-4.5 animate-bounce flex-shrink-0" />
            <span>【重大高危故障警报】今日系统共检测到 {activeMajorOutageList.length} 起活动中的重大异常：</span>
            <span className="font-semibold underline">
              {activeMajorOutageList.map(item => `[${item.systemName}: ${item.title}]`).join(' | ')}
            </span>
          </div>
          <div className="text-xxs uppercase tracking-wider font-extrabold bg-red-800 px-2 py-0.5 rounded ml-2 shrink-0">
            急需领班确认 (d)
          </div>
        </div>
      )}

      {/* 2. 精致极简顶部导航栏 */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 shadow-xxs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-100/50">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                统一日志交接与监控系统
              </h1>
              <p className="text-xxs text-gray-500 font-medium">Unified Operations & Shift Handover Control</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 一键重置模拟数据 */}
            <button
              onClick={handleResetData}
              className="flex items-center px-3 py-1.5 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 text-xs font-semibold rounded-lg bg-white transition-all duration-150 cursor-pointer shadow-xxs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1 text-gray-400" />
              重置演示数据
            </button>
          </div>
        </div>
      </header>

      {/* 3. 大屏主干部分 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* 导航标签组 */}
        <div className="flex border-b border-gray-200/80 mb-6 space-x-2 sm:space-x-4 overflow-x-auto pb-px">
          {[
            { id: 'dashboard', label: '总览监控大屏', icon: BarChart3 },
            { id: 'logs', label: '源头日志大厅', icon: Database },
            { id: 'handovers', label: `班次岗位交接 (${pendingHandoversTotal})`, icon: ClipboardList },
            { id: 'todos', label: `团队待办清结 (${uncompletedTodosTotal})`, icon: ClipboardCheck },
            { id: 'ai', label: 'Gemini AI 智能报告', icon: Sparkles, highlight: true },
            { id: 'notifications', label: '通知与语音中心', icon: Bell },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  // 切换Tab时自动清空单系统大盘过滤
                  if (tab.id !== 'dashboard') {
                    setSelectedSystemFilter('');
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isSelected
                    ? tab.highlight 
                      ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                      : 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.highlight && !isSelected ? 'text-blue-500 animate-pulse' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. 各Tab视图宿主 */}
        
        {/* TAB 1: 总览监控大屏 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* KPI 指标排 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                id="kpi-health"
                title="全业务系统健康度"
                value={`${avgHealthScore} 分`}
                description="多系统高负荷运行/故障比值综合演算，正常基准 90+"
                icon={BarChart3}
                variant={avgHealthScore >= 90 ? 'success' : avgHealthScore >= 70 ? 'warning' : 'danger'}
              />
              <MetricCard
                id="kpi-issues"
                title="活动中重大大问题"
                value={`${activeCriticalIssuesCount} 起`}
                subValue={activeCriticalIssuesCount > 0 ? '需加急分配' : '安全平稳'}
                subValueColor={activeCriticalIssuesCount > 0 ? 'text-rose-600' : 'text-emerald-600'}
                description="影响生产业务可用性的重大红标故障（d）"
                icon={ShieldAlert}
                variant={activeCriticalIssuesCount > 0 ? 'danger' : 'default'}
              />
              <MetricCard
                id="kpi-handovers"
                title="悬挂岗位交接项"
                value={`${pendingHandoversTotal} 项`}
                subValue="白晚班切换中"
                description="处于待签接状态的岗位责任书，需接替人互签闭环（b）"
                icon={ClipboardList}
                variant={pendingHandoversTotal > 0 ? 'warning' : 'default'}
              />
              <MetricCard
                id="kpi-todos"
                title="各处团队未完待办"
                value={`${uncompletedTodosTotal} 项`}
                subValue="进行中或未开始"
                description="包含未开始及未干完的事项，反映各处效能积压（a）"
                icon={ClipboardCheck}
                variant={uncompletedTodosTotal > 5 ? 'warning' : 'default'}
              />
            </div>

            {/* 系统矩阵大盘 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200/80">
              <div className="border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">核心业务系统健康监控矩阵 (Matrix)</h2>
                  <p className="text-xs text-gray-500 mt-0.5">多处室核心系统一览无余，直接点击任意系统卡片即可追溯底层日志与待办</p>
                </div>
                <div className="text-xxs text-gray-400 font-bold flex items-center">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-1.5" />
                  正常运行 (90+)
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full ml-3 mr-1.5" />
                  预警 (70-89)
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full ml-3 mr-1.5" />
                  故障 (&lt;70)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systemStatuses.map((sysStatus) => (
                  <SystemCard
                    key={sysStatus.systemName}
                    id={`sys-card-${sysStatus.systemName}`}
                    status={sysStatus}
                    onSelectSystem={(sysName) => {
                      // 联动：进入对应的日志中心，并自动选中这个系统的日志
                      setSelectedSystemFilter(sysName);
                      setActiveTab('logs');
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 下方分栏：今日最着急事项(c) 与 CIO一句话简报 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* 最着急事项直通车 */}
              <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-gray-200/80 flex flex-col justify-between">
                <div>
                  <div className="border-b border-gray-100 pb-3 mb-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-2" />
                      (c) 今日最迫切工作事项 - 高急任务追溯
                    </h3>
                    <p className="text-xxs text-gray-400 mt-0.5">筛选出未完结的“特急 (critical)”与“紧急 (high)”等级待办或交接</p>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {urgentItems.length === 0 ? (
                      <div className="text-center p-8 text-gray-400 text-xs">
                        🎉 太棒了！今日暂无高急积压的事项，全部核心业务稳妥运行中。
                      </div>
                    ) : (
                      urgentItems.map((item, idx) => {
                        const isTodo = item.type === 'todo';
                        return (
                          <div
                            key={`${item.type}-${item.id}`}
                            className="p-3 bg-gray-50/60 rounded-lg border border-gray-200/40 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 text-xxs font-bold rounded ${
                                  isTodo ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                                }`}>
                                  {isTodo ? '待办任务' : '交接责任'}
                                </span>
                                <span className="text-xxs text-red-600 font-extrabold bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                                  {item.priority === 'critical' ? '特急' : '紧急'}
                                </span>
                                <span className="text-xxs text-gray-400">系统: {item.system}</span>
                              </div>
                              <p className="font-semibold text-gray-800 leading-normal">{item.title}</p>
                              <p className="text-xxs text-gray-500">{item.detail}</p>
                            </div>
                            <button
                              onClick={() => {
                                // 一键流转到对应的管理页
                                if (isTodo) {
                                  setActiveTab('todos');
                                } else {
                                  setActiveTab('handovers');
                                }
                              }}
                              className="text-xxs text-blue-600 font-bold hover:underline shrink-0 pt-0.5"
                            >
                              去处理 ➔
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-50 flex items-center justify-between text-xxs text-gray-400">
                  <span>高急事项需要领班或总协调人优先督办</span>
                  <span className="text-blue-600">共 {urgentItems.length} 项</span>
                </div>
              </div>

              {/* CIO智能运行决策中心预览入口 */}
              <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 to-indigo-950 p-6 rounded-xl text-white flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xxs text-blue-300 font-bold uppercase tracking-wider">老板决策专区 (Boss AI Hub)</span>
                    <h3 className="text-base font-bold flex items-center">
                      <Sparkles className="w-5 h-5 text-blue-400 mr-2 animate-pulse" />
                      Gemini AI 一键智能运营诊断
                    </h3>
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed">
                    有很多个分散的服务器和日志平台？信息太杂，格式不统一？
                  </p>
                  <p className="text-xs text-blue-200 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">
                    一键分析分散在<strong>运维处、研发部、安全组、客服中心</strong>的数据，提炼今日(a)谁事没干完、(b)还有哪些没交接、(c)哪些最火急、(d)出了什么大故障，并智能生成最适合发微信群汇报的 CEO 精美简报。
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('ai')}
                  className="mt-6 w-full py-2.5 bg-white hover:bg-blue-50 text-blue-900 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  进入 AI 智能汇总诊断中心 ➔
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: 源头日志大厅 */}
        {activeTab === 'logs' && (
          <div className="animate-fade-in">
            {/* 允许大盘带过来的过滤逻辑 */}
            {selectedSystemFilter && (
              <div className="mb-4 bg-blue-50 border border-blue-200 text-xs p-3 rounded-lg flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  📌 当前正在监控过滤大盘卡片关联的核心系统：<strong>{selectedSystemFilter}</strong> 的日志
                </span>
                <button
                  onClick={() => setSelectedSystemFilter('')}
                  className="text-blue-600 hover:text-blue-800 font-bold text-xxs"
                >
                  [清除过滤，看全网日志]
                </button>
              </div>
            )}
            <LogsPanel
              id="logs-manager"
              logs={selectedSystemFilter ? logs.filter(l => l.systemName === selectedSystemFilter) : logs}
              onAddLog={handleAddLog}
              onUpdateIssueStatus={handleUpdateIssueStatus}
              onDeleteLog={handleDeleteLog}
            />
          </div>
        )}

        {/* TAB 3: 岗位交接单 */}
        {activeTab === 'handovers' && (
          <div className="animate-fade-in">
            <HandoversPanel
              id="handovers-manager"
              handovers={handovers}
              onAddHandover={handleAddHandover}
              onCompleteHandover={handleCompleteHandover}
              onDeleteHandover={handleDeleteHandover}
            />
          </div>
        )}

        {/* TAB 4: 团队待办清结 */}
        {activeTab === 'todos' && (
          <div className="animate-fade-in">
            <TodosPanel
              id="todos-manager"
              todos={todos}
              onAddTodo={handleAddTodo}
              onUpdateTodoStatus={handleUpdateTodoStatus}
              onDeleteTodo={handleDeleteTodo}
            />
          </div>
        )}

        {/* TAB 5: AI 汇报中心 */}
        {activeTab === 'ai' && (
          <div className="animate-fade-in">
            <AiReporter
              id="ai-reporter"
              logs={logs}
              handovers={handovers}
              todos={todos}
            />
          </div>
        )}

        {/* TAB 6: 通知与语音中心 */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-in">
            <NotificationPanel
              id="notifications-manager"
              settings={notificationSettings}
              onUpdateSettings={handleUpdateNotificationSettings}
              emailLogs={emailLogs}
              onClearEmailLogs={handleClearEmailLogs}
              onTriggerTestEmail={handleTriggerTestEmail}
            />
          </div>
        )}

      </main>

      {/* 5. 简约页脚，突出工匠精神，不搞AI Slop */}
      <footer className="mt-16 border-t border-gray-200/60 bg-white/60 py-6 text-center text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-gray-500">统一日志交接与监控系统</p>
        <p className="flex items-center justify-center text-xxs">
          专为管理层量身定制的多端聚合与运行态势分析平台 · 拒绝 AI Slop 的精心设计
        </p>
        <div className="pt-2 text-xxs text-gray-300">
          Powered by Gemini 3.8-flash & Antigravity Platform
        </div>
      </footer>
    </div>
  );
}
