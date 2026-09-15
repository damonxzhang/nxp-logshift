import React, { useState, useEffect } from 'react';
import { LogEntry, HandoverItem, TodoItem, AiSummaryReport } from '../types';
import { Sparkles, Activity, ShieldAlert, CheckCircle, Copy, FileText, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

interface AiReporterProps {
  id: string;
  logs: LogEntry[];
  handovers: HandoverItem[];
  todos: TodoItem[];
}

export const AiReporter: React.FC<AiReporterProps> = ({ id, logs, handovers, todos }) => {
  const [report, setReport] = useState<AiSummaryReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 从 LocalStorage 恢复上次的诊断快照
  useEffect(() => {
    const savedReport = localStorage.getItem('unified_dashboard_last_ai_report');
    if (savedReport) {
      try {
        const parsed = JSON.parse(savedReport);
        setReport(parsed.report);
        setIsAiGenerated(parsed.isAiGenerated);
      } catch (e) {
        console.error('Failed to parse saved AI report', e);
      }
    }
  }, []);

  const triggerAnalysis = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs, handovers, todos }),
      });

      if (!response.ok) {
        throw new Error('网络响应异常，智能研判服务暂时不可用');
      }

      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
        setIsAiGenerated(data.isAiGenerated);
        // 保存快照
        localStorage.setItem(
          'unified_dashboard_last_ai_report',
          JSON.stringify({ report: data.report, isAiGenerated: data.isAiGenerated })
        );
      } else {
        throw new Error(data.error || '后端研判算法发生未知错误');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      setErrorMsg(error.message || '连接服务器超时，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!report) return;

    const text = `【统一日志交接与监控大屏 - CEO每日简报】
生成时间: ${new Date(report.generatedAt || new Date()).toLocaleString('zh-CN')}
诊断模式: ${isAiGenerated ? 'Gemini AI 智能研判' : '系统内置专家系统诊断'}

====================================
📊 今日整体健康度: ${report.overallHealthScore} 分
⚠️ 今日整体风险级: ${report.overallRiskLevel.toUpperCase()} 风险
🎯 核心大局观摘要: 
${report.oneSentenceSummary}

====================================
🚨 (d) 重大问题与故障研判 (出了什么大问题):
${report.criticalIssuesAnalysis
  .map(
    (issue, i) =>
      `${i + 1}. 【${issue.system}】${issue.title}
   * 业务影响: ${issue.impact}
   * 处置建议: ${issue.suggestion}`
  )
  .join('\n\n')}

====================================
🛠️ (a) 团队未完工事项警报 (哪个系统哪个团队有什么事没干完):
${report.uncompletedTasksAlert
  .map(
    (task, i) =>
      `${i + 1}. 【${task.team} / ${task.systemName}】有 ${task.count} 项待办未闭环
   * 状态明细: ${task.details}`
  )
  .join('\n\n')}

====================================
🔄 (b) 岗位交接链路漏洞 (还有哪些事项要交接/着急程度):
${report.handoverGaps
  .map(
    (gap, i) =>
      `${i + 1}. 交接单: ${gap.title} (交接方: ${gap.fromStaff} -> ${gap.toStaff})
   * 潜在隐患: ${gap.risk}`
  )
  .join('\n\n')}

====================================
💡 (c/d) 首席运行官CIO管理建议:
${report.managementRecommendation}

------------------------------------
*此简报由统一日志交接大屏一键合成，可直接用于微信工作群、日报汇总汇报。*`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRiskBadge = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200 font-extrabold';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-500';
    return 'text-rose-600';
  };

  return (
    <div id={id} className="space-y-6">
      {/* 触发卡片 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-xxs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 flex-1">
            <h2 className="text-base font-bold text-gray-900 flex items-center">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2 animate-pulse" />
              Gemini AI 智能汇总与决策研判
            </h2>
            <p className="text-xs text-gray-500">
              一键分析当前分散的日志流、岗位交接单、各处室待办，为老板提炼今日大局指数、重大漏洞，并一键合成向老板汇报的精美工作简报。
            </p>
          </div>
          <button
            id={`${id}-trigger-btn`}
            onClick={triggerAnalysis}
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                正在进行全系统研判...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                一键生成智能分析与汇报材料
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
            {errorMsg}
          </div>
        )}
      </div>

      {/* 报告详情展示 */}
      {report ? (
        <div className="space-y-6 animate-fade-in">
          {/* 大局评分卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 健康分 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200/80 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xxs text-gray-400 font-medium tracking-wide uppercase">今日系统健康分</span>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-3xl font-black ${getHealthScoreColor(report.overallHealthScore)}`}>
                    {report.overallHealthScore}
                  </span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
                <p className="text-xxs text-gray-500">根据活动事故及未清待办多维度评估</p>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl text-gray-500">
                <Activity className="w-6 h-6" />
              </div>
            </div>

            {/* 风险级别 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200/80 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xxs text-gray-400 font-medium tracking-wide uppercase">今日全局风险定级</span>
                <div>
                  <span className={`px-3 py-1 text-xs font-bold rounded border ${getRiskBadge(report.overallRiskLevel)}`}>
                    {report.overallRiskLevel === 'high' ? 'HIGH / 高风险' : report.overallRiskLevel === 'medium' ? 'MEDIUM / 中风险' : 'LOW / 常态运行'}
                  </span>
                </div>
                <p className="text-xxs text-gray-500">系统间连带故障及交接风险加权系数</p>
              </div>
              <div className="p-3.5 bg-gray-50 rounded-xl text-gray-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

            {/* 一键复制组件 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200/80 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xxs text-gray-400 font-medium uppercase">汇报材料快速分发</span>
                <p className="text-xs text-gray-600">已自动为您编排好精美的文字简报，方便复制粘贴至群聊汇报。</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xxs font-bold rounded-lg transition-colors cursor-pointer border border-gray-200"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                    已成功复制到剪贴板！
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    一键复制微信/邮件汇报文本
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 核心一句话摘要 */}
          <div className="p-4 bg-blue-50/50 border border-blue-100/60 rounded-xl">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center">
              <FileText className="w-4 h-4 mr-1.5" />
              CEO / 决策者一秒大局观 brief
            </h3>
            <p className="text-xs text-blue-950 leading-relaxed font-semibold">
              {report.oneSentenceSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 重大异常监控与研判 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200/80 space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center">
                  <span className="w-1.5 h-3.5 bg-red-600 rounded-xs mr-2" />
                  (d) 出了什么大问题 - 重点业务故障诊断
                </h3>
                <p className="text-xxs text-gray-400 mt-0.5">针对当前标红的“重大异常”进行根因提炼与治理建议</p>
              </div>
              <div className="space-y-4">
                {report.criticalIssuesAnalysis.map((issue, idx) => (
                  <div key={idx} className="p-3.5 bg-red-50/30 rounded-lg border border-red-100/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-950">{issue.title}</span>
                      <span className="text-xxs bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 font-bold">{issue.system}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong className="text-red-900">业务窒息度:</strong> {issue.impact}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong className="text-emerald-900">AI研判建议:</strong> {issue.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 团队待办清结情况 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200/80 space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center">
                  <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs mr-2" />
                  (a) 哪个系统/哪个团队有事没干完 - 效能红黑榜
                </h3>
                <p className="text-xxs text-gray-400 mt-0.5">多团队待办积压和未完工项（todo + in_progress）穿透剖析</p>
              </div>
              <div className="space-y-3.5">
                {report.uncompletedTasksAlert.map((task, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200/60 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs text-gray-900">{task.team}</strong>
                      <span className="text-xxs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                        {task.count} 个阻塞项
                      </span>
                    </div>
                    <p className="text-xxs text-gray-400">分管核心系统: {task.systemName}</p>
                    <p className="text-xs text-gray-600 leading-normal">{task.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 交接断层漏洞 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200/80 space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center">
                  <span className="w-1.5 h-3.5 bg-amber-500 rounded-xs mr-2" />
                  (b/c) 还有哪些事项要交接 - 班次交接黑洞监控
                </h3>
                <p className="text-xxs text-gray-400 mt-0.5">诊断悬挂在“待签领 (pending)”的高急交接单，预警真空隐患</p>
              </div>
              <div className="space-y-3.5">
                {report.handoverGaps.map((gap, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/20 border border-amber-200/40 rounded-lg space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-gray-800 leading-tight">{gap.title}</span>
                      <span className="text-xxs text-amber-800 bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200/80 font-bold shrink-0">
                        {gap.fromStaff} ➜ {gap.toStaff}
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed bg-amber-50/50 p-2 rounded-md">
                      <strong className="font-bold">漏洞预定:</strong> {gap.risk}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 首席运营决策建议 */}
            <div className="bg-white p-5 rounded-xl border border-gray-200/80 space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center">
                  <span className="w-1.5 h-3.5 bg-purple-600 rounded-xs mr-2" />
                  CIO 首席信息官运营调优建议
                </h3>
                <p className="text-xxs text-gray-400 mt-0.5">从全局治理、人员排班、流程优化方面给老板的管理智慧</p>
              </div>
              <div className="p-4 bg-purple-50/30 border border-purple-100/60 rounded-xl">
                <p className="text-xs text-purple-950 leading-relaxed whitespace-pre-line font-medium">
                  {report.managementRecommendation}
                </p>
              </div>
            </div>
          </div>

          {/* 脚部声明 */}
          <div className="flex justify-between items-center text-xxs text-gray-400 px-1 pt-1">
            <span>
              诊断来源: {isAiGenerated ? (
                <span className="text-blue-600 font-bold">● Gemini 3.8-flash 智能实时计算</span>
              ) : (
                <span className="text-gray-500 font-bold">● Heuristic Rule 启发式专家库</span>
              )}
            </span>
            <span>算法版本: v1.2.0 (全栈融合)</span>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-gray-200/80 text-center space-y-3">
          <div className="inline-flex p-3 bg-gray-50 rounded-full text-gray-400">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-xs text-gray-600 font-medium">
            目前尚未产生诊断汇总报告。请点击右上角【一键生成智能分析与汇报材料】。
          </p>
          <p className="text-xxs text-gray-400 max-w-sm mx-auto">
            系统会自动把底层多处的“日志事件”、“待办事项”、“交接情况”汇总并投喂给 AI 大模型，全方位排查(a)(b)(c)(d)四个层面的风险隐患。
          </p>
        </div>
      )}
    </div>
  );
};
