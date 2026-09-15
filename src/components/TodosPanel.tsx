import React, { useState } from 'react';
import { TodoItem, Priority, TodoStatus } from '../types';
import { DEPARTMENTS, CORE_SYSTEMS } from '../mockData';
import { ClipboardList, Plus, Search, Calendar, User, CheckCircle2, ChevronRight, Play, Check, Trash2, X } from 'lucide-react';

interface TodosPanelProps {
  id: string;
  todos: TodoItem[];
  onAddTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onUpdateTodoStatus: (id: string, status: TodoStatus) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodosPanel: React.FC<TodosPanelProps> = ({
  id,
  todos,
  onAddTodo,
  onUpdateTodoStatus,
  onDeleteTodo,
}) => {
  const [filterDept, setFilterDept] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('uncompleted'); // 默认看“没干”和“没干完”
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDept, setNewDept] = useState<string>(DEPARTMENTS[0]);
  const [newSystem, setNewSystem] = useState<string>(CORE_SYSTEMS[0]);
  const [newAssignee, setNewAssignee] = useState<string>('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDeadline, setNewDeadline] = useState<string>('2026-09-15T18:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAssignee.trim()) {
      alert('请完整填写待办名称和责任人！');
      return;
    }
    onAddTodo({
      department: newDept,
      systemName: newSystem,
      title: newTitle,
      priority: newPriority,
      assignee: newAssignee,
      status: 'todo',
      deadline: new Date(newDeadline).toISOString(),
    });
    // 重置
    setNewTitle('');
    setNewAssignee('');
    setNewPriority('medium');
    setNewDeadline('2026-09-15T18:00');
    setShowAddForm(false);
  };

  const getPriorityBadgeColor = (p: Priority) => {
    switch (p) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-100 font-extrabold';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-100 font-semibold';
      case 'medium':
        return 'text-blue-700 bg-blue-50 border-blue-100';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getPriorityLabel = (p: Priority) => {
    switch (p) {
      case 'critical':
        return '🔴 特急 (Critical)';
      case 'high':
        return '🟠 紧急 (High)';
      case 'medium':
        return '🔵 普通 (Medium)';
      case 'low':
        return '⚪ 较低 (Low)';
    }
  };

  const filteredTodos = todos.filter((t) => {
    const matchDept = !filterDept || t.department === filterDept;

    let matchStatus = true;
    if (filterStatus === 'uncompleted') {
      matchStatus = t.status === 'todo' || t.status === 'in_progress'; // 没干、没干完 (a)
    } else if (filterStatus === 'todo') {
      matchStatus = t.status === 'todo'; // 没干 (a)
    } else if (filterStatus === 'in_progress') {
      matchStatus = t.status === 'in_progress'; // 没干完 (a)
    } else if (filterStatus === 'done') {
      matchStatus = t.status === 'done';
    }

    const matchSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchQuery.toLowerCase());

    return matchDept && matchStatus && matchSearch;
  });

  return (
    <div id={id} className="space-y-6">
      {/* 顶部过滤控制台 */}
      <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-gray-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">核心待办追溯面板 (Todo)</h2>
            <p className="text-xs text-gray-500 mt-0.5">监控各个团队“没干”及“没干完”的事项进度，及时推进消单</p>
          </div>
          <button
            id={`${id}-add-btn`}
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors duration-150"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            新增团队待办事项
          </button>
        </div>

        {/* 筛选条件 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          {/* 模糊搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              id={`${id}-search-input`}
              type="text"
              placeholder="搜索待办任务名称/责任人..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 状态过滤 */}
          <select
            id={`${id}-filter-status`}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 font-medium"
          >
            <option value="uncompleted">看所有未完工 (没干+没干完) (a)</option>
            <option value="todo">只看【没干 / 未开始】 (a)</option>
            <option value="in_progress">只看【没干完 / 进行中】 (a)</option>
            <option value="done">只看【已干完 / 已闭环】</option>
            <option value="">看全部 (含已完成)</option>
          </select>

          {/* 团队过滤 */}
          <select
            id={`${id}-filter-dept`}
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
          >
            <option value="">所有负责团队</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 新增待办表单 */}
      {showAddForm && (
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-900">拟定新待办任务</h3>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">待办任务名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：微信支付网关域名解析切换至主DNS"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">指派具体责任人 *</label>
                <input
                  type="text"
                  required
                  placeholder="姓名 (处室岗位)"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">指派部门</label>
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
                <label className="block text-xs font-medium text-gray-700 mb-1">优先级(急缓度) (c)</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="critical">🔴 特急 (Critical) - 阻断抢修级</option>
                  <option value="high">🟠 紧急 (High) - 今日必须消单</option>
                  <option value="medium">🔵 普通 (Medium) - 本班次推行</option>
                  <option value="low">⚪ 较低 (Low) - 跨周常规事务</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">要求截止时间</label>
                <input
                  type="datetime-local"
                  required
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
                />
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
                确认创建
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 待办流 */}
      <div className="space-y-3.5">
        {filteredTodos.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-gray-200/80 text-gray-400 text-xs">
            暂无对应的待办事项记录。
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isCompleted = todo.status === 'done';
            const isInProgress = todo.status === 'in_progress';

            return (
              <div
                key={todo.id}
                id={`todo-card-${todo.id}`}
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-gray-200/80 rounded-xl transition-all hover:border-gray-300 hover:shadow-xxs gap-4 ${
                  isCompleted ? 'opacity-60 bg-gray-50/10' : ''
                }`}
              >
                {/* 左侧：描述信息 */}
                <div className="flex items-start space-x-3.5 flex-1">
                  {/* 状态指引圈 */}
                  <div className="mt-1 flex-shrink-0">
                    {isCompleted ? (
                      <div className="p-1.5 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-600">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : isInProgress ? (
                      <div className="p-1.5 bg-amber-50 rounded-full border border-amber-200 text-amber-500 animate-pulse">
                        <Play className="w-4 h-4 fill-amber-500" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-gray-50 rounded-full border border-gray-200 text-gray-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 text-xxs font-medium bg-gray-100 border border-gray-200 text-gray-600 rounded">
                        {todo.department}
                      </span>
                      <span className="text-xxs font-bold text-gray-400">{todo.systemName}</span>
                      <span
                        className={`px-1.5 py-0.5 text-xxs rounded border ${getPriorityBadgeColor(
                          todo.priority
                        )}`}
                      >
                        {getPriorityLabel(todo.priority)}
                      </span>
                    </div>
                    <p className={`text-sm font-semibold text-gray-900 ${isCompleted ? 'line-through text-gray-400' : ''}`}>
                      {todo.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xxs text-gray-400 pt-1">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        责任人: <strong className="text-gray-600 ml-0.5 font-medium">{todo.assignee}</strong>
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        截至: {new Date(todo.deadline).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 右侧：状态流转按钮和删除 */}
                <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0 flex-shrink-0">
                  <span
                    className={`text-xxs px-2 py-0.5 rounded-full font-bold border ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isInProgress
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}
                  >
                    {isCompleted && '已干完'}
                    {isInProgress && '没干完 / 进行中'}
                    {todo.status === 'todo' && '没干 / 未开始'}
                  </span>

                  <div className="flex items-center space-x-2">
                    {!isCompleted && (
                      <>
                        {todo.status === 'todo' && (
                          <button
                            onClick={() => onUpdateTodoStatus(todo.id, 'in_progress')}
                            className="flex items-center px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xxs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            开始干 (a)
                          </button>
                        )}
                        {isInProgress && (
                          <button
                            onClick={() => onUpdateTodoStatus(todo.id, 'done')}
                            className="flex items-center px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xxs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            干完了 (a)
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => {
                        if (confirm('确认删除本条待办事项吗？')) {
                          onDeleteTodo(todo.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
