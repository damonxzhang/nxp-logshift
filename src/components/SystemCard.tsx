import React from 'react';
import { Server, CheckCircle2, AlertTriangle, ArrowRight, ClipboardList } from 'lucide-react';
import { SystemStatus } from '../types';

interface SystemCardProps {
  id: string;
  status: SystemStatus;
  onSelectSystem?: (systemName: string) => void;
}

export const SystemCard: React.FC<SystemCardProps> = ({ id, status, onSelectSystem }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const getSystemStatusLabel = (status: SystemStatus) => {
    if (status.criticalIssuesCount > 0) {
      return { text: '存在活动故障', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    }
    if (status.pendingHandoversCount > 0 || status.uncompletedTodosCount > 0) {
      return { text: '有挂起工作项', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    return { text: '正常运行中', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  };

  const statusLabel = getSystemStatusLabel(status);

  return (
    <div
      id={id}
      onClick={() => onSelectSystem && onSelectSystem(status.systemName)}
      className="p-5 bg-white border border-gray-200/80 rounded-xl transition-all duration-200 hover:border-gray-300 hover:shadow-sm cursor-pointer"
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{status.systemName}</h3>
            <p className="text-xs text-gray-500">{status.department}</p>
          </div>
        </div>
        <div className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusLabel.color}`}>
          {statusLabel.text}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 text-center">
        <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50/50">
          <span className="text-xs text-gray-500 mb-1">健康指数</span>
          <span className={`text-sm font-bold px-1.5 py-0.5 rounded border ${getScoreColor(status.healthScore)}`}>
            {status.healthScore}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50/50">
          <span className="text-xs text-gray-500 mb-1">活动日志</span>
          <span className="text-sm font-semibold text-gray-800">{status.activeLogsCount}</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50/50">
          <span className="text-xs text-gray-500 mb-1">待接事项</span>
          <span className={`text-sm font-semibold ${status.pendingHandoversCount > 0 ? 'text-amber-600 font-bold' : 'text-gray-800'}`}>
            {status.pendingHandoversCount}
          </span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50/50">
          <span className="text-xs text-gray-500 mb-1">未完待办</span>
          <span className={`text-sm font-semibold ${status.uncompletedTodosCount > 0 ? 'text-rose-600 font-bold' : 'text-gray-800'}`}>
            {status.uncompletedTodosCount}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between text-xs text-gray-400 group pt-2 border-t border-gray-50">
        <span className="flex items-center">
          {status.criticalIssuesCount > 0 ? (
            <span className="flex items-center text-rose-600 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              {status.criticalIssuesCount} 起重大异常
            </span>
          ) : (
            <span className="flex items-center text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              无重大故障
            </span>
          )}
        </span>
        <span className="flex items-center text-blue-600 font-medium group-hover:underline">
          详情监控 <ArrowRight className="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  );
};
