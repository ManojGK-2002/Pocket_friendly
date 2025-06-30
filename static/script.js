document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('header') && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
        }
    });

    // Category filter buttons
    document.querySelectorAll('.filter-buttons .btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const parent = this.closest('.filter-buttons');
            parent.querySelectorAll('.btn').forEach(btn => {
                btn.classList.remove('active');
            });

            this.classList.add('active');

            const filterValue = this.getAttribute('href').substring(1);
            console.log('Filtering by:', filterValue);
        });
    });

    // Form submission feedback
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            }
        });
    });
});
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle and other existing code...

    // Chart initialization
    const ctx = document.getElementById('expenseChart').getContext('2d');
    let expenseChart;

    // Function to fetch expense data
    async function fetchExpenseData(category = 'all', period = 'all') {
        const response = await fetch(`/api/expenses?category=${category}&period=${period}`);
        return await response.json();
    }

    // Function to initialize or update chart
    async function updateChart(category = 'all', period = 'all') {
        const data = await fetchExpenseData(category, period);

        if (expenseChart) {
            expenseChart.destroy();
        }

        expenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        '#4CAF50',
                        '#2196F3',
                        '#FFC107',
                        '#FF5722',
                        '#9C27B0',
                        '#607D8B'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: category === 'all' ? 'All Expenses' : `${category.charAt(0).toUpperCase() + category.slice(1)} Expenses`,
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    // Initialize chart with all data
    updateChart();

    // Category filter click handler
    document.querySelectorAll('.category-filter').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            // Update active button
            document.querySelectorAll('.category-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // Update chart
            const category = this.dataset.category;
            const period = document.querySelector('.time-filter.active').dataset.period;
            updateChart(category, period);
        });
    });

    // Time period filter click handler
    document.querySelectorAll('.time-filter').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            // Update active button
            document.querySelectorAll('.time-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // Update chart
            const period = this.dataset.period;
            const category = document.querySelector('.category-filter.active').dataset.category;
            updateChart(category, period);
        });
    });
});