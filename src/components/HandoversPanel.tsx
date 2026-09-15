import React, { useState } from 'react';
import { HandoverItem, Priority } from '../types';
import { DEPARTMENTS, CORE_SYSTEMS } from '../mockData';
import { ClipboardList, ArrowRight, User, AlertTriangle, Clock, Plus, CheckCircle, CheckCircle2, Search, X } from 'lucide-react';

interface HandoversPanelProps {
  id: string;
  handovers: HandoverItem[];
  onAddHandover: (handover: Omit<HandoverItem, 'id' | 'createdAt' | 'completedAt' | 'status'>) => void;
  onCompleteHandover: (id: string) => void;
  onDeleteHandover: (id: string) => void;
}

export const HandoversPanel: React.FC<HandoversPanelProps> = ({
  id,
  handovers,
  onAddHandover,
  onCompleteHandover,
  onDeleteHandover,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('pending'); // 默认看进行中的交接 (b)
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newDept, setNewDept] = useState<string>(DEPARTMENTS[0]);
  const [newSystem, setNewSystem] = useState<string>(CORE_SYSTEMS[0]);
  const [newFromStaff, setNewFromStaff] = useState<string>('');
  const [newToStaff, setNewToStaff] = useState<string>('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newFromStaff.trim() || !newToStaff.trim()) {
      alert('请完整填写交接单所有字段！');
      return;
    }
    onAddHandover({
      department: newDept,
      systemName: newSystem,
      title: newTitle,
      content: newContent,
      fromStaff: newFromStaff,
      toStaff: newToStaff,
      priority: newPriority,
    });
    // 重置
    setNewTitle('');
    setNewContent('');
    setNewFromStaff('');
    setNewToStaff('');
    setNewPriority('medium');
    setShowAddForm(false);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityLabel = (p: Priority) => {
    switch (p) {
      case 'critical':
        return '特急-立即核验';
      case 'high':
        return '紧急-交接重核';
      case 'medium':
        return '普通-日常切换';
      case 'low':
        return '较低-例行流转';
    }
  };

  const filteredHandovers = handovers.filter((h) => {
    const matchPriority = !filterPriority || h.priority === filterPriority;
    const matchStatus = !filterStatus || h.status === filterStatus;
    const matchSearch =
      !searchQuery ||
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.fromStaff.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.toStaff.toLowerCase().includes(searchQuery.toLowerCase());
    return matchPriority && matchStatus && matchSearch;
  });

  return (
    <div id={id} className="space-y-6">
      {/* 顶部控制栏 */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-gray-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">交接单管理面板 (Handover)</h2>
            <p className="text-xs text-gray-500 mt-0.5">跟踪多系统跨班次白晚班交接链条，确保责任闭环与验证无断层</p>
          </div>
          <button
            id={`${id}-add-btn`}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors duration-150"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            新建岗位交接单
          </button>
        </div>

        {/* 筛选过滤 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          {/* 模糊搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id={`${id}-search-input`}
              type="text"
              placeholder="搜索交接内容/交接双方..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 状态筛选 */}
          <select
            id={`${id}-filter-status`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
          >
            <option value="">所有交接状态</option>
            <option value="pending">待签认领 (挂起交接项) (b)</option>
            <option value="completed">互签完毕 (完成闭环)</option>
          </select>

          {/* 优先级筛选 */}
          <select
            id={`${id}-filter-pri`}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
          >
            <option value="">所有优先级 (着急程度) (c)</option>
            <option value="critical">特急 (Critical)</option>
            <option value="high">紧急 (High)</option>
            <option value="medium">普通 (Medium)</option>
            <option value="low">较低 (Low)</option>
          </select>
        </div>
      </div>

      {/* 新增交接单表单 */}
      {showAddForm && (
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-900">新岗位交接单拟定</h3>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">交接事项主题 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：主备网链路切换及备线监控交接"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">优先级(着急程度)</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="critical">🔴 特急 (Critical) - 绝密/业务高危</option>
                  <option value="high">🟠 紧急 (High) - 系统限速/证书到期</option>
                  <option value="medium">🔵 普通 (Medium) - 临时监控/财务配对</option>
                  <option value="low">⚪ 较低 (Low) - 例行缓存清理等</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">分管团队/部门</label>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">对应核心系统</label>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">交出人白班 *</label>
                <input
                  type="text"
                  required
                  placeholder="交出人姓名"
                  value={newFromStaff}
                  onChange={(e) => setNewFromStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">指定接替人晚班 *</label>
                <input
                  type="text"
                  required
                  placeholder="接替人姓名"
                  value={newToStaff}
                  onChange={(e) => setNewToStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">交接核心细节与验证指南 *</label>
              <textarea
                required
                rows={3}
                placeholder="详细描述：具体有什么需要特别说明的信息？怎么做验证？如：‘新证书已丢入堡垒机，需重载nginx配置并输入 https://... 确认没挂。’"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
              />
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
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                拟定发布
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 列表流 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHandovers.length === 0 ? (
          <div className="col-span-2 text-center p-12 bg-white rounded-xl border border-gray-200/80 text-gray-400 text-xs">
            暂无对应的岗位交接单项。
          </div>
        ) : (
          filteredHandovers.map((item) => {
            const isPending = item.status === 'pending';

            return (
              <div
                key={item.id}
                id={`handover-card-${item.id}`}
                className={`flex flex-col justify-between p-5 rounded-xl border bg-white border-gray-200/80 transition-all hover:border-gray-300 hover:shadow-sm ${
                  !isPending ? 'opacity-70 bg-gray-50/20' : ''
                }`}
              >
                <div>
                  {/* 首部 */}
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2.5 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 text-xxs font-medium rounded-full bg-gray-100 border border-gray-200 text-gray-600">
                        {item.department}
                      </span>
                      <span className="text-xxs font-bold text-gray-500">{item.systemName}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xxs rounded border ${getPriorityBadge(
                        item.priority
                      )}`}
                    >
                      {getPriorityLabel(item.priority)}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</h4>
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>

                {/* 责任链与认领区 */}
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-3.5">
                  <div className="flex items-center justify-between text-xs bg-gray-50/50 p-2.5 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xxs text-gray-500 font-medium">交出人:</span>
                      <span className="text-xs font-bold text-gray-700">{item.fromStaff}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                    <div className="flex items-center space-x-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xxs text-gray-500 font-medium">接收人:</span>
                      <span className="text-xs font-bold text-gray-700">{item.toStaff}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xxs text-gray-400">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      发起: {new Date(item.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                    </span>
                    {!isPending && item.completedAt && (
                      <span className="flex items-center text-emerald-600 font-bold">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        签字: {new Date(item.completedAt).toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        if (confirm('确认删除本条岗位交接单吗？')) {
                          onDeleteHandover(item.id);
                        }
                      }}
                      className="text-xxs text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      删除
                    </button>

                    {isPending ? (
                      <button
                        onClick={() => onCompleteHandover(item.id)}
                        className="flex items-center px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xxs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        接收签字（接晚班）
                      </button>
                    ) : (
                      <span className="text-xxs text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center font-bold">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        已完成双人签字闭环
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
