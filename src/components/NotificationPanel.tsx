import React, { useState, useEffect } from 'react';
import { NotificationSettings, EmailLog, LogEntry, TodoItem } from '../types';
import { 
  Volume2, Mail, Bell, Play, CheckCircle2, AlertOctagon, 
  Trash2, Send, Sliders, HelpCircle, Eye, Info, Check, Sparkles 
} from 'lucide-react';

interface NotificationPanelProps {
  id: string;
  settings: NotificationSettings;
  onUpdateSettings: (settings: NotificationSettings) => void;
  emailLogs: EmailLog[];
  onClearEmailLogs: () => void;
  onTriggerTestEmail: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  id,
  settings,
  onUpdateSettings,
  emailLogs,
  onClearEmailLogs,
  onTriggerTestEmail,
}) => {
  const [testSpeechText, setTestSpeechText] = useState<string>(
    '统一运维警报！【账单与结算中心】系统当前检测到特急事项未处理，请相关团队立刻介入排查！'
  );
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [showEmailPreviewId, setShowEmailPreviewId] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  // 监控 Web Speech Synthesis 状态
  useEffect(() => {
    const checkState = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setSpeaking(window.speechSynthesis.speaking);
      }
    }, 500);
    return () => clearInterval(checkState);
  }, []);

  // 执行真实语音播报
  const handleSpeak = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('抱歉，当前浏览器环境不支持 Web Speech API 语音播报。');
      return;
    }

    // 先停止当前的播报
    window.speechSynthesis.cancel();

    if (!textToSpeak.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.volume = settings.voiceVolume;
    utterance.rate = settings.voiceSpeed;
    utterance.pitch = settings.voicePitch;

    // 尝试寻找中文普通话发音人
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  return (
    <div id={id} className="space-y-6">
      {/* 核心指引与大屏说明 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-xxs">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50 flex-shrink-0">
            <Bell className="w-5 h-5 animate-swing" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">联动报警配置中心 (Notification Hub)</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              为核心系统提供高时效、多维度的即时预警能力。当底层日志汇报重大异常 (Severity: Critical) 或处室新增特急待办 (Priority: Critical) 时，
              系统会立刻<strong>在值班电脑上发起真实的语音朗读播报</strong>，并同步<strong>向管理层及负责邮箱自动推送紧急告警邮件</strong>，建立极速闭环响应。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：语音与邮件配置栏 */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. 语音播报模块 */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 flex items-center uppercase tracking-wide">
                <Volume2 className="w-4 h-4 text-blue-500 mr-2" />
                (1) 智能语音播报配置
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableVoice}
                  onChange={(e) => onUpdateSettings({ ...settings, enableVoice: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings.enableVoice ? (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* 播报参数调节 */}
                <div className="bg-gray-50/50 p-3.5 rounded-lg border border-gray-100 space-y-3.5">
                  <div className="flex items-center justify-between text-xxs text-gray-500 font-semibold mb-1">
                    <span className="flex items-center">
                      <Sliders className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      声学发音微调参数
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, voiceSpeed: 1.0, voicePitch: 1.0, voiceVolume: 1.0 })}
                      className="text-blue-600 hover:underline font-bold text-xxs"
                    >
                      恢复默认
                    </button>
                  </div>

                  {/* 音量 */}
                  <div>
                    <div className="flex justify-between text-xxs text-gray-600 mb-1">
                      <span>音量 (Volume)</span>
                      <strong className="text-gray-900">{Math.round(settings.voiceVolume * 100)}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.voiceVolume}
                      onChange={(e) => onUpdateSettings({ ...settings, voiceVolume: parseFloat(e.target.value) })}
                      className="w-full accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none"
                    />
                  </div>

                  {/* 语速 */}
                  <div>
                    <div className="flex justify-between text-xxs text-gray-600 mb-1">
                      <span>语速倍率 (Speed)</span>
                      <strong className="text-gray-900">{settings.voiceSpeed}x</strong>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.8"
                      step="0.1"
                      value={settings.voiceSpeed}
                      onChange={(e) => onUpdateSettings({ ...settings, voiceSpeed: parseFloat(e.target.value) })}
                      className="w-full accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none"
                    />
                  </div>

                  {/* 音调 */}
                  <div>
                    <div className="flex justify-between text-xxs text-gray-600 mb-1">
                      <span>音调频率 (Pitch)</span>
                      <strong className="text-gray-900">{settings.voicePitch}x</strong>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={settings.voicePitch}
                      onChange={(e) => onUpdateSettings({ ...settings, voicePitch: parseFloat(e.target.value) })}
                      className="w-full accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none"
                    />
                  </div>
                </div>

                {/* 播报测试区域 */}
                <div className="space-y-2">
                  <label className="block text-xxs text-gray-500 font-bold">试听语文本预览编辑：</label>
                  <textarea
                    rows={3}
                    value={testSpeechText}
                    onChange={(e) => setTestSpeechText(e.target.value)}
                    placeholder="输入测试文本，点击下方进行真人语音合成播放..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 text-xxs rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 leading-relaxed"
                  />
                  
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleSpeak(testSpeechText)}
                      className="flex-1 flex items-center justify-center py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-xxs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 mr-1.5 fill-white" />
                      一键仿真语音播报测试
                    </button>
                    {speaking && (
                      <button
                        onClick={handleStopSpeech}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-rose-600 font-semibold rounded-lg transition-all text-xxs cursor-pointer"
                      >
                        停止播报
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-400 text-xxs leading-relaxed">
                🚨 自动语音播报已关闭。<br />
                开启后，每当系统监测到“特急(critical)”日志或团队事项时，前台大屏会瞬间触发女声拟真朗读。
              </div>
            )}
          </div>

          {/* 2. 邮件接收设置模块 */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/80 space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 flex items-center uppercase tracking-wide">
                <Mail className="w-4 h-4 text-blue-500 mr-2" />
                (2) 告警邮件接收端设置
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableEmailAlert}
                  onChange={(e) => onUpdateSettings({ ...settings, enableEmailAlert: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xxs text-gray-500 font-bold mb-1">默认接收人邮箱地址 (Recipient Email):</label>
                <input
                  type="email"
                  required
                  disabled={!settings.enableEmailAlert}
                  value={settings.recipientEmail}
                  onChange={(e) => onUpdateSettings({ ...settings, recipientEmail: e.target.value })}
                  placeholder="例如: manager@company.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 disabled:opacity-60"
                />
                <p className="text-xxs text-gray-400 mt-1">
                  告警源已自动匹配您的注册邮箱地址。支持配置为各组长邮箱以提高协调时效。
                </p>
              </div>

              {settings.enableEmailAlert && (
                <button
                  onClick={onTriggerTestEmail}
                  className="w-full flex items-center justify-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xxs font-bold rounded-lg transition-all cursor-pointer border border-gray-200"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
                  模拟下发即时运维日报邮件
                </button>
              )}
            </div>
          </div>

        </div>

        {/* 右侧：邮件发送历史监控 */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-gray-200/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-900 flex items-center uppercase tracking-wide">
                  <Send className="w-4 h-4 text-blue-500 mr-2 animate-pulse" />
                  告警邮件下发实时监控台
                </h3>
                <p className="text-xxs text-gray-400 mt-0.5">记录自系统启动以来所有由自动检测或人工触发的投递记录</p>
              </div>
              
              {emailLogs.length > 0 && (
                <button
                  onClick={onClearEmailLogs}
                  className="text-xxs text-gray-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  清空日志
                </button>
              )}
            </div>

            {/* 邮件投递队列 */}
            <div className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {emailLogs.length === 0 ? (
                <div className="text-center p-16 text-gray-400 text-xxs leading-relaxed">
                  <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  目前尚无告警邮件触发记录。<br />
                  您可以通过左侧配置，并在日志或待办面板添加【特急/Critical】级别的事项，来自动观测即时下发队列。
                </div>
              ) : (
                emailLogs.map((log) => {
                  const isExpanded = showEmailPreviewId === log.id;
                  return (
                    <div
                      key={log.id}
                      className="p-3 bg-gray-50/70 border border-gray-200/40 rounded-lg flex flex-col justify-between gap-2.5 transition-all hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-2 text-xxs">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 font-bold rounded ${
                              log.triggerType === 'manual' 
                                ? 'bg-gray-100 text-gray-700' 
                                : log.triggerType === 'auto_critical_log'
                                ? 'bg-red-50 text-red-700 border border-red-100'
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {log.triggerType === 'manual' && '人工发送'}
                              {log.triggerType === 'auto_critical_log' && '系统高危自动告警'}
                              {log.triggerType === 'auto_critical_todo' && '特急待办自动推送'}
                            </span>
                            <span className="text-gray-400">
                              发送至: <strong className="text-gray-600 font-medium">{log.recipient}</strong>
                            </span>
                          </div>
                          <p className="font-bold text-gray-800 text-xs pt-1">{log.subject}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-bold">
                            <Check className="w-3 h-3 mr-0.5" />
                            成功投递 (d)
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(log.sentAt).toLocaleTimeString('zh-CN')}
                          </p>
                        </div>
                      </div>

                      {/* 邮件正文折叠预览 */}
                      <div>
                        <button
                          onClick={() => setShowEmailPreviewId(isExpanded ? null : log.id)}
                          className="flex items-center text-[11px] text-blue-600 hover:underline font-bold"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          {isExpanded ? '收起邮件完整正文预览' : '展开查看完整告警 HTML 模板'}
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 p-3.5 bg-white border border-gray-200 rounded-lg text-xxs text-gray-600 leading-relaxed whitespace-pre-wrap font-mono max-h-[260px] overflow-y-auto">
                            {log.body}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xxs text-gray-400">
            <Info className="w-3.5 h-3.5 text-gray-300" />
            <span>
              邮件模拟器已自动对接 SMTP 底层服务。当侦测到事故级别大于 90 时，将加急激活邮件重发重试队列。
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
