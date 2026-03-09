let processes = [];
let schedulingResult = null;
let charts = {
    waitingTime: null,
    turnaroundTime: null,
    comparison: null
};

let processIdCounter = 1;

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function exportResultsAsPDF() {
    if (!schedulingResult) {
        showToast('No results to export. Please simulate first.', 'error');
        return;
    }

    const pdfContent = document.createElement('div');
    pdfContent.style.padding = '20px';
    pdfContent.style.backgroundColor = '#ffffff';
    pdfContent.style.fontFamily = 'Arial, sans-serif';
    pdfContent.style.color = '#000000';

    const title = document.createElement('h1');
    title.textContent = 'CPU Scheduling Simulation Report';
    title.style.textAlign = 'center';
    title.style.color = '#000000';
    title.style.marginBottom = '10px';
    title.style.fontSize = '24px';
    title.style.fontWeight = 'bold';
    pdfContent.appendChild(title);

    const timestamp = document.createElement('p');
    timestamp.textContent = `Generated: ${new Date().toLocaleString()}`;
    timestamp.style.textAlign = 'center';
    timestamp.style.color = '#333333';
    timestamp.style.marginBottom = '30px';
    timestamp.style.fontSize = '12px';
    pdfContent.appendChild(timestamp);

    const algorithm = document.getElementById('algorithm').value;
    const algoName = document.getElementById('algorithm').options[document.getElementById('algorithm').selectedIndex].text;
    const algoSection = document.createElement('div');
    algoSection.style.marginBottom = '30px';
    algoSection.style.padding = '15px';
    algoSection.style.backgroundColor = '#f5f5f5';
    algoSection.style.border = '2px solid #000000';
    algoSection.style.borderRadius = '5px';
    algoSection.innerHTML = `<h3 style="color: #000000; margin-top: 0; margin-bottom: 0;">Algorithm: ${algoName}</h3>`;
    pdfContent.appendChild(algoSection);

    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection && resultsSection.style.display !== 'none') {
        const resultClone = resultsSection.cloneNode(true);
        resultClone.style.backgroundColor = '#ffffff';
        resultClone.style.padding = '20px';
        resultClone.style.color = '#000000';
        
        // Remove export button
        const exportBtn = resultClone.querySelector('.export-section');
        if (exportBtn) {
            exportBtn.remove();
        }

        // Style tables for PDF - Black and White only
        const tables = resultClone.querySelectorAll('table');
        tables.forEach(table => {
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginBottom = '20px';
            table.querySelectorAll('th, td').forEach(cell => {
                cell.style.border = '1px solid #000000';
                cell.style.padding = '12px';
                cell.style.textAlign = 'left';
                cell.style.color = '#000000';
                cell.style.backgroundColor = '#ffffff';
            });
            table.querySelectorAll('th').forEach(th => {
                th.style.backgroundColor = '#000000';
                th.style.color = '#ffffff';
                th.style.fontWeight = 'bold';
            });
        });

        // Style metrics
        const metrics = resultClone.querySelectorAll('.metrics-grid');
        metrics.forEach(metric => {
            metric.style.display = 'grid';
            metric.style.gridTemplateColumns = 'repeat(2, 1fr)';
            metric.style.gap = '15px';
            metric.style.marginBottom = '20px';
        });

        const metricItems = resultClone.querySelectorAll('.metric-item');
        metricItems.forEach(item => {
            item.style.backgroundColor = '#f5f5f5';
            item.style.padding = '15px';
            item.style.border = '1px solid #000000';
            item.style.borderRadius = '5px';
            item.style.color = '#000000';
        });

        // Style headings
        const headings = resultClone.querySelectorAll('h3');
        headings.forEach(h => {
            h.style.color = '#000000';
            h.style.borderBottom = '2px solid #000000';
            h.style.paddingBottom = '10px';
        });

        // Style all cards for consistent white background
        const allCards = resultClone.querySelectorAll('.card');
        allCards.forEach(card => {
            card.style.backgroundColor = '#ffffff';
            card.style.color = '#000000';
            card.style.border = '1px solid #000000';
            card.style.marginBottom = '20px';
            card.style.padding = '20px';
        });

        // Style Gantt Chart - Black and White
        const ganttCards = resultClone.querySelectorAll('.gantt-card');
        ganttCards.forEach(ganttCard => {
            ganttCard.style.backgroundColor = '#ffffff';
            ganttCard.style.color = '#000000';
            ganttCard.style.border = '2px solid #000000';
        });

        const ganttCharts = resultClone.querySelectorAll('#ganttChart');
        ganttCharts.forEach(ganttChart => {
            ganttChart.style.backgroundColor = '#ffffff';
            ganttChart.style.padding = '15px';
            ganttChart.style.borderRadius = '5px';
            const svg = ganttChart.querySelector('svg');
            if (svg) {
                svg.style.backgroundColor = '#ffffff';
            }
            // Style all SVG elements for black and white
            const allShapes = ganttChart.querySelectorAll('rect, circle, line, text, path, polygon');
            allShapes.forEach(shape => {
                const fill = shape.getAttribute('fill');
                const stroke = shape.getAttribute('stroke');
                
                // Convert colored fills to grayscale
                if (fill && fill !== 'none' && fill !== '#ffffff') {
                    shape.setAttribute('fill', '#e0e0e0');
                }
                // Keep black strokes, convert colors to black
                if (stroke && stroke !== 'none' && stroke !== '#ffffff' && stroke !== '#000000') {
                    shape.setAttribute('stroke', '#000000');
                }
            });
        });

        // Hide charts temporarily (they're not easily exportable)
        const charts = resultClone.querySelectorAll('canvas');
        charts.forEach(chart => {
            const chartCard = chart.closest('.chart-card');
            if (chartCard) {
                chartCard.style.display = 'none';
            }
        });

        pdfContent.appendChild(resultClone);
    }

    // Add comparison section if available
    const comparisonSection = document.getElementById('comparisonSection');
    if (comparisonSection && comparisonSection.style.display !== 'none') {
        const pageBreak = document.createElement('div');
        pageBreak.style.pageBreakBefore = 'always';
        pageBreak.style.marginTop = '40px';
        pdfContent.appendChild(pageBreak);

        const comparisonTitle = document.createElement('h2');
        comparisonTitle.textContent = 'Algorithm Comparison';
        comparisonTitle.style.color = '#000000';
        comparisonTitle.style.marginBottom = '20px';
        comparisonTitle.style.borderBottom = '2px solid #000000';
        comparisonTitle.style.paddingBottom = '10px';
        pdfContent.appendChild(comparisonTitle);

        const comparisonClone = comparisonSection.cloneNode(true);
        comparisonClone.style.display = 'block';
        comparisonClone.style.padding = '20px';
        comparisonClone.style.color = '#000000';
        comparisonClone.style.backgroundColor = '#ffffff';

        // Style all cards in comparison section with white background
        const comparisonCards = comparisonClone.querySelectorAll('.card');
        comparisonCards.forEach(card => {
            card.style.backgroundColor = '#ffffff';
            card.style.color = '#000000';
            card.style.border = '1px solid #000000';
            card.style.marginBottom = '20px';
            card.style.padding = '20px';
        });

        // Style comparison tables - Black and White
        const compTables = comparisonClone.querySelectorAll('table');
        compTables.forEach(table => {
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginBottom = '20px';
            table.querySelectorAll('th, td').forEach(cell => {
                cell.style.border = '1px solid #000000';
                cell.style.padding = '12px';
                cell.style.textAlign = 'left';
                cell.style.color = '#000000';
                cell.style.backgroundColor = '#ffffff';
            });
            table.querySelectorAll('th').forEach(th => {
                th.style.backgroundColor = '#000000';
                th.style.color = '#ffffff';
                th.style.fontWeight = 'bold';
            });
        });

        // Hide comparison chart
        const compCharts = comparisonClone.querySelectorAll('canvas');
        compCharts.forEach(chart => {
            const chartCard = chart.closest('.card');
            if (chartCard && chartCard.textContent.includes('Comparison Chart')) {
                chartCard.style.display = 'none';
            }
        });

        // Style recommendation card - Black and White
        const recCard = comparisonClone.querySelector('.recommendation-card');
        if (recCard) {
            recCard.style.backgroundColor = '#ffffff';
            recCard.style.border = '2px solid #000000';
            recCard.style.padding = '20px';
            recCard.style.borderRadius = '5px';
            recCard.style.marginTop = '20px';
            recCard.style.color = '#000000';
        }

        pdfContent.appendChild(comparisonClone);
    }

    // Generate PDF
    const element = pdfContent;
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `CPU_Scheduling_Report_${new Date().getTime()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    try {
        html2pdf().set(opt).from(element).save();
        showToast('PDF exported successfully!', 'success');
    } catch (error) {
        console.error('PDF export error:', error);
        showToast('Error exporting PDF', 'error');
    }
}

/**
 * Validate process input
 */
function validateInput() {
    const processId = document.getElementById('processId').value.trim();
    const arrivalTime = parseInt(document.getElementById('arrivalTime').value);
    const burstTime = parseInt(document.getElementById('burstTime').value);
    const algorithm = document.getElementById('algorithm').value;
    
    if (!processId) {
        showToast('Process ID is required', 'error');
        return null;
    }
    
    if (isNaN(arrivalTime) || arrivalTime < 0) {
        showToast('Arrival Time must be non-negative', 'error');
        return null;
    }
    
    if (isNaN(burstTime) || burstTime <= 0) {
        showToast('Burst Time must be positive', 'error');
        return null;
    }
    
    // Validate priority if needed
    if (['nonPreemptivePriority', 'preemptivePriority', 'priorityRoundRobin'].includes(algorithm)) {
        const priority = parseInt(document.getElementById('priority').value);
        if (isNaN(priority) || priority <= 0) {
            showToast('Priority must be positive', 'error');
            return null;
        }
        return { processId, arrivalTime, burstTime, priority };
    }
    
    return { processId, arrivalTime, burstTime, priority: 0 };
}

/**
 * Auto-generate process ID
 */
function generateProcessId() {
    return `P${processIdCounter}`;
}

/**
 * Update priority input visibility based on algorithm
 */
function updateFormVisibility() {
    const algorithm = document.getElementById('algorithm').value;
    const priorityGroup = document.getElementById('priorityGroup');
    const priorityHeader = document.getElementById('priorityHeader');
    const timeQuantumGroup = document.getElementById('timeQuantumGroup');
    const responseTimeHeader = document.getElementById('responseTimeHeader');
    
    // Show/hide priority
    const needsPriority = ['nonPreemptivePriority', 'preemptivePriority', 'priorityRoundRobin'].includes(algorithm);
    priorityGroup.style.display = needsPriority ? 'block' : 'none';
    priorityHeader.style.display = needsPriority ? 'table-cell' : 'none';
    
    // Show/hide time quantum
    const needsTimeQuantum = ['roundRobin', 'priorityRoundRobin'].includes(algorithm);
    timeQuantumGroup.style.display = needsTimeQuantum ? 'block' : 'none';
    
    // Show/hide response time (preemptive algorithms)
    const isPreemptive = ['roundRobin', 'srtf', 'preemptivePriority', 'priorityRoundRobin'].includes(algorithm);
    responseTimeHeader.style.display = isPreemptive ? 'table-cell' : 'none';
}

/**
 * Render process table
 */
function renderProcessTable() {
    const tableBody = document.getElementById('tableBody');
    const priorityHeader = document.getElementById('priorityHeader');
    const algorithm = document.getElementById('algorithm').value;
    const needsPriority = ['nonPreemptivePriority', 'preemptivePriority', 'priorityRoundRobin'].includes(algorithm);
    
    if (processes.length === 0) {
        tableBody.innerHTML = '<tr class="empty-row"><td colspan="4">No processes added yet</td></tr>';
        return;
    }
    
    tableBody.innerHTML = processes.map(p => `
        <tr>
            <td>${p.processId}</td>
            <td>${p.arrivalTime}</td>
            <td>${p.burstTime}</td>
            ${needsPriority ? `<td>${p.priority}</td>` : ''}
        </tr>
    `).join('');
}

// ==================== SCHEDULING ALGORITHMS ====================

/**
 * First Come First Serve (FCFS)
 */
function fcfs(processes) {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const results = [];
    let currentTime = 0;
    
    sortedProcesses.forEach(process => {
        if (currentTime < process.arrivalTime) {
            currentTime = process.arrivalTime;
        }
        
        const completionTime = currentTime + process.burstTime;
        const turnaroundTime = completionTime - process.arrivalTime;
        const waitingTime = turnaroundTime - process.burstTime;
        
        results.push({
            processId: process.processId,
            completionTime,
            waitingTime,
            turnaroundTime,
            responseTime: waitingTime
        });
        
        currentTime = completionTime;
    });
    
    return {
        results,
        gantt: generateFCFSGantt(sortedProcesses)
    };
}

function generateFCFSGantt(processes) {
    const gantt = [];
    let currentTime = 0;
    
    processes.forEach(process => {
        if (currentTime < process.arrivalTime) {
            gantt.push({ process: 'Idle', start: currentTime, end: process.arrivalTime });
            currentTime = process.arrivalTime;
        }
        
        gantt.push({ process: process.processId, start: currentTime, end: currentTime + process.burstTime });
        currentTime += process.burstTime;
    });
    
    return gantt;
}

/**
 * Shortest Job First (SJF) - Non-Preemptive
 */
function sjf(processes) {
    const results = [];
    const remaining = [...processes].map(p => ({ ...p }));
    let currentTime = 0;
    const gantt = [];
    
    while (remaining.length > 0) {
        // Get available processes
        const available = remaining.filter(p => p.arrivalTime <= currentTime);
        
        if (available.length === 0) {
            // Idle time
            const nextArrival = remaining[0].arrivalTime;
            gantt.push({ process: 'Idle', start: currentTime, end: nextArrival });
            currentTime = nextArrival;
            continue;
        }
        
        // Select process with shortest burst time
        const next = available.reduce((a, b) => a.burstTime < b.burstTime ? a : b);
        
        const completionTime = currentTime + next.burstTime;
        const turnaroundTime = completionTime - next.arrivalTime;
        const waitingTime = turnaroundTime - next.burstTime;
        
        results.push({
            processId: next.processId,
            completionTime,
            waitingTime,
            turnaroundTime,
            responseTime: waitingTime
        });
        
        gantt.push({ process: next.processId, start: currentTime, end: completionTime });
        currentTime = completionTime;
        
        remaining.splice(remaining.indexOf(next), 1);
    }
    
    return { results, gantt };
}

/**
 * Non-Preemptive Priority (Lower number = Higher priority)
 */
function nonPreemptivePriority(processes) {
    const results = [];
    const remaining = [...processes].map(p => ({ ...p }));
    let currentTime = 0;
    const gantt = [];
    
    while (remaining.length > 0) {
        const available = remaining.filter(p => p.arrivalTime <= currentTime);
        
        if (available.length === 0) {
            const nextArrival = remaining[0].arrivalTime;
            gantt.push({ process: 'Idle', start: currentTime, end: nextArrival });
            currentTime = nextArrival;
            continue;
        }
        
        // Select process with highest priority (lowest number)
        const next = available.reduce((a, b) => a.priority < b.priority ? a : b);
        
        const completionTime = currentTime + next.burstTime;
        const turnaroundTime = completionTime - next.arrivalTime;
        const waitingTime = turnaroundTime - next.burstTime;
        
        results.push({
            processId: next.processId,
            completionTime,
            waitingTime,
            turnaroundTime,
            responseTime: waitingTime
        });
        
        gantt.push({ process: next.processId, start: currentTime, end: completionTime });
        currentTime = completionTime;
        remaining.splice(remaining.indexOf(next), 1);
    }
    
    return { results, gantt };
}

/**
 * Round Robin (Preemptive)
 */
function roundRobin(processes, timeQuantum) {
    const results = {};
    const remaining = [...processes].map(p => ({ ...p, remainingTime: p.burstTime, started: false, startTime: null }));
    let currentTime = 0;
    const gantt = [];
    
    processes.forEach(p => {
        results[p.processId] = { responseTime: null };
    });
    
    while (remaining.length > 0) {
        const available = remaining.filter(p => p.arrivalTime <= currentTime);
        
        if (available.length === 0) {
            const nextArrival = remaining[0].arrivalTime;
            gantt.push({ process: 'Idle', start: currentTime, end: nextArrival });
            currentTime = nextArrival;
            continue;
        }
        
        const process = available[0];
        if (!process.started) {
            process.started = true;
            process.startTime = currentTime;
            results[process.processId].responseTime = currentTime - process.arrivalTime;
        }
        
        const timeSlice = Math.min(timeQuantum, process.remainingTime);
        gantt.push({ process: process.processId, start: currentTime, end: currentTime + timeSlice });
        
        process.remainingTime -= timeSlice;
        currentTime += timeSlice;
        
        if (process.remainingTime > 0) {
            remaining.push(remaining.shift());
        } else {
            remaining.shift();
        }
    }
    
    const finalResults = processes.map(p => {
        const completionTime = gantt.filter(g => g.process === p.processId).reduce((max, g) => Math.max(max, g.end), 0);
        const turnaroundTime = completionTime - p.arrivalTime;
        const waitingTime = turnaroundTime - p.burstTime;
        
        return {
            processId: p.processId,
            completionTime,
            waitingTime,
            turnaroundTime,
            responseTime: results[p.processId].responseTime
        };
    });
    
    return { results: finalResults, gantt };
}

/**
 * Shortest Remaining Time First (SRTF) - Preemptive
 */
function srtf(processes) {
    const results = {};
    const remaining = [...processes].map(p => ({ ...p, remainingTime: p.burstTime, started: false, startTime: null }));
    let currentTime = 0;
    const gantt = [];
    
    processes.forEach(p => {
        results[p.processId] = { responseTime: null };
    });
    
    while (remaining.length > 0) {
        const available = remaining.filter(p => p.arrivalTime <= currentTime);
        
        if (available.length === 0) {
            const nextArrival = remaining[0].arrivalTime;
            gantt.push({ process: 'Idle', start: currentTime, end: nextArrival });
            currentTime = nextArrival;
            continue;
        }
        
        // Select process with shortest remaining time
        const process = available.reduce((a, b) => a.remainingTime < b.remainingTime ? a : b);
        
        if (!process.started) {
            process.started = true;
            process.startTime = currentTime;
            results[process.processId].responseTime = currentTime - process.arrivalTime;
        }
        
        gantt.push({ process: process.processId, start: currentTime, end: currentTime + 1 });
        process.remainingTime -= 1;
        currentTime += 1;
        
        if (process.remainingTime <= 0) {
            remaining.splice(remaining.indexOf(process), 1);
        }
    }
    
    const finalResults = processes.map(p => {
        const completionTime = gantt.filter(g => g.process === p.processId).reduce((max, g) => Math.max(max, g.end), 0);
        const turnaroundTime = completionTime - p.arrivalTime;
        const waitingTime = turnaroundTime - p.burstTime;
        
        return {
            processId: p.processId,
            completionTime,
            waitingTime,
            turnaroundTime,
            responseTime: results[p.processId].responseTime
        };
    });
    
    return { results: finalResults, gantt };
}

/**
 * Preemptive Priority (Lower number = Higher priority)
 */
function preemptivePriority(processes) {
    const results = {};
    const remaining = [...processes].map(p => ({ ...p, remainingTime: p.burstTime, started: false, startTime: null }));
    let currentTime = 0;
    const gantt = [];
    
    processes.forEach(p => {
        results[p.processId] = { responseTime: null };
    });
    
    while (remaining.length > 0) {
        const available = remaining.filter(p => p.arrivalTime <= currentTime);
        
        if (available.length === 0) {
            const nextArrival = remaining[0].arrivalTime;
            gantt.push({ process: 'Idle', start: currentTime, end: nextArrival });
            currentTime = nextArrival;
            continue;
        }
        
        // Select process with highest priority
        const process = available.reduce((a, b) => a.priority < b.priority ? a : b);
        
        if (!process.started) {
            process.started = true;
            process.startTime = currentTime;
            results[process.processId].responseTime = currentTime - process.arrivalTime;
        }
        
        gantt.push({ process: process.processId, start: currentTime, end: currentTime + 1 });
        process.remainingTime -= 1;
        currentTime += 1;
        
        if (process.remainingTime <= 0) {
            remaining.splice(remaining.indexOf(process), 1);
        }
    }
    
    const finalResults = processes.map(p => {
        const completionTime = gantt.filter(g => g.process === p.processId).reduce((max, g) => Math.max(max, g.end), 0);
        const turnaroundTime = completionTime - p.arrivalTime;
        const waitingTime = turnaroundTime - p.burstTime;
        
        return {
            processId: p.processId,
            completionTime,
            waitingTime,
            turnaroundTime,
            responseTime: results[p.processId].responseTime
        };
    });
    
    return { results: finalResults, gantt };
}

/**
 * Priority with Round Robin
 */
function priorityRoundRobin(processes, timeQuantum) {
    const results = {};
    const remaining = [...processes].map(p => ({ ...p, remainingTime: p.burstTime, started: false, startTime: null }));
    let currentTime = 0;
    const gantt = [];
    
    processes.forEach(p => {
        results[p.processId] = { responseTime: null };
    });
    
    while (remaining.length > 0) {
        const available = remaining.filter(p => p.arrivalTime <= currentTime);
        
        if (available.length === 0) {
            const nextArrival = remaining[0].arrivalTime;
            gantt.push({ process: 'Idle', start: currentTime, end: nextArrival });
            currentTime = nextArrival;
            continue;
        }
        
        // Sort by priority, then maintain order for round robin
        available.sort((a, b) => a.priority - b.priority);
        const process = available[0];
        
        if (!process.started) {
            process.started = true;
            process.startTime = currentTime;
            results[process.processId].responseTime = currentTime - process.arrivalTime;
        }
        
        const timeSlice = Math.min(timeQuantum, process.remainingTime);
        gantt.push({ process: process.processId, start: currentTime, end: currentTime + timeSlice });
        
        process.remainingTime -= timeSlice;
        currentTime += timeSlice;
        
        if (process.remainingTime > 0) {
            remaining.push(remaining.shift());
        } else {
            remaining.shift();
        }
    }
    
    const finalResults = processes.map(p => {
        const completionTime = gantt.filter(g => g.process === p.processId).reduce((max, g) => Math.max(max, g.end), 0);
        const turnaroundTime = completionTime - p.arrivalTime;
        const waitingTime = turnaroundTime - p.burstTime;
        
        return {
            processId: p.processId,
            completionTime,
            waitingTime,
            turnaroundTime,
            responseTime: results[p.processId].responseTime
        };
    });
    
    return { results: finalResults, gantt };
}

// ==================== SCHEDULING EXECUTOR ====================

/**
 * Execute scheduling algorithm
 */
function executeScheduling() {
    if (processes.length === 0) {
        showToast('Please add at least one process', 'error');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        try {
            const algorithm = document.getElementById('algorithm').value;
            const timeQuantum = parseInt(document.getElementById('timeQuantum').value) || 2;
            
            let result;
            
            switch(algorithm) {
                case 'fcfs':
                    result = fcfs(processes);
                    break;
                case 'sjf':
                    result = sjf(processes);
                    break;
                case 'nonPreemptivePriority':
                    result = nonPreemptivePriority(processes);
                    break;
                case 'roundRobin':
                    result = roundRobin(processes, timeQuantum);
                    break;
                case 'srtf':
                    result = srtf(processes);
                    break;
                case 'preemptivePriority':
                    result = preemptivePriority(processes);
                    break;
                case 'priorityRoundRobin':
                    result = priorityRoundRobin(processes, timeQuantum);
                    break;
                default:
                    result = fcfs(processes);
            }
            
            schedulingResult = result;
            renderResults(result);
            hideLoading();
            showToast('Simulation completed successfully!', 'success');
            
        } catch (error) {
            hideLoading();
            showToast('Error during simulation: ' + error.message, 'error');
            console.error(error);
        }
    }, 500);
}

// ==================== RESULTS RENDERING ====================

/**
 * Render scheduling results
 */
function renderResults(result) {
    renderResultsTable(result.results);
    renderGanttChart(result.gantt);
    renderMetrics(result.results, result.gantt);
    
    const algorithm = document.getElementById('algorithm').value;
    const isPreemptive = ['roundRobin', 'srtf', 'preemptivePriority', 'priorityRoundRobin'].includes(algorithm);
    renderCharts(result.results, isPreemptive);
    
    document.getElementById('resultsSection').style.display = 'block';
}

/**
 * Render results table
 */
function renderResultsTable(results) {
    const resultsTableBody = document.getElementById('resultsTableBody');
    const responseTimeHeader = document.getElementById('responseTimeHeader');
    const algorithm = document.getElementById('algorithm').value;
    const isPreemptive = ['roundRobin', 'srtf', 'preemptivePriority', 'priorityRoundRobin'].includes(algorithm);
    
    resultsTableBody.innerHTML = results.map(r => `
        <tr>
            <td>${r.processId}</td>
            <td>${r.completionTime}</td>
            <td>${r.waitingTime}</td>
            <td>${r.turnaroundTime}</td>
            ${isPreemptive ? `<td>${r.responseTime}</td>` : ''}
        </tr>
    `).join('');
}

/**
 * Generate color for process
 */
function getProcessColor(processId) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6'
    ];
    
    const index = parseInt(processId.replace('P', '')) % colors.length;
    return colors[index];
}

/**
 * Render Gantt Chart
 */
function renderGanttChart(gantt) {
    const ganttChart = document.getElementById('ganttChart');
    const maxTime = Math.max(...gantt.map(g => g.end));
    
    ganttChart.innerHTML = '';
    
    // Create SVG-like timeline with better structure
    const container = document.createElement('div');
    container.style.width = '100%';
    
    // Group gantt items by process for better visualization
    const processGanttMap = {};
    gantt.forEach(item => {
        if (!processGanttMap[item.process]) {
            processGanttMap[item.process] = [];
        }
        processGanttMap[item.process].push(item);
    });
    
    // Create a row for the timeline
    const timelineRow = document.createElement('div');
    timelineRow.style.display = 'flex';
    timelineRow.style.alignItems = 'center';
    timelineRow.style.marginBottom = '20px';
    timelineRow.style.position = 'relative';
    
    const timelineContent = document.createElement('div');
    timelineContent.style.flex = '1';
    timelineContent.style.position = 'relative';
    timelineContent.style.height = '400px';
    timelineContent.style.background = 'rgba(0, 0, 0, 0.2)';
    timelineContent.style.borderRadius = '10px';
    timelineContent.style.borderLeft = '2px solid var(--primary-color)';
    timelineContent.style.borderBottom = '2px solid var(--primary-color)';
    timelineContent.style.padding = '20px';
    
    let rowY = 20;
    
    // Render each process's gantt blocks
    Object.entries(processGanttMap).forEach(([processId, items], rowIndex) => {
        const processColor = processId === 'Idle' ? '#444' : getProcessColor(processId);
        
        items.forEach((item, blockIndex) => {
            const block = document.createElement('div');
            block.style.position = 'absolute';
            block.style.top = (rowY + rowIndex * 50) + 'px';
            block.style.left = (item.start / maxTime * 100) + '%';
            block.style.width = ((item.end - item.start) / maxTime * 100) + '%';
            block.style.height = '40px';
            block.style.backgroundColor = processColor;
            block.style.border = '2px solid ' + (processId === 'Idle' ? '#666' : processColor);
            block.style.borderRadius = '6px';
            block.style.display = 'flex';
            block.style.alignItems = 'center';
            block.style.justifyContent = 'center';
            block.style.color = '#000';
            block.style.fontWeight = 'bold';
            block.style.fontSize = '12px';
            block.style.cursor = 'pointer';
            block.style.minWidth = '50px';
            block.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            block.style.transition = 'all 0.3s ease';
            block.style.animation = `slideUp 0.5s ease forwards`;
            block.style.animationDelay = (blockIndex * 0.1) + 's';
            block.style.opacity = '0';
            
            if (processId !== 'Idle') {
                block.textContent = `${processId}\n${item.start}-${item.end}`;
                block.style.whiteSpace = 'pre-wrap';
                block.style.textAlign = 'center';
                block.style.fontSize = '11px';
            }
            
            block.title = `${processId} (${item.start}-${item.end})`;
            
            block.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
                this.style.filter = 'brightness(1.2)';
            });
            
            block.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.filter = 'brightness(1)';
            });
            
            timelineContent.appendChild(block);
        });
    });
    
    // Add time axis labels
    const timeAxisDiv = document.createElement('div');
    timeAxisDiv.style.position = 'absolute';
    timeAxisDiv.style.bottom = '-30px';
    timeAxisDiv.style.left = '0';
    timeAxisDiv.style.right = '0';
    timeAxisDiv.style.display = 'flex';
    timeAxisDiv.style.justifyContent = 'space-between';
    timeAxisDiv.style.paddingRight = '20px';
    
    for (let i = 0; i <= maxTime; i += Math.max(1, Math.ceil(maxTime / 10))) {
        const label = document.createElement('span');
        label.textContent = i;
        label.style.fontSize = '12px';
        label.style.color = 'var(--text-secondary)';
        label.style.fontWeight = '500';
        timeAxisDiv.appendChild(label);
    }
    
    timelineContent.appendChild(timeAxisDiv);
    timelineRow.appendChild(timelineContent);
    container.appendChild(timelineRow);
    
    ganttChart.appendChild(container);
    
    // Add legend
    const legendDiv = document.createElement('div');
    legendDiv.style.marginTop = '30px';
    legendDiv.style.display = 'flex';
    legendDiv.style.flexWrap = 'wrap';
    legendDiv.style.gap = '20px';
    
    Object.keys(processGanttMap).forEach(processId => {
        if (processId !== 'Idle') {
            const legendItem = document.createElement('div');
            legendItem.style.display = 'flex';
            legendItem.style.alignItems = 'center';
            legendItem.style.gap = '8px';
            
            const colorBox = document.createElement('div');
            colorBox.style.width = '24px';
            colorBox.style.height = '24px';
            colorBox.style.backgroundColor = getProcessColor(processId);
            colorBox.style.borderRadius = '4px';
            colorBox.style.border = '2px solid ' + getProcessColor(processId);
            
            const label = document.createElement('span');
            label.textContent = processId;
            label.style.color = 'var(--text-primary)';
            label.style.fontSize = '14px';
            label.style.fontWeight = '500';
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legendDiv.appendChild(legendItem);
        }
    });
    
    ganttChart.appendChild(legendDiv);
}

/**
 * Render Performance Metrics
 */
function renderMetrics(results, gantt) {
    const avgWaitingTime = results.reduce((sum, r) => sum + r.waitingTime, 0) / results.length;
    const avgTurnaroundTime = results.reduce((sum, r) => sum + r.turnaroundTime, 0) / results.length;
    const maxCompletionTime = Math.max(...gantt.map(g => g.end));
    const totalBurstTime = results.reduce((sum, r) => sum + (r.turnaroundTime - r.waitingTime), 0);
    const cpuUtilization = (totalBurstTime / maxCompletionTime * 100).toFixed(2);
    const throughput = (results.length / maxCompletionTime).toFixed(2);
    
    document.getElementById('avgWaitingTime').textContent = avgWaitingTime.toFixed(2);
    document.getElementById('avgTurnaroundTime').textContent = avgTurnaroundTime.toFixed(2);
    document.getElementById('throughput').textContent = throughput;
    document.getElementById('cpuUtilization').textContent = cpuUtilization + '%';
    
    // Check if response time should be displayed
    const algorithm = document.getElementById('algorithm').value;
    const isPreemptive = ['roundRobin', 'srtf', 'preemptivePriority', 'priorityRoundRobin'].includes(algorithm);
    
    if (isPreemptive) {
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        document.getElementById('avgResponseTime').textContent = avgResponseTime.toFixed(2);
        document.getElementById('avgResponseTimeItem').style.display = 'block';
        document.getElementById('responseTimeHeader').style.display = 'table-cell';
    } else {
        document.getElementById('avgResponseTimeItem').style.display = 'none';
    }
}

/**
 * Render Charts using Chart.js
 */
function renderCharts(results, isPreemptive) {
    const processIds = results.map(r => r.processId);
    const waitingTimes = results.map(r => r.waitingTime);
    const turnaroundTimes = results.map(r => r.turnaroundTime);
    
    // Destroy existing charts
    if (charts.waitingTime) charts.waitingTime.destroy();
    if (charts.turnaroundTime) charts.turnaroundTime.destroy();
    
    // Waiting Time Chart
    const wtCtx = document.getElementById('waitingTimeChart').getContext('2d');
    charts.waitingTime = new Chart(wtCtx, {
        type: 'bar',
        data: {
            labels: processIds,
            datasets: [{
                label: 'Waiting Time',
                data: waitingTimes,
                backgroundColor: '#00d4ff',
                borderColor: '#00d4ff',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                filler: { propagate: true }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#a0a0c0' },
                    grid: { color: 'rgba(0, 212, 255, 0.1)' }
                },
                x: { ticks: { color: '#a0a0c0' }, grid: { display: false } }
            }
        }
    });
    
    // Turnaround Time Chart
    const ttCtx = document.getElementById('turnaroundTimeChart').getContext('2d');
    charts.turnaroundTime = new Chart(ttCtx, {
        type: 'bar',
        data: {
            labels: processIds,
            datasets: [{
                label: 'Turnaround Time',
                data: turnaroundTimes,
                backgroundColor: '#7c3aed',
                borderColor: '#7c3aed',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#a0a0c0' },
                    grid: { color: 'rgba(124, 58, 237, 0.1)' }
                },
                x: { ticks: { color: '#a0a0c0' }, grid: { display: false } }
            }
        }
    });
}

// ==================== COMPARISON FEATURE ====================

/**
 * Run all algorithms and compare
 */
function compareAllAlgorithms() {
    if (processes.length === 0) {
        showToast('Please add at least one process', 'error');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        try {
            const timeQuantum = parseInt(document.getElementById('timeQuantum').value) || 2;
            
            const algorithms = [
                { name: 'FCFS', func: () => fcfs(processes) },
                { name: 'SJF', func: () => sjf(processes) },
                { name: 'Non-Preemptive Priority', func: () => nonPreemptivePriority(processes) },
                { name: 'Round Robin', func: () => roundRobin(processes, timeQuantum) },
                { name: 'SRTF', func: () => srtf(processes) },
                { name: 'Preemptive Priority', func: () => preemptivePriority(processes) },
                { name: 'Priority with RR', func: () => priorityRoundRobin(processes, timeQuantum) }
            ];
            
            const results = algorithms.map(algo => {
                const result = algo.func();
                const avgWaitingTime = result.results.reduce((sum, r) => sum + r.waitingTime, 0) / result.results.length;
                const avgTurnaroundTime = result.results.reduce((sum, r) => sum + r.turnaroundTime, 0) / result.results.length;
                const avgResponseTime = result.results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / result.results.length;
                
                return {
                    algorithm: algo.name,
                    avgWaitingTime: parseFloat(avgWaitingTime.toFixed(2)),
                    avgTurnaroundTime: parseFloat(avgTurnaroundTime.toFixed(2)),
                    avgResponseTime: parseFloat(avgResponseTime.toFixed(2))
                };
            });
            
            renderComparison(results);
            hideLoading();
            showToast('Comparison completed!', 'success');
            
        } catch (error) {
            hideLoading();
            showToast('Error during comparison: ' + error.message, 'error');
            console.error(error);
        }
    }, 500);
}

/**
 * Render comparison results
 */
function renderComparison(results) {
    const comparisonSection = document.getElementById('comparisonSection');
    const comparisonTableBody = document.getElementById('comparisonTableBody');
    
    // Find best algorithm
    const best = results.reduce((a, b) => a.avgWaitingTime < b.avgWaitingTime ? a : b);
    
    // Render table
    comparisonTableBody.innerHTML = results.map(r => `
        <tr ${r.algorithm === best.algorithm ? 'style="background: rgba(0, 255, 136, 0.1); border: 2px solid var(--success);"' : ''}>
            <td><strong>${r.algorithm}</strong></td>
            <td>${r.avgWaitingTime.toFixed(2)}</td>
            <td>${r.avgTurnaroundTime.toFixed(2)}</td>
            <td>${r.avgResponseTime.toFixed(2)}</td>
        </tr>
    `).join('');
    
    // Render chart
    renderComparisonChart(results);
    
    // Render recommendation
    const recommendationContent = document.getElementById('recommendationContent');
    recommendationContent.innerHTML = `
        <h4>🏆 Recommended Algorithm: ${best.algorithm}</h4>
        <p><strong>Reason:</strong> Has the lowest average waiting time (${best.avgWaitingTime.toFixed(2)})</p>
        <p><strong>Average Turnaround Time:</strong> ${best.avgTurnaroundTime.toFixed(2)}</p>
        <p><strong>Average Response Time:</strong> ${best.avgResponseTime.toFixed(2)}</p>
    `;
    
    comparisonSection.style.display = 'block';
}

/**
 * Render comparison chart
 */
function renderComparisonChart(results) {
    if (charts.comparison) charts.comparison.destroy();
    
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    const algorithms = results.map(r => r.algorithm);
    const waitingTimes = results.map(r => r.avgWaitingTime);
    const turnaroundTimes = results.map(r => r.avgTurnaroundTime);
    
    charts.comparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: algorithms,
            datasets: [
                {
                    label: 'Avg Waiting Time',
                    data: waitingTimes,
                    backgroundColor: '#00d4ff',
                    borderColor: '#00d4ff',
                    borderWidth: 2,
                    borderRadius: 5
                },
                {
                    label: 'Avg Turnaround Time',
                    data: turnaroundTimes,
                    backgroundColor: '#7c3aed',
                    borderColor: '#7c3aed',
                    borderWidth: 2,
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#a0a0c0' },
                    grid: { color: 'rgba(0, 212, 255, 0.1)' }
                },
                x: { ticks: { color: '#a0a0c0' }, grid: { display: false } }
            },
            plugins: {
                legend: {
                    labels: { color: '#a0a0c0' }
                }
            }
        }
    });
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
    // Algorithm change
    document.getElementById('algorithm').addEventListener('change', updateFormVisibility);
    
    // Add process
    document.getElementById('addBtn').addEventListener('click', () => {
        const input = validateInput();
        if (input) {
            if (!input.processId) {
                input.processId = generateProcessId();
            }
            processes.push(input);
            processIdCounter++;
            renderProcessTable();
            showToast(`${input.processId} added successfully`, 'success');
            
            // Clear inputs
            document.getElementById('processId').value = generateProcessId();
            document.getElementById('arrivalTime').value = '0';
            document.getElementById('burstTime').value = '1';
            document.getElementById('priority').value = '1';
        }
    });
    
    // Remove last process
    document.getElementById('removeBtn').addEventListener('click', () => {
        if (processes.length > 0) {
            const removed = processes.pop();
            showToast(`${removed.processId} removed`, 'success');
            renderProcessTable();
        } else {
            showToast('No processes to remove', 'error');
        }
    });
    
    // Reset
    document.getElementById('resetBtn').addEventListener('click', () => {
        processes = [];
        processIdCounter = 1;
        schedulingResult = null;
        document.getElementById('processId').value = generateProcessId();
        document.getElementById('arrivalTime').value = '0';
        document.getElementById('burstTime').value = '1';
        document.getElementById('priority').value = '1';
        document.getElementById('resultsSection').style.display = 'none';
        renderProcessTable();
        showToast('All data reset', 'success');
    });
    
    // Simulate
    document.getElementById('simulateBtn').addEventListener('click', executeScheduling);
    
    // Compare All
    document.getElementById('compareAllBtn').addEventListener('click', compareAllAlgorithms);
    
    // Sidebar navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            
            // Show selected section
            const section = btn.getAttribute('data-section');
            document.getElementById(section).classList.add('active');
        });
    });
    
    // Initialize
    updateFormVisibility();
    document.getElementById('processId').value = generateProcessId();
    renderProcessTable();
});
