// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Form elements
    const cgpaForm = document.getElementById('cgpa-form');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const addSubjectBtn = document.getElementById('add-subject-btn');
    const removeSubjectBtn = document.getElementById('remove-subject-btn');
    const subjectsContainer = document.getElementById('subjects-container');
    const errorMessage = document.getElementById('error-message');
    
    // Result elements
    const resultContainer = document.getElementById('result-container');
    const resultSPI = document.getElementById('result-spi');
    const resultCPI = document.getElementById('result-cpi');
    const resultPercentage = document.getElementById('result-percentage');
    
    // History and export elements
    const saveResultBtn = document.getElementById('save-result-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const historyContainer = document.getElementById('history-container');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const chartContainer = document.getElementById('chart-container');
    const performanceChart = document.getElementById('performance-chart');
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Initialize variables
    let subjectCount = 2; // Start with 2 subjects
    let chart = null;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Theme toggle functionality
    themeToggle.addEventListener('click', function() {
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        // Update chart if it exists
        if (chart) {
            updateChartTheme();
        }
    });
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current button and tab
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Add subject functionality
    addSubjectBtn.addEventListener('click', function() {
        if (subjectCount < 12) { // Maximum 12 subjects
            subjectCount++;
            const newSubjectRow = document.createElement('div');
            newSubjectRow.className = 'subject-row';
            newSubjectRow.innerHTML = `
                <div class="form-group">
                    <label for="subject${subjectCount}">Subject ${subjectCount}:</label>
                    <input type="text" id="subject${subjectCount}" class="subject-name" placeholder="Subject Name">
                </div>
                <div class="form-group">
                    <label for="grade${subjectCount}">Grade Points:</label>
                    <input type="number" id="grade${subjectCount}" class="grade-input" min="0" max="10" step="0.1" required>
                </div>
                <div class="form-group">
                    <label for="credit${subjectCount}">Credit Hours:</label>
                    <input type="number" id="credit${subjectCount}" class="credit-input" min="1" max="7" step="1" required>
                </div>
            `;
            subjectsContainer.appendChild(newSubjectRow);
        }
        
        // Disable add button if max reached
        if (subjectCount >= 12) {
            addSubjectBtn.disabled = true;
        }
        
        // Enable remove button
        removeSubjectBtn.disabled = false;
    });
    
    // Remove subject functionality
    removeSubjectBtn.addEventListener('click', function() {
        if (subjectCount > 2) { // Minimum 2 subjects
            const subjectRows = subjectsContainer.querySelectorAll('.subject-row');
            subjectsContainer.removeChild(subjectRows[subjectRows.length - 1]);
            subjectCount--;
        }
        
        // Enable add button
        addSubjectBtn.disabled = false;
        
        // Disable remove button if min reached
        if (subjectCount <= 2) {
            removeSubjectBtn.disabled = true;
        }
    });
    
    // Form submission
    cgpaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous error messages
        errorMessage.textContent = '';
        
        // Check which tab is active
        const activeTab = document.querySelector('.tab-content.active').id;
        
        if (activeTab === 'semester-tab') {
            // Semester calculation
            calculateSemesterResults();
        } else {
            // Direct CGPA conversion
            calculateDirectCGPA();
        }
    });
    
    // Calculate semester results
    function calculateSemesterResults() {
        // Get all grade and credit inputs
        const gradeInputs = document.querySelectorAll('.grade-input');
        const creditInputs = document.querySelectorAll('.credit-input');
        
        // Validate inputs
        let isValid = true;
        let totalCredits = 0;
        let totalGradePoints = 0;
        
        for (let i = 0; i < gradeInputs.length; i++) {
            const grade = parseFloat(gradeInputs[i].value);
            const credit = parseInt(creditInputs[i].value);
            
            if (isNaN(grade) || isNaN(credit)) {
                errorMessage.textContent = 'Please fill in all grade points and credit hours.';
                isValid = false;
                break;
            }
            
            if (grade < 0 || grade > 10) {
                errorMessage.textContent = 'Grade points must be between 0 and 10.';
                isValid = false;
                break;
            }
            
            if (credit < 1 || credit > 7) {
                errorMessage.textContent = 'Credit hours must be between 1 and 7.';
                isValid = false;
                break;
            }
            
            totalGradePoints += grade * credit;
            totalCredits += credit;
        }
        
        if (!isValid) {
            return;
        }
        
        // Calculate SPI
        const spi = totalGradePoints / totalCredits;
        
        // Get previous CPI and credits if available
        const previousCPI = parseFloat(document.getElementById('previous-cpi').value) || 0;
        const previousCredits = parseInt(document.getElementById('previous-credits').value) || 0;
        const semesterNumber = parseInt(document.getElementById('semester-number').value) || 1;
        
        // Calculate CPI
        let cpi;
        if (previousCPI === 0 || previousCredits === 0) {
            // First semester or no previous data
            cpi = spi;
        } else {
            // Calculate with previous data
            cpi = (previousCPI * previousCredits + totalGradePoints) / (previousCredits + totalCredits);
        }
        
        // Calculate percentage using formula: (CPI - 0.5) * 10
        const percentage = (cpi - 0.5) * 10;
        
        // Display results
        resultSPI.textContent = spi.toFixed(2);
        resultCPI.textContent = cpi.toFixed(2);
        resultPercentage.textContent = percentage.toFixed(2) + '%';
        resultContainer.classList.remove('hidden');
        
        // Save current calculation data for potential saving
        currentCalculation = {
            type: 'semester',
            semester: semesterNumber,
            spi: spi.toFixed(2),
            cpi: cpi.toFixed(2),
            percentage: percentage.toFixed(2),
            date: new Date().toISOString()
        };
        
        // Show history container if there are saved calculations
        updateHistoryDisplay();
    }
    
    // Calculate direct CGPA conversion
    function calculateDirectCGPA() {
        const cgpaInput = document.getElementById('direct-cgpa');
        const cgpa = parseFloat(cgpaInput.value);
        
        // Validate input
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
            errorMessage.textContent = 'Please enter a valid CGPA between 0 and 10.';
            return;
        }
        
        // Get selected formula
        const formula = document.querySelector('input[name="conversion-method"]:checked').value;
        
        // Calculate percentage based on selected formula
        let percentage;
        if (formula === 'formula1') {
            percentage = (cgpa - 0.5) * 10;
        } else {
            percentage = cgpa * 9.5;
        }
        
        // Display results
        resultSPI.textContent = 'N/A';
        resultCPI.textContent = cgpa.toFixed(2);
        resultPercentage.textContent = percentage.toFixed(2) + '%';
        resultContainer.classList.remove('hidden');
        
        // Save current calculation data for potential saving
        currentCalculation = {
            type: 'direct',
            cgpa: cgpa.toFixed(2),
            percentage: percentage.toFixed(2),
            formula: formula === 'formula1' ? '(CGPA - 0.5) × 10' : 'CGPA × 9.5',
            date: new Date().toISOString()
        };
        
        // Show history container if there are saved calculations
        updateHistoryDisplay();
    }
    
    // Variable to store current calculation
    let currentCalculation = null;
    
    // Save result to local storage
    saveResultBtn.addEventListener('click', function() {
        if (!currentCalculation) return;
        
        // Get existing history or initialize empty array
        const history = JSON.parse(localStorage.getItem('cgpaHistory')) || [];
        
        // Add current calculation to history
        history.push(currentCalculation);
        
        // Save to local storage
        localStorage.setItem('cgpaHistory', JSON.stringify(history));
        
        // Update history display
        updateHistoryDisplay();
        
        // Show success message
        alert('Calculation saved to history!');
    });
    
    // Update history display
    function updateHistoryDisplay() {
        const history = JSON.parse(localStorage.getItem('cgpaHistory')) || [];
        
        if (history.length > 0) {
            // Clear existing history items
            historyList.innerHTML = '';
            
            // Add history items
            history.forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const date = new Date(item.date);
                const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                
                if (item.type === 'semester') {
                    historyItem.innerHTML = `
                        <h4>Semester ${item.semester} <span class="history-item-date">${formattedDate}</span></h4>
                        <div class="history-details">
                            <p>SPI: ${item.spi}</p>
                            <p>CPI: ${item.cpi}</p>
                            <p>Percentage: ${item.percentage}%</p>
                        </div>
                    `;
                } else {
                    historyItem.innerHTML = `
                        <h4>Direct Conversion <span class="history-item-date">${formattedDate}</span></h4>
                        <div class="history-details">
                            <p>CGPA: ${item.cgpa}</p>
                            <p>Percentage: ${item.percentage}%</p>
                            <p>Formula: ${item.formula}</p>
                        </div>
                    `;
                }
                
                historyList.appendChild(historyItem);
            });
            
            // Show history container
            historyContainer.classList.remove('hidden');
            
            // Update chart
            updatePerformanceChart(history);
        }
    }
    
    // Clear history
    clearHistoryBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all calculation history?')) {
            localStorage.removeItem('cgpaHistory');
            historyList.innerHTML = '';
            historyContainer.classList.add('hidden');
            chartContainer.classList.add('hidden');
            if (chart) {
                chart.destroy();
                chart = null;
            }
        }
    });
    
    // Update performance chart
    function updatePerformanceChart(history) {
        // Filter only semester calculations
        const semesterData = history.filter(item => item.type === 'semester')
            .sort((a, b) => a.semester - b.semester);
        
        if (semesterData.length > 0) {
            // Prepare data for chart
            const labels = semesterData.map(item => `Sem ${item.semester}`);
            const spiData = semesterData.map(item => parseFloat(item.spi));
            const cpiData = semesterData.map(item => parseFloat(item.cpi));
            
            // Set chart colors based on current theme
            const isDarkMode = body.classList.contains('dark-mode');
            const textColor = isDarkMode ? '#f8f9fa' : '#212529';
            const gridColor = isDarkMode ? '#495057' : '#dee2e6';
            
            // Create or update chart
            if (chart) {
                chart.data.labels = labels;
                chart.data.datasets[0].data = spiData;
                chart.data.datasets[1].data = cpiData;
                chart.update();
            } else {
                const ctx = performanceChart.getContext('2d');
                chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'SPI',
                                data: spiData,
                                borderColor: '#4a6fa5',
                                backgroundColor: 'rgba(74, 111, 165, 0.1)',
                                tension: 0.1,
                                fill: true
                            },
                            {
                                label: 'CPI',
                                data: cpiData,
                                borderColor: '#28a745',
                                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                                tension: 0.1,
                                fill: true
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: Math.max(0, Math.min(...spiData, ...cpiData) - 1),
                                max: Math.min(10, Math.max(...spiData, ...cpiData) + 1),
                                grid: {
                                    color: gridColor
                                },
                                ticks: {
                                    color: textColor
                                }
                            },
                            x: {
                                grid: {
                                    color: gridColor
                                },
                                ticks: {
                                    color: textColor
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    color: textColor
                                }
                            }
                        }
                    }
                });
            }
            
            // Show chart container
            chartContainer.classList.remove('hidden');
        }
    }
    
    // Update chart theme
    function updateChartTheme() {
        if (!chart) return;
        
        const isDarkMode = body.classList.contains('dark-mode');
        const textColor = isDarkMode ? '#f8f9fa' : '#212529';
        const gridColor = isDarkMode ? '#495057' : '#dee2e6';
        
        chart.options.scales.y.grid.color = gridColor;
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.plugins.legend.labels.color = textColor;
        
        chart.update();
    }
    
    // Export as PDF
    exportPdfBtn.addEventListener('click', function() {
        if (!currentCalculation) return;
        
        alert('PDF export functionality would be implemented here. This would typically use a library like jsPDF to generate a PDF with the calculation results.');
        
        // Implementation would look something like:
        /*
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text('GTU CGPA Calculator Results', 20, 20);
        
        doc.setFontSize(12);
        if (currentCalculation.type === 'semester') {
            doc.text(`Semester: ${currentCalculation.semester}`, 20, 40);
            doc.text(`SPI: ${currentCalculation.spi}`, 20, 50);
            doc.text(`CPI: ${currentCalculation.cpi}`, 20, 60);
        } else {
            doc.text(`CGPA: ${currentCalculation.cgpa}`, 20, 40);
            doc.text(`Formula: ${currentCalculation.formula}`, 20, 50);
        }
        doc.text(`Percentage: ${currentCalculation.percentage}%`, 20, 70);
        
        doc.save('gtu-cgpa-calculation.pdf');
        */
    });
    
    // Export as CSV
    exportCsvBtn.addEventListener('click', function() {
        if (!currentCalculation) return;
        
        alert('CSV export functionality would be implemented here. This would generate a CSV file with the calculation results.');
        
        // Implementation would look something like:
        /*
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // Add headers
        if (currentCalculation.type === 'semester') {
            csvContent += 'Type,Semester,SPI,CPI,Percentage,Date\n';
            csvContent += `Semester,${currentCalculation.semester},${currentCalculation.spi},${currentCalculation.cpi},${currentCalculation.percentage}%,${new Date(currentCalculation.date).toLocaleString()}\n`;
        } else {
            csvContent += 'Type,CGPA,Percentage,Formula,Date\n';
            csvContent += `Direct,${currentCalculation.cgpa},${currentCalculation.percentage}%,${currentCalculation.formula},${new Date(currentCalculation.date).toLocaleString()}\n`;
        }
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'gtu-cgpa-calculation.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        */
    });
    
    // Initialize tooltips
    const tooltipIcons = document.querySelectorAll('.tooltip-icon');
    tooltipIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            const tooltip = this.parentElement.querySelector('.tooltip-text');
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
        });
        
        icon.addEventListener('mouseleave', function() {
            const tooltip = this.parentElement.querySelector('.tooltip-text');
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
        });
    });
    
    // Load and display history on page load
    updateHistoryDisplay();
});
