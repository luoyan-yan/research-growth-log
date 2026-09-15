const STORAGE_KEY = 'research-growth-log:v1';

const SAMPLE_DAY_ENTRIES = [
  {
    id: 'sample-1',
    date: '2026-09-08',
    action: '阅读一篇关于图注意力机制的论文，标注了方法与实验部分。',
    idea: '还不确定注意力权重与特征重要性能否直接对应。',
    nextStep: '把论文中的核心概念用自己的语言复述一遍。',
    project: '文献综述',
    target: '完成 1 篇文献摘要',
    evidence: '论文高亮、读书笔记和标注截图',
    workType: '文献阅读',
    status: '推进中',
    anxiety: 2,
    isDemo: true,
  },
  {
    id: 'sample-2',
    date: '2026-09-09',
    action: '用自己的语言复述了图注意力的核心概念，并画出一张信息流草图。',
    idea: '注意力更像特征筛选机制，不能简单等同于“模型认为重要”。',
    nextStep: '根据复述结果列出实现所需的最小环境依赖。',
    project: '概念学习',
    target: '理解一个核心概念',
    evidence: '概念卡片和信息流草图',
    workType: '思考设计',
    status: '小收获',
    anxiety: 2,
    isDemo: true,
  },
  {
    id: 'sample-3',
    date: '2026-09-10',
    action: '配置实验环境，确认了运行脚本所需的最小依赖与版本。',
    idea: '固定最小复现条件，后续排错会更容易定位。',
    nextStep: '在最小数据集上运行一次单步验证。',
    project: '实验平台',
    target: '构建最小运行环境',
    evidence: '环境说明、依赖清单和安装日志',
    workType: '代码实验',
    status: '推进中',
    anxiety: 3,
    isDemo: true,
  },
  {
    id: 'sample-4',
    date: '2026-09-11',
    action: '排查运行报错，定位到数据路径和特征维度不对齐的问题。',
    idea: '可能是输入格式与前处理脚本版本不一致，导致列名和维度不匹配。',
    nextStep: '输出一个最小错误样本，再逐步比对处理脚本。',
    project: '模型训练',
    target: '定位输入数据流问题',
    evidence: '报错日志、代码 diff 和中间输出',
    workType: '代码实验',
    status: '卡住',
    anxiety: 4,
    isDemo: true,
  },
  {
    id: 'sample-5',
    date: '2026-09-12',
    action: '运行了第一次最小实验，保存了损失曲线和完整训练日志。',
    idea: '当前结果只是流程验证，不能描述成真实科研结论。',
    nextStep: '整理基线对照表，再检查评估指标是否合适。',
    project: '实验运行',
    target: '跑通第一轮最小实验',
    evidence: '训练日志与损失曲线截图',
    workType: '代码实验',
    status: '推进中',
    anxiety: 2,
    isDemo: true,
  },
  {
    id: 'sample-6',
    date: '2026-09-13',
    action: '分析了示例实验输出，整理出需要继续验证的现象与异常点。',
    idea: '不应急着解释差异，先确认评估指标和基线设置是否一致。',
    nextStep: '把结果与基线做成一页对照表，带着问题与师兄讨论。',
    project: '结果分析',
    target: '识别下一轮验证重点',
    evidence: '结果表格和图表草稿',
    workType: '数据处理',
    status: '推进中',
    anxiety: 2,
    isDemo: true,
  },
  {
    id: 'sample-7',
    date: '2026-09-14',
    action: '与师兄讨论了当前异常点，并把下一步收敛为一个最小对照实验。',
    idea: '先验证数据质量与特征设计，再讨论是否调整模型结构。',
    nextStep: '按讨论记录准备最小对照实验的输入数据。',
    project: '下一步讨论',
    target: '明确最先执行的动作',
    evidence: '讨论纪要和问题清单',
    workType: '沟通讨论',
    status: '小收获',
    anxiety: 1,
    isDemo: true,
  },
];

function loadEntries() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];
    return stored;
  } catch (error) {
    console.warn('读取日志失败，已降级到空记录。', error);
    return [];
  }
}

