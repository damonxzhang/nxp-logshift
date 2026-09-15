import React, { useState } from 'react';
import { LogEntry, IssueStatus } from '../types';
import { DEPARTMENTS, CORE_SYSTEMS } from '../mockData';
import { AlertCircle, Plus, Search, ShieldAlert, CheckCircle2, RefreshCw, X } from 'lucide-react';

interface LogsPanelProps {
  id: string;
  logs: LogEntry[];
  onAddLog: (log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  onUpdateIssueStatus: (id: string, status: IssueStatus) => void;
  onDeleteLog: (id: string) => void;
}

export const LogsPanel: React.FC<LogsPanelProps> = ({
  id,
  logs,
  onAddLog,
  onUpdateIssueStatus,
  onDeleteLog,
}) => {
  const [filterDept, setFilterDept] = useState<string>('');
  const [filterSystem, setFilterSystem] = useState<string>('');
  const [filterMajorOnly, setFilterMajorOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newDept, setNewDept] = useState<string>(DEPARTMENTS[0]);
  const [newSystem, setNewSystem] = useState<string>(CORE_SYSTEMS[0]);
  const [newReporter, setNewReporter] = useState<string>('');
  const [newIsMajor, setNewIsMajor] = useState<boolean>(false);
  const [newSeverity, setNewSeverity] = useState<'info' | 'warning' | 'critical'>('info');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newReporter.trim()) {
      alert('请完整填写日志标题、内容及记录人！');
      return;
    }
    onAddLog({
      department: newDept,
      systemName: newSystem,
      title: newTitle,
      content: newContent,
      reporter: newReporter,
      isMajorIssue: newIsMajor,
      issueStatus: newIsMajor ? 'pending' : 'none',
      issueSeverity: newIsMajor ? 'critical' : newSeverity,
    });
    // 重置
    setNewTitle('');
    setNewContent('');
    setNewReporter('');
    setNewIsMajor(false);
    setNewSeverity('info');
    setShowAddForm(false);
  };

  const filteredLogs = logs.filter((log) => {
    const matchDept = !filterDept || log.department === filterDept;
    const matchSystem = !filterSystem || log.systemName === filterSystem;
    const matchMajor = !filterMajorOnly || log.isMajorIssue;
    const matchSearch =
      !searchQuery ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reporter.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDept && matchSystem && matchMajor && matchSearch;
  });

  return (
    <div id={id} className="space-y-6">
      {/* 控制栏与过滤 */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-gray-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">日志与大事件监控</h2>
            <p className="text-xs text-gray-500 mt-0.5">汇总各个服务器和子部门同步的运行日志与故障警报</p>
          </div>
          <button
            id={`${id}-add-btn`}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors duration-150"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            手动录入日志/大事件
          </button>
        </div>

        {/* 过滤器 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
          {/* 模糊搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id={`${id}-search-input`}
              type="text"
              placeholder="搜索日志标题/内容/记录人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 部门筛选 */}
          <select
            id={`${id}-filter-dept`}
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
          >
            <option value="">所有来源部门</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* 系统筛选 */}
          <select
            id={`${id}-filter-sys`}
            value={filterSystem}
            onChange={(e) => setFilterSystem(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
          >
            <option value="">所有核心系统</option>
            {CORE_SYSTEMS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* 只看重大事故 */}
          <label className="flex items-center space-x-2.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer">
            <input
              id={`${id}-filter-major`}
              type="checkbox"
              checked={filterMajorOnly}
              onChange={(e) => setFilterMajorOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
            />
            <span className="text-xs text-red-600 font-semibold flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              仅看【重大大问题】(d)
            </span>
          </label>
        </div>
      </div>

      {/* 录入新日志弹窗/卡片 */}
      {showAddForm && (
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-900">新日志事件录入</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">日志标题 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：主交换机高负荷运行或ERP OOM异常"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">记录人 *</label>
                <input
                  type="text"
                  required
                  placeholder="姓名 (岗位/称谓)"
                  value={newReporter}
                  onChange={(e) => setNewReporter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">来源部门</label>
                <select
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">关联核心系统</label>
                <select
                  value={newSystem}
                  onChange={(e) => setNewSystem(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {CORE_SYSTEMS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">事件等级</label>
                <select
                  disabled={newIsMajor}
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="info">常规信息 (Info)</option>
                  <option value="warning">中度警告 (Warning)</option>
                  <option value="critical">高度严重 (Critical)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">事件具体详述 *</label>
              <textarea
                required
                rows={3}
                placeholder="请详细叙述故障的起因、影响面、解决手段以及当前处置状态..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 核心标记：是否是重大问题 */}
            <div className="p-3 bg-red-50/50 rounded-lg border border-red-100/80 flex items-start space-x-3">
              <input
                id="add-log-is-major"
                type="checkbox"
                checked={newIsMajor}
                onChange={(e) => {
                  setNewIsMajor(e.target.checked);
                  if (e.target.checked) {
                    setNewSeverity('critical');
                  }
                }}
                className="mt-0.5 rounded text-red-600 focus:ring-red-500 h-4.5 w-4.5 border-red-300"
              />
              <div>
                <label htmlFor="add-log-is-major" className="text-xs font-bold text-red-700 block cursor-pointer">
                  标记此事件为“重大问题 / 重大故障”
                </label>
                <span className="text-xxs text-red-600 mt-0.5 block leading-normal">
                  勾选后，系统会自动将其定义为老板最关心的“出了什么大问题” (d)，置顶在大屏监控流，并强制开启红色警报机制。
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                保存提交
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 日志监控列表流 */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-gray-200/80 text-gray-400 text-xs">
            暂无匹配筛选条件的日志记录。您可以在上方手动录入一条！
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isMajor = log.isMajorIssue;
            const cardBg = isMajor ? 'bg-red-50/30 border-red-200' : 'bg-white border-gray-200/80';
            const textBadgeColor =
              log.issueSeverity === 'critical'
                ? 'bg-red-100 text-red-700 border-red-200'
                : log.issueSeverity === 'warning'
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-blue-100 text-blue-700 border-blue-200';

            return (
              <div
                key={log.id}
                id={`log-card-${log.id}`}
                className={`p-5 rounded-xl border transition-all duration-150 ${cardBg}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 text-xxs font-medium rounded-full bg-gray-100 border border-gray-200 text-gray-600">
                        {log.department}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{log.systemName}</span>
                      {isMajor && (
                        <span className="px-2 py-0.5 text-xxs font-bold rounded-full bg-red-600 text-white flex items-center shadow-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          重大问题标记
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xxs font-medium rounded-full border ${textBadgeColor}`}>
                        {log.issueSeverity.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 pt-1">{log.title}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-xxs text-gray-400">
                      {new Date(log.timestamp).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 font-medium">记录人: {log.reporter}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{log.content}</p>

                {/* 如果是大问题，展示事故流转状态 */}
                {isMajor && (
                  <div className="mt-4 p-3 bg-red-100/20 border border-red-200/40 rounded-lg flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xxs text-red-800 font-bold">事故当前状态：</span>
                      <span
                        className={`px-2.5 py-0.5 text-xxs font-bold rounded border ${
                          log.issueStatus === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : log.issueStatus === 'resolving'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {log.issueStatus === 'resolved' && '已妥善解决'}
                        {log.issueStatus === 'resolving' && '正在加急处理中'}
                        {log.issueStatus === 'pending' && '挂起等待分配'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-xxs text-gray-500 mr-1">更新进展：</span>
                      <button
                        onClick={() => onUpdateIssueStatus(log.id, 'resolving')}
                        className={`px-2 py-1 text-xxs rounded transition-colors ${
                          log.issueStatus === 'resolving'
                            ? 'bg-amber-600 text-white font-semibold'
                            : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-600'
                        }`}
                      >
                        <RefreshCw className="w-3 h-3 inline mr-1" />
                        处置中
                      </button>
                      <button
                        onClick={() => onUpdateIssueStatus(log.id, 'resolved')}
                        className={`px-2 py-1 text-xxs rounded transition-colors ${
                          log.issueStatus === 'resolved'
                            ? 'bg-emerald-600 text-white font-semibold'
                            : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-600'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                        已解决
                      </button>
                    </div>
                  </div>
                )}

                {/* 删除操作 */}
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      if (confirm('确认删除本条日志流数据吗？此操作不可逆。')) {
                        onDeleteLog(log.id);
                      }
                    }}
                    className="text-xxs text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    删除记录
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
