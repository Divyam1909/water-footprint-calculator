/**
 * Water Footprint Calculator
 * Main JavaScript file handling form functionality, calculations, and API requests
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('water-calculator-form');
  const resultsSection = document.getElementById('results');
  const totalUsageEl = document.getElementById('total-usage');
  const monthlyUsageEl = document.getElementById('monthly-usage');
  const yearlyUsageEl = document.getElementById('yearly-usage');
  const comparisonPercentageEl = document.getElementById('comparison-percentage');
  const adviceContainer = document.getElementById('advice-container');
  const breakdownLegend = document.getElementById('breakdown-legend');
  const dietaryBreakdownSection = document.getElementById('dietary-breakdown-section');
  const dietaryBreakdownList = document.getElementById('dietary-breakdown-list');
  const recalculateBtn = document.getElementById('recalculate');
  const saveResultsBtn = document.getElementById('save-results');
  const shareResultsBtn = document.getElementById('share-results');
  
  // Navigation buttons
  const nextButtons = document.querySelectorAll('.btn-next');
  const prevButtons = document.querySelectorAll('.btn-prev');
  
  // Chart data
  let breakdownChart = null;
  let categoryBarChart = null;
  let dietaryBreakdownChart = null;
  
  // Show calculation method info modal
  const showCalculationInfo = () => {
    const modal = document.createElement('div');
    modal.className = 'calculation-modal';
    modal.innerHTML = `
      <div class="calculation-modal-content">
        <span class="close-modal">&times;</span>
        <h3>How We Calculate Water Usage</h3>
        <div class="calculation-info">
          <h4>Personal Hygiene</h4>
          <p>Shower: 10 liters per minute × duration</p>
          <p>Bath: 80 liters per bath ÷ 7 days (for weekly rate)</p>
          <p>Toilet: 6 liters per flush × flushes per day</p>
          <p>Teeth brushing: 5 liters × 2 times daily</p>
          <p>Hand washing: 3 liters × 6 times daily</p>
          
          <h4>Household</h4>
          <p>Dishwasher: 15 liters per load ÷ 7 days (for weekly rate)</p>
          <p>Hand washing dishes: 20 liters per wash × frequency</p>
          <p>Laundry: 50 liters per load ÷ 7 days (for weekly rate)</p>
          
          <h4>Diet</h4>
          <p>Base diet water usage per day:</p>
          <ul>
            <li>Meat-heavy: 5,000 liters</li>
            <li>Balanced: 3,500 liters</li>
            <li>Vegetarian: 2,500 liters</li>
            <li>Vegan: 1,700 liters</li>
          </ul>
          <p>Plus specific food items:</p>
          <ul>
            <li>Rice: 3,400 liters per kg ÷ 7 days</li>
            <li>Wheat: 1,300 liters per kg ÷ 7 days</li>
            <li>Milk: 1,000 liters per liter consumed</li>
            <li>Meat: 6,000 liters per kg ÷ 7 days</li>
          </ul>
          
          <h4>Outdoor</h4>
          <p>Garden watering: 12 liters per minute × duration × frequency ÷ 7 days</p>
          <p>Car washing: 150 liters per wash ÷ 30 days (for monthly rate)</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close modal when clicking X or outside the modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  };
  
  // Add calculation info button to results
  const addCalculationInfoButton = () => {
    const infoButton = document.createElement('button');
    infoButton.className = 'btn btn-info calculation-info-btn';
    infoButton.textContent = 'How is this calculated?';
    infoButton.addEventListener('click', showCalculationInfo);
    
    const resultsHeader = document.querySelector('.results-header');
    resultsHeader.appendChild(infoButton);
  };
  
  // Navigation buttons
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      const currentStep = parseInt(button.closest('.form-step').dataset.step);
      const nextStep = parseInt(button.dataset.next);
      
      // Hide current step
      document.querySelector(`.form-step[data-step="${currentStep}"]`).style.display = 'none';
      
      // Show next step
      document.querySelector(`.form-step[data-step="${nextStep}"]`).style.display = 'block';
      
      // Smooth scroll to the top of the form
      form.scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      const currentStep = parseInt(button.closest('.form-step').dataset.step);
      const prevStep = parseInt(button.dataset.prev);
      
      // Hide current step
      document.querySelector(`.form-step[data-step="${currentStep}"]`).style.display = 'none';
      
      // Show previous step
      document.querySelector(`.form-step[data-step="${prevStep}"]`).style.display = 'block';
      
      // Smooth scroll to the top of the form
      form.scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const userData = Object.fromEntries(formData.entries());
    
    // Convert string values to numbers
    for (const key in userData) {
      if (userData[key] !== '' && !isNaN(userData[key])) {
        userData[key] = parseFloat(userData[key]);
      }
    }
    
    try {
      // Show loading state
      form.style.display = 'none';
      resultsSection.style.display = 'block';
      totalUsageEl.textContent = 'Calculating...';
      
      // Call API to calculate water footprint
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to calculate water footprint');
      }
      
      // Display results
      displayResults(result.data, userData);
      
      // Get AI advice
      getAIAdvice(result.data, userData);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
      
      // Reset form visibility
      form.style.display = 'block';
      resultsSection.style.display = 'none';
    }
  });
  
  // Display water usage results
  function displayResults(waterUsage, userData) {
    // Update total usage and comparison stats
    totalUsageEl.textContent = waterUsage.total;
    monthlyUsageEl.textContent = waterUsage.monthly.toLocaleString();
    yearlyUsageEl.textContent = waterUsage.yearly.toLocaleString();
    comparisonPercentageEl.textContent = waterUsage.comparisonToAverage;
    
    // Add calculation info button
    addCalculationInfoButton();
    
    // Create doughnut chart for category percentages
    createDoughnutChart(waterUsage);
    
    // Create bar chart for category breakdown
    createBarChart(waterUsage);
    
    // Create dietary breakdown chart if data exists
    if (waterUsage.dietaryBreakdown) {
      createDietaryChart(waterUsage.dietaryBreakdown);
      dietaryBreakdownSection.style.display = 'block';
    } else {
      dietaryBreakdownSection.style.display = 'none';
    }
  }
  
  // Create doughnut chart for usage breakdown
  function createDoughnutChart(waterUsage) {
    // Prepare data for chart
    const chartData = {
      labels: ['Personal Hygiene', 'Household', 'Diet', 'Outdoor'],
      datasets: [{
        data: [
          waterUsage.breakdown.hygiene,
          waterUsage.breakdown.household,
          waterUsage.breakdown.dietary,
          waterUsage.breakdown.outdoor
        ],
        backgroundColor: [
          '#3498db', // blue
          '#2ecc71', // green
          '#f39c12', // orange
          '#9b59b6'  // purple
        ],
        borderWidth: 0,
        hoverOffset: 10
      }]
    };
    
    // Create doughnut chart
    const ctx = document.getElementById('breakdownChart').getContext('2d');
    
    if (breakdownChart) {
      breakdownChart.destroy();
    }
    
    breakdownChart = new Chart(ctx, {
      type: 'doughnut',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const percentage = Math.round((value / waterUsage.total) * 100);
                return `${label}: ${value} liters (${percentage}%)`;
              }
            }
          },
          title: {
            display: true,
            text: 'Water Usage by Category',
            font: {
              size: 16
            }
          }
        },
        cutout: '60%',
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
    
    // Create legend
    breakdownLegend.innerHTML = '';
    chartData.labels.forEach((label, index) => {
      const percentage = Math.round((chartData.datasets[0].data[index] / waterUsage.total) * 100);
      const value = chartData.datasets[0].data[index];
      const color = chartData.datasets[0].backgroundColor[index];
      
      const legendItem = document.createElement('div');
      legendItem.className = 'legend-item';
      legendItem.innerHTML = `
        <div class="legend-color" style="background-color: ${color}"></div>
        <div>${label}: ${value} liters (${percentage}%)</div>
      `;
      
      breakdownLegend.appendChild(legendItem);
    });
  }
  
  // Create bar chart for category breakdown
  function createBarChart(waterUsage) {
    const ctx = document.getElementById('categoryBarChart').getContext('2d');
    
    if (categoryBarChart) {
      categoryBarChart.destroy();
    }
    
    const categories = ['Personal Hygiene', 'Household', 'Diet', 'Outdoor'];
    const values = [
      waterUsage.breakdown.hygiene,
      waterUsage.breakdown.household,
      waterUsage.breakdown.dietary,
      waterUsage.breakdown.outdoor
    ];
    
    categoryBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [{
          label: 'Liters per day',
          data: values,
          backgroundColor: [
            '#3498db', // blue
            '#2ecc71', // green
            '#f39c12', // orange
            '#9b59b6'  // purple
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Daily Water Usage by Category (Liters)',
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + ' L';
              }
            }
          }
        }
      }
    });
  }
  
  // Create dietary breakdown chart
  function createDietaryChart(dietaryBreakdown) {
    const ctx = document.getElementById('dietaryBreakdownChart').getContext('2d');
    
    if (dietaryBreakdownChart) {
      dietaryBreakdownChart.destroy();
    }
    
    // Filter out zero values
    const foodItems = [];
    const waterValues = [];
    const colors = [];
    
    if (dietaryBreakdown.rice > 0) {
      foodItems.push('Rice');
      waterValues.push(dietaryBreakdown.rice);
      colors.push('#f1c40f');
    }
    
    if (dietaryBreakdown.wheat > 0) {
      foodItems.push('Wheat');
      waterValues.push(dietaryBreakdown.wheat);
      colors.push('#e67e22');
    }
    
    if (dietaryBreakdown.milk > 0) {
      foodItems.push('Milk');
      waterValues.push(dietaryBreakdown.milk);
      colors.push('#ecf0f1');
    }
    
    if (dietaryBreakdown.meat > 0) {
      foodItems.push('Meat');
      waterValues.push(dietaryBreakdown.meat);
      colors.push('#e74c3c');
    }
    
    dietaryBreakdownChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: foodItems,
        datasets: [{
          label: 'Water Footprint (Liters/day)',
          data: waterValues,
          backgroundColor: colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Water Footprint of Your Food Choices',
            font: {
              size: 16
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + ' L';
              }
            }
          }
        }
      }
    });
    
    // Create dietary breakdown list
    dietaryBreakdownList.innerHTML = '';
    
    if (foodItems.length === 0) {
      dietaryBreakdownList.innerHTML = '<li>No specific food data provided</li>';
      return;
    }
    
    foodItems.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = `${item}: ${waterValues[index]} liters per day`;
      dietaryBreakdownList.appendChild(li);
    });
  }
  
  // Get AI advice
  async function getAIAdvice(waterUsage, userData) {
    try {
      // Show loading state
      adviceContainer.innerHTML = `
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Generating personalized advice with AI...</p>
        </div>
      `;
      
      // Call API to get advice
      const response = await fetch('/api/advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ waterUsage, userData })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate advice');
      }
      
      // Display advice
      let formattedAdvice = result.advice
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      adviceContainer.innerHTML = `<div class="advice-content"><p>${formattedAdvice}</p></div>`;
      
    } catch (error) {
      console.error('Error getting advice:', error);
      adviceContainer.innerHTML = `
        <div class="error-message">
          <p>Sorry, we couldn't generate personalized advice at this time.</p>
          <p>Please try again later or check out our general water saving tips.</p>
        </div>
      `;
    }
  }
  
  // Recalculate button
  recalculateBtn.addEventListener('click', () => {
    // Show form, hide results
    form.style.display = 'block';
    resultsSection.style.display = 'none';
    
    // Reset to first step
    document.querySelectorAll('.form-step').forEach(step => {
      step.style.display = 'none';
    });
    document.querySelector('.form-step[data-step="1"]').style.display = 'block';
    
    // Smooth scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
  });
  
  // Save results as PDF/image
  saveResultsBtn.addEventListener('click', () => {
    alert('This feature will be implemented in a future update!');
    // Future implementation: Generate PDF or image of results
  });
  
  // Share results
  shareResultsBtn.addEventListener('click', () => {
    const dietText = (() => {
      switch(document.getElementById('diet').value) {
        case 'meat-heavy': return 'meat-heavy diet';
        case 'balanced': return 'balanced diet';
        case 'vegetarian': return 'vegetarian diet';
        case 'vegan': return 'vegan diet';
        default: return 'diet';
      }
    })();
    
    const shareText = `My daily water footprint is ${totalUsageEl.textContent} liters with a ${dietText}. That's ${comparisonPercentageEl.textContent}% of the average daily water usage (4000 liters)! Check yours at Water Footprint Calculator!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Water Footprint Results',
        text: shareText,
        url: window.location.href
      })
      .catch(error => console.error('Error sharing:', error));
    } else {
      try {
        navigator.clipboard.writeText(shareText + ' ' + window.location.href);
        alert('Results copied to clipboard! You can now paste and share them.');
      } catch (err) {
        alert('Sharing is not supported in your browser. Try copying the link manually.');
      }
    }
  });
}); 