function saveEntries(entries) {
  persistEntries(entries);
}

function toLocalDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function ensureDateValue(dateString) {
  if (!dateString) return toLocalDateInputValue();
  return dateString;
}

function normalizeEntry(raw) {
  return {
    id: raw.id || `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: ensureDateValue(raw.date),
    action: (raw.action || '').trim(),
    idea: (raw.idea || '').trim(),
    nextStep: (raw.nextStep || '').trim(),
    project: (raw.project || '').trim(),
    target: (raw.target || '').trim(),
    evidence: (raw.evidence || '').trim(),
    workType: raw.workType || '其他',
    status: raw.status || '推进中',
    anxiety: Number(raw.anxiety || 2),
    isDemo: Boolean(raw.isDemo),
  };
}

function getThisWeekWindow(entries) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return entries.filter((entry) => {
    const date = new Date(entry.date);
    return date >= start && date <= end;
  });
}

function summarizeEntries(entries, referenceDate = null) {
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const thisWeek = referenceDate ? sorted.filter((entry) => {
    const entryDate = new Date(entry.date);
    const ref = new Date(referenceDate);
    const start = new Date(ref);
    start.setDate(ref.getDate() - 6);
    return entryDate >= start && entryDate <= ref;
  }) : getThisWeekWindow(sorted);

  const mainActions = thisWeek.map((entry) => entry.action).filter(Boolean);
  const materials = thisWeek.map((entry) => entry.evidence).filter(Boolean);
  const ideas = thisWeek.map((entry) => entry.idea).filter(Boolean);
  const blockers = thisWeek.filter((entry) => /卡住|需恢复|焦虑/.test(entry.status || '') || Number(entry.anxiety || 0) >= 4).map((entry) => entry.idea || entry.action);
  const nextSteps = thisWeek.map((entry) => entry.nextStep).filter(Boolean);

  const workTypeCounts = {};
  thisWeek.forEach((entry) => {
    const label = entry.workType || '其他';
    workTypeCounts[label] = (workTypeCounts[label] || 0) + 1;
  });

  const anxietyValues = thisWeek.map((entry) => Number(entry.anxiety || 0)).filter((value) => Number.isFinite(value));
  const averageAnxiety = anxietyValues.length ? anxietyValues.reduce((a, b) => a + b, 0) / anxietyValues.length : 0;

  return {
    entries: thisWeek,
    totalDays: new Set(thisWeek.map((entry) => entry.date)).size,
    mainActions,
    materials,
    ideas,
    blockers,
    nextSteps,
    workTypeCounts,
    averageAnxiety,
  };
}

function buildWeeklySummaryText({ entries, startDate, activeMode = 'personal' }) {
  const summary = summarizeEntries(entries, startDate || toLocalDateInputValue());
  const lines = [];
  lines.push('研途记录：本周回顾');
  lines.push('');
  lines.push('1. 本周实际推进了什么？');
  if (summary.mainActions.length) {
    summary.mainActions.forEach((action, index) => lines.push(`${index + 1}. ${action}`));
  } else {
    lines.push('1. 这周还没有留下记录，先从一条真实行动开始。');
  }
  lines.push('');
  lines.push('2. 目前卡在哪里？');
  if (summary.blockers.length) {
    summary.blockers.forEach((blocker, index) => lines.push(`${index + 1}. ${blocker}`));
  } else {
    lines.push('1. 目前还没有明显卡点，先继续做最小验证。');
  }
  lines.push('');
  lines.push('3. 下一步最先做什么？');
  if (summary.nextSteps.length) {
    summary.nextSteps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
  } else {
    lines.push('1. 列出最小可执行任务，先把下一天能做的第一步写清楚。');
  }
  lines.push('');
  lines.push('4. 留下的材料或证据');
  if (summary.materials.length) {
    summary.materials.forEach((item, index) => lines.push(`${index + 1}. ${item}`));
  } else {
    lines.push('1. 暂无记录的证据材料，建议保存截图、日志或代码状态。');
  }
  lines.push('');
  lines.push('5. Idea 汇总');
  if (summary.ideas.length) {
    summary.ideas.forEach((idea, index) => lines.push(`${index + 1}. ${idea}`));
  } else {
    lines.push('1. 本周还没有留下新的想法，先把工作过程写下来自然出现灵感。');
  }
  lines.push('');
  lines.push('说明：本周记录仅保存在本地浏览器，不会自动上传。');
  lines.push('说明：生成的分享内容默认排除焦虑程度和今日状态。');
  return lines.join('\n');
}

function buildWeeklyReportCsv(entries) {
  const header = ['日期', '项目/主题', '实际做了什么', 'Idea / 困惑速记', '明日第一步', '工作类型', '今日状态', '焦虑程度'];
  const rows = entries.map((entry) => [
    entry.date,
    entry.project || '',
    entry.action || '',
    entry.idea || '',
    entry.nextStep || '',
    entry.workType || '',
    entry.status || '',
    String(entry.anxiety || ''),
  ]);
  return [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

function createDownloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getDateLabel(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderEntries(entries) {
  const listContainer = document.querySelector('#entries-list');
  if (!listContainer) return;
  if (!entries.length) {
    listContainer.innerHTML = '<div class="entry-card"><p>还没有记录，先写下今天最小的一步吧。</p></div>';
    return;
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  listContainer.innerHTML = sortedEntries
    .map((entry) => {
      const status = entry.status || '推进中';
      const badge = entry.isDemo ? '示例' : '个人';
      return `
        <article class="entry-card ${entry.isDemo ? 'is-demo' : ''}">
          <div class="entry-header">
            <div class="entry-date">${escapeHtml(getDateLabel(entry.date))}</div>
            <span class="entry-tag">${escapeHtml(badge)} · ${escapeHtml(status)}</span>
          </div>
          <p><strong>做了什么：</strong> ${escapeHtml(entry.action || '无')}</p>
          <p><strong>Idea / 困惑：</strong> ${escapeHtml(entry.idea || '无')}</p>
          <p><strong>明日第一步：</strong> ${escapeHtml(entry.nextStep || '无')}</p>
          <div class="entry-actions">
            <button type="button" class="icon-action" data-action="edit" data-entry-id="${entry.id}">编辑</button>
            <button type="button" class="icon-action delete" data-action="delete" data-entry-id="${entry.id}">删除</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderWeeklyReview(entries) {
  const summary = summarizeEntries(entries);
  const dayCount = document.querySelector('#week-day-count');
  const progressCount = document.querySelector('#weekly-progress-count');
  const ideaCount = document.querySelector('#idea-count');
  const blockerCount = document.querySelector('#blocker-count');
  const nextStepCount = document.querySelector('#next-step-count');
  const demoLabel = document.querySelector('#demo-label');
  const modeLabel = entries.some((entry) => entry.isDemo) ? '示例模式' : '真实记录';

  if (dayCount) dayCount.textContent = `${summary.totalDays} 天`;
  if (progressCount) progressCount.textContent = `${summary.totalDays} 天`;
  if (ideaCount) ideaCount.textContent = `${summary.ideas.length} 条`;
  if (blockerCount) blockerCount.textContent = `${Math.max(summary.blockers.length, 0)} 个`;
  if (nextStepCount) nextStepCount.textContent = `${summary.nextSteps.length} 个`;
  if (demoLabel) demoLabel.textContent = modeLabel;

  const wrapList = (list, targetId) => {
    const target = document.querySelector(targetId);
    if (!target) return;
    if (!list.length) {
      target.innerHTML = '<li>暂无记录。</li>';
      return;
    }
    target.innerHTML = list.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  };

  wrapList(summary.mainActions.slice(0, 6), '#main-actions-list');
  wrapList(summary.blockers.length ? summary.blockers.slice(0, 6) : ['暂时没有阻塞，先用最小实验测试。'], '#blockers-list');
  wrapList(summary.nextSteps.slice(0, 6), '#next-step-list');
  wrapList(summary.materials.length ? summary.materials.slice(0, 6) : ['还没有留下材料，建议保存截图或日志。'], '#evidence-list');
  wrapList(summary.ideas.length ? summary.ideas.slice(0, 6) : ['目前还没有新增想法。'], '#idea-summary-list');
  wrapList(summary.blockers.length ? summary.blockers.slice(0, 6) : ['还没有明显困惑，继续用最小实验辨认方向。'], '#confusion-list');

  const workTypeTarget = document.querySelector('#work-type-distribution');
  if (workTypeTarget) {
    const entriesByType = Object.entries(summary.workTypeCounts).sort((a, b) => b[1] - a[1]);
    workTypeTarget.innerHTML = entriesByType.length
      ? entriesByType.map(([type, count]) => `<span class="distribution-chip"><strong>${escapeHtml(type)}</strong> ${count}</span>`).join('')
      : '<span class="distribution-chip"><strong>暂无</strong> 0</span>';
  }

  const anxietyTarget = document.querySelector('#anxiety-trend');
  if (anxietyTarget) {
    const values = summary.entries.map((entry) => Number(entry.anxiety || 0)).filter((value) => Number.isFinite(value));
    const maxValue = Math.max(1, ...values, 5);
    anxietyTarget.innerHTML = values.length
      ? values.map((value, index) => {
          const barHeight = Math.max(18, (value / maxValue) * 100);
          const date = new Date(`${summary.entries[index].date}T00:00:00`);
          const label = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(date);
          return `<div class="mini-bars-bar" style="height:${barHeight}%"><span>${label}</span></div>`;
        }).join('')
      : '<div class="mini-bars-bar" style="height:20%"><span>无</span></div>';
  }

  const output = document.querySelector('#weekly-report-output');
  if (output) {
    output.value = buildWeeklySummaryText({ entries, activeMode: entries.some((entry) => entry.isDemo) ? 'demo' : 'personal' });
  }
}

function renderIdeaBoard(entries) {
  const target = document.querySelector('#idea-board');
  if (!target) return;
  const ideas = entries.filter((entry) => entry.idea || entry.nextStep).slice(0, 8);
  if (!ideas.length) {
    target.innerHTML = '<div class="idea-card"><p>还没有收集到灵感与困惑，先写下一条最真实的科研记录。</p></div>';
    return;
  }

  target.innerHTML = ideas
    .map((entry) => `
      <article class="idea-card">
        <div class="meta">
          <span>${escapeHtml(getDateLabel(entry.date))}</span>
          <span>${escapeHtml(entry.workType || '其他')}</span>
        </div>
        <p><strong>Idea：</strong> ${escapeHtml(entry.idea || '无')}</p>
        <p><strong>困惑：</strong> ${escapeHtml(entry.action || '无')}</p>
        <p><strong>下一步：</strong> ${escapeHtml(entry.nextStep || '无')}</p>
      </article>
    `)
    .join('');
}

function refreshDashboard() {
  const entries = loadEntries();
  renderEntries(entries);
  renderWeeklyReview(entries);
  renderIdeaBoard(entries);
  updateDemoBadge(entries);
  updateStats(entries);
}

function updateDemoBadge(entries) {
  const badge = document.querySelector('#demo-indicator');
  if (!badge) return;
  badge.classList.toggle('hidden', !entries.some((entry) => entry.isDemo));
}

function updateStats(entries) {
  const summary = summarizeEntries(entries);
  const progressCount = document.querySelector('#weekly-progress-count');
  const ideaCount = document.querySelector('#idea-count');
  const blockerCount = document.querySelector('#blocker-count');
  const nextStepCount = document.querySelector('#next-step-count');

  if (progressCount) progressCount.textContent = `${summary.totalDays} 天`;
  if (ideaCount) ideaCount.textContent = `${summary.ideas.length} 条`;
  if (blockerCount) blockerCount.textContent = `${summary.blockers.length} 个`;
  if (nextStepCount) nextStepCount.textContent = `${summary.nextSteps.length} 个`;
}

function fillFormForEdit(entryId) {
  const entries = loadEntries();
  const entry = entries.find((item) => item.id === entryId);
  if (!entry) return;

  document.querySelector('#entry-date').value = entry.date;
  document.querySelector('#entry-action').value = entry.action || '';
  document.querySelector('#entry-idea').value = entry.idea || '';
  document.querySelector('#entry-next-step').value = entry.nextStep || '';
  document.querySelector('#entry-project').value = entry.project || '';
  document.querySelector('#entry-target').value = entry.target || '';
  document.querySelector('#entry-evidence').value = entry.evidence || '';
  document.querySelector('#entry-work-type').value = entry.workType || '文献阅读';
  document.querySelector('#entry-status').value = entry.status || '推进中';
  document.querySelector('#entry-anxiety').value = String(entry.anxiety || 2);
  document.querySelector('#anxiety-value').textContent = `${entry.anxiety || 2} / 5`;

  document.querySelector('#entry-form').dataset.editId = entry.id;
  const submitButton = document.querySelector('#entry-form button[type="submit"]');
  if (submitButton) submitButton.textContent = '更新记录';

  document.querySelector('#log-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetForm() {
  document.querySelector('#entry-form').reset();
  document.querySelector('#entry-date').value = toLocalDateInputValue();
  document.querySelector('#entry-anxiety').value = '2';
  document.querySelector('#anxiety-value').textContent = '2 / 5';
  delete document.querySelector('#entry-form').dataset.editId;
  const submitButton = document.querySelector('#entry-form button[type="submit"]');
  if (submitButton) submitButton.textContent = '保存记录';
}

function validateForm(formData) {
  const required = ['date', 'action', 'idea', 'nextStep'];
  const missing = required.filter((field) => !formData[field] || !String(formData[field]).trim());
  if (missing.length) {
    throw new Error('日期、实际做了什么、Idea / 困惑速记和明日第一步为必填项。');
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = Object.fromEntries(new FormData(form).entries());
  const feedback = document.querySelector('#form-feedback');

  try {
    validateForm(formData);
    const cleaned = normalizeEntry({
      ...formData,
      id: form.dataset.editId,
      anxiety: Number(formData.anxiety || 2),
    });

    const entries = loadEntries();
    const index = entries.findIndex((entry) => entry.id === cleaned.id);
    if (index >= 0) {
      entries[index] = { ...entries[index], ...cleaned, isDemo: entries[index].isDemo };
    } else {
      entries.push(cleaned);
    }
    saveEntries(entries);
    refreshDashboard();
    resetForm();

    if (feedback) {
      feedback.textContent = cleaned.id && index >= 0 ? '记录已更新，保存成功。' : '记录已保存，科研进展已经留在这里。';
    }
  } catch (error) {
    if (feedback) {
      feedback.textContent = error.message;
    }
  }
}

function deleteEntry(id) {
  const confirmed = window.confirm('确定删除这条记录吗？删除后无法恢复。');
  if (!confirmed) return;

  const entries = loadEntries().filter((entry) => entry.id !== id);
  saveEntries(entries);
  refreshDashboard();
  const feedback = document.querySelector('#form-feedback');
  if (feedback) feedback.textContent = '记录已删除。';
}

function loadDemoEntries() {
  const entries = loadEntries();
  const existingDemoCount = entries.filter((entry) => entry.isDemo).length;
  if (existingDemoCount) {
    const feedback = document.querySelector('#form-feedback');
    if (feedback) feedback.textContent = '示例数据已经在当前浏览器里，不会重复覆盖个人记录。';
    return;
  }

  const today = new Date();
  const demoEntries = SAMPLE_DAY_ENTRIES.map((entry, index) => {
    const demoDate = new Date(today);
    demoDate.setDate(today.getDate() - (SAMPLE_DAY_ENTRIES.length - 1 - index));
    return {
      ...entry,
      date: toLocalDateInputValue(demoDate),
      id: `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    };
  });
  const nextEntries = [...entries, ...demoEntries];
  saveEntries(nextEntries);
  refreshDashboard();
  const feedback = document.querySelector('#form-feedback');
  if (feedback) feedback.textContent = '示例数据已载入；它会被标记为“示例模式”。';
}

function clearDemoEntries() {
  const entries = loadEntries().filter((entry) => !entry.isDemo);
  saveEntries(entries);
  refreshDashboard();
  const feedback = document.querySelector('#form-feedback');
  if (feedback) feedback.textContent = '示例数据已清除，不影响个人记录。';
}

function persistEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('本地保存失败。', error);
  }
}

function clearAllPersonalData() {
  const confirmFirst = window.confirm('是否确认清空所有个人记录？');
  if (!confirmFirst) return;

  const secondConfirm = window.confirm('这将会删除本地保存的所有个人科研记录，示例数据会保留，仍然要继续吗？');
  if (!secondConfirm) return;

  const remainingEntries = loadEntries().filter((entry) => entry.isDemo);
  saveEntries(remainingEntries);
  refreshDashboard();
  const feedback = document.querySelector('#form-feedback');
  if (feedback) feedback.textContent = '个人数据已清空，示例数据保留在本地。';
}

async function copyWeeklyReport() {
  const output = document.querySelector('#weekly-report-output');
  if (!output) return;
  const text = output.value.trim();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    const feedback = document.querySelector('#form-feedback');
    if (feedback) feedback.textContent = '周报已复制到剪贴板。';
  } catch (error) {
    output.focus();
    output.select();
    document.execCommand('copy');
    const feedback = document.querySelector('#form-feedback');
    if (feedback) feedback.textContent = '周报已复制到剪贴板。';
  }
}

function exportCsv() {
  const entries = loadEntries();
  const csv = buildWeeklyReportCsv(entries);
  createDownloadFile('research-growth-log.csv', csv, 'text/csv;charset=utf-8;');
  const feedback = document.querySelector('#form-feedback');
  if (feedback) feedback.textContent = 'CSV 文件已导出。';
}

function bindEvents() {
  document.querySelector('#entry-form').addEventListener('submit', handleFormSubmit);

  document.querySelector('#entry-anxiety').addEventListener('input', (event) => {
    const value = event.target.value;
    const label = document.querySelector('#anxiety-value');
    if (label) label.textContent = `${value} / 5`;
  });

  document.querySelector('#entries-list').addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const { action, entryId } = target.dataset;
    if (action === 'edit') fillFormForEdit(entryId);
    if (action === 'delete') deleteEntry(entryId);
  });

  document.querySelector('#cancel-edit-btn').addEventListener('click', () => {
    resetForm();
    const feedback = document.querySelector('#form-feedback');
    if (feedback) feedback.textContent = '已取消编辑。';
  });

  document.querySelectorAll('[data-scroll-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetSelector = button.getAttribute('data-scroll-target');
      const target = document.querySelector(targetSelector);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelector('#load-demo-btn').addEventListener('click', loadDemoEntries);
  document.querySelector('#clear-demo-btn').addEventListener('click', clearDemoEntries);
  document.querySelector('#copy-report-btn').addEventListener('click', copyWeeklyReport);
  document.querySelector('#export-csv-btn').addEventListener('click', exportCsv);
  document.querySelector('#clear-all-btn').addEventListener('click', clearAllPersonalData);
}

function init() {
  const dateField = document.querySelector('#entry-date');
  if (dateField && !dateField.value) {
    dateField.value = toLocalDateInputValue();
  }

  const anxietyInput = document.querySelector('#entry-anxiety');
  if (anxietyInput) {
    anxietyInput.value = '2';
  }

  const valueLabel = document.querySelector('#anxiety-value');
  if (valueLabel) {
    valueLabel.textContent = '2 / 5';
  }

  bindEvents();
  refreshDashboard();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}

if (typeof module !== 'undefined') {
  module.exports = {
    summarizeEntries,
    buildWeeklySummaryText,
    buildWeeklyReportCsv,
  };
}
