import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// 共享 Gemini 客户端初始化 (lazy initialization)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// 1. API: 健康检查
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. API: 智能研判与报告生成
app.post("/api/analyze", async (req, res) => {
  const { logs, handovers, todos } = req.body;

  const client = getGeminiClient();
  if (!client) {
    // 降级模式：没有 API Key 时，基于当前数据做一些基础分析，提供精美的高仿真报告
    console.log("No valid GEMINI_API_KEY. Running deterministic smart analysis...");
    const fallbackReport = runDeterministicAnalysis(logs, handovers, todos);
    return res.json({
      success: true,
      isAiGenerated: false,
      report: fallbackReport,
    });
  }

  try {
    const systemPrompt = `
You are an expert Chief Information Officer (CIO) and Operational Director. 
Your task is to analyze the active log entries, pending handovers, and todo list items of an organization's multi-department system, and synthesize a comprehensive, elegant, and action-oriented Operational Summary & Health Dashboard Report for the CEO/Boss.

The report MUST be returned as a JSON object matching the following TypeScript interface structure strictly. Do NOT wrap the JSON in markdown codeblocks (no \`\`\`json etc.).

interface AiSummaryReport {
  overallHealthScore: number; // Health score from 0 to 100 based on active issues, pending handovers, and uncompleted tasks.
  overallRiskLevel: 'high' | 'medium' | 'low'; // Risk rating of today.
  oneSentenceSummary: string; // A punchy, brief summary of today's core status.
  criticalIssuesAnalysis: Array<{
    title: string;
    system: string;
    impact: string;
    suggestion: string;
  }>; // (d) Analysis of major issues. Identify active issues from log entries (e.g. isMajorIssue === true).
  uncompletedTasksAlert: Array<{
    team: string;
    systemName: string;
    count: number;
    details: string;
  }>; // (a) Teams with high pending todos or delayed tasks, what are they missing.
  handoverGaps: Array<{
    title: string;
    fromStaff: string;
    toStaff: string;
    risk: string;
  }>; // (b) Potential vulnerabilities in active handover items.
  managementRecommendation: string; // Insightful, strategic managerial suggestions for the boss.
}
`;

    const userPrompt = `
Below is the current raw data of the systems. Please analyze it carefully:

=== ACTIVE LOG ENTRIES ===
${JSON.stringify(logs, null, 2)}

=== PENDING HANDOVER ITEMS ===
${JSON.stringify(handovers, null, 2)}

=== TODO LIST ITEMS ===
${JSON.stringify(todos, null, 2)}

Analyze and return the compiled JSON matching the system prompt's schema.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallHealthScore: { type: Type.INTEGER },
            overallRiskLevel: { type: Type.STRING },
            oneSentenceSummary: { type: Type.STRING },
            criticalIssuesAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  system: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                },
                required: ["title", "system", "impact", "suggestion"],
              },
            },
            uncompletedTasksAlert: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  team: { type: Type.STRING },
                  systemName: { type: Type.STRING },
                  count: { type: Type.INTEGER },
                  details: { type: Type.STRING },
                },
                required: ["team", "systemName", "count", "details"],
              },
            },
            handoverGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  fromStaff: { type: Type.STRING },
                  toStaff: { type: Type.STRING },
                  risk: { type: Type.STRING },
                },
                required: ["title", "fromStaff", "toStaff", "risk"],
              },
            },
            managementRecommendation: { type: Type.STRING },
          },
          required: [
            "overallHealthScore",
            "overallRiskLevel",
            "oneSentenceSummary",
            "criticalIssuesAnalysis",
            "uncompletedTasksAlert",
            "handoverGaps",
            "managementRecommendation",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const reportObj = JSON.parse(text.trim());
    return res.json({
      success: true,
      isAiGenerated: true,
      report: reportObj,
    });
  } catch (error: any) {
    console.error("Gemini analysis failed, falling back to heuristic report:", error);
    const fallbackReport = runDeterministicAnalysis(logs, handovers, todos);
    return res.json({
      success: true,
      isAiGenerated: false,
      isFallbackDueToError: true,
      error: error.message,
      report: fallbackReport,
    });
  }
});

// 确定性的启发式降级分析函数
function runDeterministicAnalysis(logs: any[], handovers: any[], todos: any[]) {
  const majorIssues = logs.filter((l) => l.isMajorIssue);
  const pendingHandovers = handovers.filter((h) => h.status === "pending");
  const uncompletedTodos = todos.filter((t) => t.status !== "done");

  // 简易评分机制
  let score = 100;
  score -= majorIssues.length * 12;
  score -= pendingHandovers.length * 3;
  score -= uncompletedTodos.length * 4;
  score = Math.max(10, Math.min(100, score));

  let risk: "high" | "medium" | "low" = "low";
  if (score < 65 || majorIssues.some((i) => i.issueSeverity === "critical")) {
    risk = "high";
  } else if (score < 85) {
    risk = "medium";
  }

  // 一句话总结
  let summary = "目前全系统处于常态运行，暂无爆发中的业务中断性重大故障，日常待办平稳流转。";
  if (risk === "high") {
    summary = `警告：检测到 ${majorIssues.length} 个核心服务中存在重大阻断级别问题，共有 ${uncompletedTodos.length} 项运维研发待办尚未按期结清。请重点关注跨班次的交接过渡！`;
  } else if (risk === "medium") {
    summary = `提示：系统基本平稳。但有 ${pendingHandovers.length} 项交接事项正处于挂起态，并有 ${uncompletedTodos.length} 项待办进行中，存在局部流程脱节和次生事故隐患。`;
  }

  // 重大问题分析
  const criticalAnalysis = majorIssues.map((issue) => {
    let suggestion = "建议相关处室组长牵头建立应急驻守专项小组。";
    if (issue.title.includes("死锁") || issue.systemName.includes("ERP")) {
      suggestion = "建议DBA调整事务隔离级别为RC，开启高频交易表的读写分离，并将死锁捕获时间缩短为 15 秒。";
    } else if (issue.title.includes("专线") || issue.systemName.includes("专线") || issue.title.includes("光纤")) {
      suggestion = "全力跟进运营商熔接进度，严控备线带宽，严防晚班因带宽挤占导致生产服务超时。";
    } else if (issue.title.includes("502") || issue.systemName.includes("支付")) {
      suggestion = "升级微信支付前置的回调网关配置，加强DNS缓存备选链路；建议客服主动触达催办VIP大客户退款。";
    }
    return {
      title: issue.title,
      system: issue.systemName,
      impact: `当前处理进度处于【${issue.issueStatus === "resolving" ? "急修中" : "挂起待分配"}】，该事件已引起特定业务中断或响应缓慢。`,
      suggestion: suggestion,
    };
  });

  if (criticalAnalysis.length === 0) {
    criticalAnalysis.push({
      title: "暂无活动中的重大故障",
      system: "全线服务",
      impact: "全部系统运行平稳，核心业务调用成功率 100%。",
      suggestion: "继续维持现有主备机房常规巡检机制。",
    });
  }

  // 哪个团队/系统事没干完
  const teamAlerts: any[] = [];
  const todoByDept: { [key: string]: any[] } = {};
  uncompletedTodos.forEach((t) => {
    if (!todoByDept[t.department]) todoByDept[t.department] = [];
    todoByDept[t.department].push(t);
  });

  Object.entries(todoByDept).forEach(([dept, list]) => {
    const criticalList = list.filter((t) => t.priority === "critical" || t.priority === "high");
    teamAlerts.push({
      team: dept,
      systemName: Array.from(new Set(list.map((t) => t.systemName))).join(", "),
      count: list.length,
      details: `【${dept}】目前积压了 ${list.length} 个未完成事项。主干任务包含“${criticalList[0]?.title || list[0]?.title}”等，直接威胁了今日正常业务切班。`,
    });
  });

  if (teamAlerts.length === 0) {
    teamAlerts.push({
      team: "所有团队",
      systemName: "全线业务",
      count: 0,
      details: "今日各处待办均已闭环，交接效率处于极高水平。",
    });
  }

  // 交接漏洞
  const handoverGaps = pendingHandovers.map((h) => {
    let riskDesc = "白晚班目前仍未双人互签，需防止值班真空期间发生任务遗忘。";
    if (h.priority === "critical" || h.priority === "high") {
      riskDesc = "【中高风险】涉及重点保障项目。若晚班接替人接班后一小时内未完成配置验证，可能导致次日业务重启时核心通道阻断。";
    }
    return {
      title: h.title,
      fromStaff: h.fromStaff,
      toStaff: h.toStaff,
      risk: riskDesc,
    };
  });

  if (handoverGaps.length === 0) {
    handoverGaps.push({
      title: "暂无悬空的交接事项",
      fromStaff: "全体成员",
      toStaff: "全体成员",
      risk: "各班次交接单均已签字闭环，无失控业务。",
    });
  }

  // 管理建议
  let recommendation = "1. 当前各处日常运维待办与交接单基本可控；\n2. 建议对本月度交接表现良好的‘研发一部’进行表扬；\n3. 提倡下阶段在全系统普及一键一核的电子互签标准。";
  if (risk === "high") {
    recommendation = "1. 必须责成【运维管理处】立即启动电信主专线的熔断切换测试并跟进熔接进度，今晚备线限流严禁对多媒体下载放行；\n2. 要求【软件研发一部】及DBA立刻针对ERP频繁锁冲突展开会商，排查慢SQL、必要时开启事务深度跟踪；\n3. 要求【客户服务中心】针对由于微信网关502受阻的高价值用户，进行一对一专属电话回访退款进展，全力避免次生社会言论风波；\n4. 晚班值守应建立双人同核机制，尤其是针对各卡口重点系统。";
  } else if (risk === "medium") {
    recommendation = "1. 请【安全监控组】及【客服中心】相关晚班接班人在 1 小时内进入系统，对白班交接的白名单、VIP退款单进行核验认领，确保业务流转不挂单；\n2. 建议各团队组长对进行中的中低优先级待办加强跟进，保证本周内均能顺利完成。";
  }

  return {
    overallHealthScore: score,
    overallRiskLevel: risk,
    oneSentenceSummary: summary,
    criticalIssuesAnalysis: criticalAnalysis,
    uncompletedTasksAlert: teamAlerts,
    handoverGaps: handoverGaps,
    managementRecommendation: recommendation,
    generatedAt: new Date().toISOString(),
  };
}

// 启动服务器
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
