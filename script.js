// Service Worker for offline support (optional - requires HTTPS)
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('✅ Offline mode enabled'))
            .catch(() => console.log('ℹ️ Offline mode unavailable (use HTTP server)'));
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.floating-nav button, .discover-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    function switchTab(tabId) {
        // Update floating nav buttons
        document.querySelectorAll('.floating-nav button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            }
        });
        
        // Update tab contents
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
        
        // Initialize map when mapping tab is opened
        if (tabId === 'mapping' && window.map === undefined) {
            setTimeout(initializeMap, 100);
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Add click handlers to floating nav buttons
    document.querySelectorAll('.floating-nav button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            switchTab(this.getAttribute('data-tab'));
        });
    });
    
    // Discover button handler
    document.querySelector('.discover-btn').addEventListener('click', function(e) {
        e.preventDefault();
        switchTab(this.getAttribute('data-tab'));
    });
    
    // NEW: Real-time data refresh button
    const refreshBtn = document.getElementById('refresh-realtime-data');
    refreshBtn.addEventListener('click', function() {
        refreshBtn.classList.add('updating');
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        
        // Update all real-time data
        updateAirQualityData();
        updateFloodAlertData();
        updateWeatherData();
        
        setTimeout(() => {
            refreshBtn.classList.remove('updating');
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Real-time Data';
        }, 1500);
    });
    
    // NEW: Modal functionality
    const alertModal = document.getElementById('alert-modal');
    const modalClose = document.getElementById('modal-close');
    
    modalClose.addEventListener('click', function() {
        alertModal.style.display = 'none';
    });
    
    alertModal.addEventListener('click', function(e) {
        if (e.target === alertModal) {
            alertModal.style.display = 'none';
        }
    });
    
    // NEW: Preparedness data with more practical and useful tips
    const preparednessData = {
        'earthquake': {
            high: {
                title: 'Earthquake Alert - High Risk',
                icon: 'fas fa-bolt',
                alertTitle: 'Immediate Action Required',
                description: 'Your area is in a high-risk earthquake zone. Major seismic activity is possible.',
                riskLevel: 'HIGH RISK',
                riskColor: '#ef4444',
                preparedness: [
                    'Store emergency water (4 liters per person per day for 3 days)',
                    'Secure heavy furniture like cabinets, shelves, and water heaters to walls',
                    'Prepare "go-bag" with first aid, flashlight, batteries, whistle, and documents',
                    'Identify safe spots in every room (under sturdy tables, against interior walls)',
                    'Practice "Drop, Cover, and Hold On" drill with family monthly',
                    'Know how to shut off gas, water, and electricity mains'
                ],
                note: 'During shaking: Drop to hands and knees, Cover head under table, Hold on until shaking stops.'
            },
            medium: {
                title: 'Earthquake Alert - Medium Risk',
                icon: 'fas fa-bolt',
                alertTitle: 'Stay Prepared and Vigilant',
                description: 'Your area has moderate earthquake risk. Stay informed and prepared.',
                riskLevel: 'MEDIUM RISK',
                riskColor: '#f59e0b',
                preparedness: [
                    'Prepare 3-day emergency kit with water, food, medicine, and cash',
                    'Secure tall furniture that could topple during shaking',
                    'Have fire extinguishers and know how to use them',
                    'Create family emergency plan with meeting points',
                    'Keep shoes and flashlight beside bed for night emergencies',
                    'Participate in community earthquake drills'
                ],
                note: 'Check your home for hazards: loose shelves, hanging objects, poor building materials.'
            },
            low: {
                title: 'Earthquake Alert - Low Risk',
                icon: 'fas fa-bolt',
                alertTitle: 'Maintain Basic Preparedness',
                description: 'Your area has low earthquake risk. Maintain basic preparedness.',
                riskLevel: 'LOW RISK',
                riskColor: '#10b981',
                preparedness: [
                    'Keep basic emergency supplies: water, non-perishable food, first aid',
                    'Learn basic first aid and CPR techniques',
                    'Keep emergency contact numbers in phone and wallet',
                    'Review earthquake safety procedures every 6 months',
                    'Ensure your home insurance covers earthquake damage',
                    'Stay informed about seismic activity through official channels'
                ],
                note: 'While risk is low, earthquakes can occur anywhere without warning.'
            }
        },
        'flood': {
            high: {
                title: 'Flood Alert - High Risk',
                icon: 'fas fa-water',
                alertTitle: 'Immediate Evacuation May Be Required',
                description: 'Your area is at high risk of flooding. River levels are above danger threshold.',
                riskLevel: 'HIGH RISK',
                riskColor: '#ef4444',
                preparedness: [
                    'Move to higher ground immediately if advised by authorities',
                    'Prepare emergency bag with medicines, documents, phone charger, cash',
                    'Turn off electricity, gas, and water mains before evacuating',
                    'Move valuables and electronics to upper floors',
                    'Fill bathtubs and containers with clean drinking water',
                    'Never walk or drive through flood waters (15cm can sweep you away)'
                ],
                note: 'Stay tuned to local radio for evacuation orders. Do not return until authorities say it\'s safe.'
            },
            medium: {
                title: 'Flood Alert - Medium Risk',
                icon: 'fas fa-water',
                alertTitle: 'Prepare for Possible Flooding',
                description: 'Your area has moderate flood risk. Monitor weather conditions closely.',
                riskLevel: 'MEDIUM RISK',
                riskColor: '#f59e0b',
                preparedness: [
                    'Prepare sandbags for doorways and low openings',
                    'Clear gutters, drains, and drainage channels',
                    'Move important items to higher shelves or upper floors',
                    'Prepare emergency supplies for 3-5 days',
                    'Identify safe evacuation routes to higher ground',
                    'Charge phones and power banks, keep radio batteries ready'
                ],
                note: 'Monitor river levels during monsoon. Be ready to evacuate if water rises rapidly.'
            },
            low: {
                title: 'Flood Alert - Low Risk',
                icon: 'fas fa-water',
                alertTitle: 'Monitor Conditions During Monsoon',
                description: 'Your area has low flood risk. Stay informed about weather changes.',
                riskLevel: 'LOW RISK',
                riskColor: '#10b981',
                preparedness: [
                    'Keep drainage systems clear of debris',
                    'Have emergency contact numbers saved in phone',
                    'Monitor river levels and weather forecasts during monsoon',
                    'Prepare basic emergency kit with flashlight, radio, first aid',
                    'Know location of nearest evacuation shelters',
                    'Check weather forecasts 2-3 times daily during rainy season'
                ],
                note: 'Low risk areas can still experience flash floods during heavy rainfall.'
            }
        },
        'landslide': {
            high: {
                title: 'Landslide Alert - High Risk',
                icon: 'fas fa-layer-group',
                alertTitle: 'Extreme Danger - Avoid Hillsides',
                description: 'Your area is at extreme risk of landslides due to terrain and rainfall.',
                riskLevel: 'HIGH RISK',
                riskColor: '#ef4444',
                preparedness: [
                    'Evacuate immediately if in landslide-prone area during heavy rain',
                    'Avoid all hillside roads, paths, and unstable slopes',
                    'Listen for unusual sounds (trees cracking, boulders knocking)',
                    'Watch for signs: new cracks in ground, tilting trees, bulging ground',
                    'Move to stable ground away from base of slopes',
                    'Do not return until authorities declare area safe'
                ],
                note: 'Landslides can occur suddenly with little warning. Move diagonally across slope if caught in one.'
            },
            medium: {
                title: 'Landslide Alert - Medium Risk',
                icon: 'fas fa-layer-group',
                alertTitle: 'Exercise Caution on Slopes',
                description: 'Your area has moderate landslide risk. Avoid unstable slopes.',
                riskLevel: 'MEDIUM RISK',
                riskColor: '#f59e0b',
                preparedness: [
                    'Avoid hillside areas during and after heavy rainfall',
                    'Watch for signs of soil movement or small slides',
                    'Stay informed about rainfall forecasts and warnings',
                    'Identify safe evacuation routes away from slopes',
                    'Keep emergency supplies ready for quick evacuation',
                    'Report any slope cracks or erosion to local authorities'
                ],
                note: 'Be particularly cautious after prolonged rainfall when soil is saturated.'
            },
            low: {
                title: 'Landslide Alert - Low Risk',
                icon: 'fas fa-layer-group',
                alertTitle: 'Stay Vigilant in Hilly Areas',
                description: 'Your area has low landslide risk. Basic precautions recommended.',
                riskLevel: 'LOW RISK',
                riskColor: '#10b981',
                preparedness: [
                    'Avoid steep slopes and cuttings during heavy rain',
                    'Monitor weather conditions during monsoon season',
                    'Know signs of potential landslides: tilted poles, cracks',
                    'Have emergency contact numbers for local disaster management',
                    'Stay on established trails in hilly areas',
                    'Report any slope instability or erosion to authorities'
                ],
                note: 'Even low-risk areas can experience landslides during extreme weather.'
            }
        }
    };
    
    // Function to show alert details modal
    function showAlertDetails(alertData) {
        document.getElementById('modal-title').textContent = alertData.title;
        document.getElementById('modal-icon').className = alertData.icon;
        document.getElementById('modal-alert-title').textContent = alertData.alertTitle;
        document.getElementById('modal-description').textContent = alertData.description;
        document.getElementById('modal-note').textContent = alertData.note;
        
        // Set risk level badge
        const riskLevelElement = document.getElementById('modal-risk-level');
        riskLevelElement.textContent = alertData.riskLevel;
        riskLevelElement.style.background = alertData.riskColor;
        riskLevelElement.style.color = 'white';
        
        // Clear and add preparedness items
        const preparednessList = document.getElementById('preparedness-list');
        preparednessList.innerHTML = '';
        
        alertData.preparedness.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-check-circle"></i> ${item}`;
            preparednessList.appendChild(li);
        });
        
        alertModal.style.display = 'flex';
    }
    
    // Current district tracking
    let currentDistrict = 'Kathmandu';
    
    // District risk database
    const districtRiskData = {
        'kathmandu': { earthquake: 'high', flood: 'low', landslide: 'medium' },
        'pokhara': { earthquake: 'medium', flood: 'low', landslide: 'high' },
        'biratnagar': { earthquake: 'low', flood: 'high', landslide: 'low' },
        'nepalgunj': { earthquake: 'low', flood: 'high', landslide: 'low' },
        'jhapa': { earthquake: 'medium', flood: 'high', landslide: 'low' },
        'kaski': { earthquake: 'medium', flood: 'low', landslide: 'high' },
        'saptari': { earthquake: 'low', flood: 'high', landslide: 'low' },
        'sindhupalchok': { earthquake: 'high', flood: 'medium', landslide: 'high' },
        'gorkha': { earthquake: 'high', flood: 'medium', landslide: 'high' },
        'chitwan': { earthquake: 'medium', flood: 'medium', landslide: 'medium' },
        'default': { earthquake: 'medium', flood: 'medium', landslide: 'medium' }
    };
    
    // District air quality data
    const airQualityData = {
        'kathmandu': { aqi: 85, pm25: 42, level: 'Moderate' },
        'pokhara': { aqi: 45, pm25: 22, level: 'Good' },
        'biratnagar': { aqi: 132, pm25: 68, level: 'Unhealthy' },
        'nepalgunj': { aqi: 98, pm25: 48, level: 'Moderate' },
        'jhapa': { aqi: 65, pm25: 35, level: 'Moderate' },
        'kaski': { aqi: 40, pm25: 20, level: 'Good' },
        'saptari': { aqi: 110, pm25: 55, level: 'Unhealthy' },
        'sindhupalchok': { aqi: 70, pm25: 38, level: 'Moderate' },
        'default': { aqi: 75, pm25: 35, level: 'Moderate' }
    };
    
    // District flood data
    const floodData = {
        'kathmandu': { level: 3.2, danger: 4.5, status: 'Normal', river: 'Bagmati' },
        'pokhara': { level: 1.8, danger: 3.0, status: 'Normal', river: 'Seti' },
        'biratnagar': { level: 5.8, danger: 6.5, status: 'Warning', river: 'Koshi' },
        'nepalgunj': { level: 4.2, danger: 5.0, status: 'Normal', river: 'Karnali' },
        'jhapa': { level: 6.1, danger: 7.0, status: 'Warning', river: 'Mechi' },
        'kaski': { level: 2.5, danger: 4.0, status: 'Normal', river: 'Seti' },
        'saptari': { level: 7.2, danger: 8.0, status: 'Alert', river: 'Koshi' },
        'sindhupalchok': { level: 3.8, danger: 6.0, status: 'Normal', river: 'Indrawati' },
        'default': { level: 3.0, danger: 5.0, status: 'Normal', river: 'Local River' }
    };
    
    // District weather data
    const weatherData = {
        'kathmandu': { temp: 22, condition: 'Partly Cloudy', humidity: 65, wind: 8, feelsLike: 23, icon: 'fa-cloud-sun' },
        'pokhara': { temp: 20, condition: 'Light Rain', humidity: 75, wind: 5, feelsLike: 21, icon: 'fa-cloud-rain' },
        'biratnagar': { temp: 32, condition: 'Hot and Humid', humidity: 70, wind: 12, feelsLike: 35, icon: 'fa-sun' },
        'nepalgunj': { temp: 30, condition: 'Clear', humidity: 60, wind: 10, feelsLike: 32, icon: 'fa-sun' },
        'jhapa': { temp: 28, condition: 'Partly Cloudy', humidity: 68, wind: 6, feelsLike: 30, icon: 'fa-cloud-sun' },
        'kaski': { temp: 20, condition: 'Light Rain', humidity: 80, wind: 4, feelsLike: 21, icon: 'fa-cloud-rain' },
        'saptari': { temp: 32, condition: 'Hot', humidity: 65, wind: 15, feelsLike: 36, icon: 'fa-sun' },
        'sindhupalchok': { temp: 18, condition: 'Cool', humidity: 70, wind: 7, feelsLike: 19, icon: 'fa-cloud' },
        'gorkha': { temp: 21, condition: 'Partly Cloudy', humidity: 72, wind: 6, feelsLike: 22, icon: 'fa-cloud-sun' },
        'chitwan': { temp: 26, condition: 'Clear', humidity: 65, wind: 8, feelsLike: 28, icon: 'fa-sun' },
        'default': { temp: 25, condition: 'Partly Cloudy', humidity: 65, wind: 8, feelsLike: 26, icon: 'fa-cloud-sun' }
    };
    
    // Real-time data functions
    function updateAirQualityData() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let districtKey = currentDistrict.toLowerCase();
        const data = airQualityData[districtKey] || airQualityData['default'];
        
        document.getElementById('air-quality-value').textContent = data.aqi;
        document.getElementById('air-quality-desc').textContent = data.level;
        document.getElementById('air-quality-pm25').textContent = `${data.pm25} μg/m³`;
        document.getElementById('air-quality-location').textContent = currentDistrict;
        document.getElementById('air-quality-time').textContent = timeString;
        
        const aqiPosition = Math.min((data.aqi / 500) * 100, 100);
        document.getElementById('aqi-marker').style.left = `${aqiPosition}%`;
        
        let statusColor = '';
        if (data.aqi <= 50) statusColor = 'var(--aqi-good)';
        else if (data.aqi <= 100) statusColor = 'var(--aqi-moderate)';
        else if (data.aqi <= 150) statusColor = 'var(--aqi-sensitive)';
        else if (data.aqi <= 200) statusColor = 'var(--aqi-unhealthy)';
        else if (data.aqi <= 300) statusColor = 'var(--aqi-very-unhealthy)';
        else statusColor = 'var(--aqi-hazardous)';
        
        document.getElementById('aqi-marker').style.borderColor = statusColor;
    }
    
    function updateFloodAlertData() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let districtKey = currentDistrict.toLowerCase();
        const data = floodData[districtKey] || floodData['default'];
        
        const percentage = (data.level / data.danger) * 100;
        
        document.getElementById('flood-level-value').textContent = data.level.toFixed(1);
        document.getElementById('flood-alert-desc').textContent = data.status;
        document.getElementById('flood-river').textContent = data.river;
        document.getElementById('flood-danger-level').textContent = `${data.danger} m`;
        document.getElementById('flood-alert-time').textContent = timeString;
        
        const markerPosition = Math.min(percentage, 100);
        document.getElementById('flood-marker').style.left = `${markerPosition}%`;
        
        let statusColor = '';
        if (percentage < 50) statusColor = 'var(--accent-green)';
        else if (percentage < 75) statusColor = 'var(--accent-blue)';
        else if (percentage < 100) statusColor = 'var(--accent-orange)';
        else statusColor = 'var(--accent-red)';
        
        document.getElementById('flood-marker').style.borderColor = statusColor;
    }
    
    function updateWeatherData() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let districtKey = currentDistrict.toLowerCase();
        const data = weatherData[districtKey] || weatherData['default'];
        
        document.getElementById('weather-location-name').textContent = currentDistrict;
        document.getElementById('weather-update-time').textContent = `Updated: ${timeString}`;
        document.getElementById('weather-temp').textContent = `${data.temp}°C`;
        document.getElementById('weather-condition').textContent = data.condition;
        document.getElementById('weather-humidity').textContent = `${data.humidity}%`;
        document.getElementById('weather-wind').textContent = `${data.wind} km/h`;
        document.getElementById('weather-feels-like').textContent = `${data.feelsLike}°C`;
        document.getElementById('weather-icon').className = `fas ${data.icon}`;
    }
    
    // Update weather for specific location (for map clicks)
    function updateWeatherForLocation(locationName) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let districtKey = locationName.toLowerCase();
        const data = weatherData[districtKey] || weatherData['default'];
        
        document.getElementById('weather-location-name').textContent = locationName;
        document.getElementById('weather-update-time').textContent = `Updated: ${timeString}`;
        document.getElementById('weather-temp').textContent = `${data.temp}°C`;
        document.getElementById('weather-condition').textContent = data.condition;
        document.getElementById('weather-humidity').textContent = `${data.humidity}%`;
        document.getElementById('weather-wind').textContent = `${data.wind} km/h`;
        document.getElementById('weather-feels-like').textContent = `${data.feelsLike}°C`;
        document.getElementById('weather-icon').className = `fas ${data.icon}`;
    }
    
    // Generate alert cards based on current district
    function generateAlertCards() {
        const container = document.getElementById('alert-cards-container');
        container.innerHTML = '';
        
        const alertTypes = ['earthquake', 'flood', 'landslide'];
        const districtKey = currentDistrict.toLowerCase();
        const risks = districtRiskData[districtKey] || districtRiskData['default'];
        
        alertTypes.forEach(type => {
            const riskLevel = risks[type] || 'medium';
            const riskClass = `${riskLevel}-risk`;
            const alertData = preparednessData[type][riskLevel];
            const icons = {
                'earthquake': 'fas fa-bolt',
                'flood': 'fas fa-water',
                'landslide': 'fas fa-layer-group'
            };
            
            const card = document.createElement('div');
            card.className = `alert-card ${riskClass}`;
            card.dataset.type = type;
            card.dataset.risk = riskLevel;
            
            card.innerHTML = `
                <div class="alert-header">
                    <div class="alert-icon">
                        <i class="${icons[type]}"></i>
                    </div>
                    <span class="alert-badge">${riskLevel.toUpperCase()} RISK</span>
                </div>
                <h3 class="alert-title">${type.charAt(0).toUpperCase() + type.slice(1)} Alert</h3>
                <p class="alert-description">${alertData.alertTitle}</p>
                <div class="alert-actions">
                    <span class="alert-click-hint">
                        <i class="fas fa-hand-pointer"></i>
                        Click for preparedness details
                    </span>
                    <span style="font-size: 12px; color: var(--text-secondary);">
                        <i class="far fa-clock"></i> Updated: ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                </div>
            `;
            
            card.addEventListener('click', function() {
                showAlertDetails(alertData);
            });
            
            container.appendChild(card);
        });
    }
    
    // District selection
    const districtSelect = document.getElementById('district-select');
    const getLocationBtn = document.getElementById('get-location-btn');
    const locationStatus = document.getElementById('location-status');
    const getMyLocationBtn = document.getElementById('get-my-location-btn');
    const showOtherBtn = document.getElementById('show-other-btn');
    
    // All 77 districts of Nepal
    const allDistricts = {
        "Province 1": ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"],
        "Province 2": ["Saptari", "Siraha", "Dhanusha", "Mahottari", "Sarlahi", "Rautahat", "Bara", "Parsa"],
        "Bagmati": ["Dolakha", "Ramechhap", "Sindhuli", "Kathmandu", "Bhaktapur", "Lalitpur", "Kavrepalanchok", "Nuwakot", "Rasuwa", "Dhading", "Makwanpur", "Chitwan"],
        "Gandaki": ["Gorkha", "Lamjung", "Tanahun", "Syangja", "Kaski", "Manang", "Mustang", "Myagdi", "Parbat", "Baglung", "Nawalpur"],
        "Lumbini": ["Rupandehi", "Kapilvastu", "Arghakhanchi", "Gulmi", "Palpa", "Nawalparasi West", "Nawalparasi East", "Dang", "Pyuthan", "Rolpa", "Eastern Rukum", "Banke", "Bardiya"],
        "Karnali": ["Western Rukum", "Salyan", "Dolpa", "Mugu", "Humla", "Jumla", "Kalikot", "Dailekh", "Jajarkot", "Surkhet"],
        "Sudurpashchim": ["Kailali", "Kanchanpur", "Dadeldhura", "Baitadi", "Darchula", "Bajhang", "Bajura", "Doti", "Achham"]
    };
    
    // Populate district select
    function populateAllDistricts() {
        districtSelect.innerHTML = '<option value="">-- Select Your District --</option>';
        
        for (const province in allDistricts) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = province;
            
            allDistricts[province].forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                if (district === 'Kathmandu') option.selected = true;
                optgroup.appendChild(option);
            });
            
            districtSelect.appendChild(optgroup);
        }
    }
    
    // Initialize with all districts
    populateAllDistricts();
    
    // Update alerts function
    function updateAlerts(districtName) {
        currentDistrict = districtName;
        
        // Update location status
        locationStatus.innerHTML = `<i class="fas fa-map-marker-alt" style="color: var(--accent-green);"></i> Alerts for: ${districtName} District`;
        
        // Update all data
        updateAirQualityData();
        updateFloodAlertData();
        updateWeatherData();
        generateAlertCards();
        
        // Show success message
        const originalText = getLocationBtn.innerHTML;
        getLocationBtn.innerHTML = '<i class="fas fa-check"></i> Alerts Updated!';
        getLocationBtn.style.background = 'var(--accent-green)';
        
        setTimeout(() => {
            getLocationBtn.innerHTML = '<i class="fas fa-bell"></i> Get Alerts';
            getLocationBtn.style.background = '';
        }, 2000);
    }
    
    // Get alerts button handler
    getLocationBtn.addEventListener('click', function() {
        const selectedDistrict = districtSelect.value;
        
        if (!selectedDistrict) {
            locationStatus.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: var(--accent-orange);"></i> Please select a district first';
            return;
        }
        
        updateAlerts(selectedDistrict);
    });
    
    // Get user's location
    getMyLocationBtn.addEventListener('click', function() {
        const originalText = getMyLocationBtn.innerHTML;
        getMyLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
        
        setTimeout(() => {
            // Simulate location detection
            districtSelect.value = 'Kathmandu';
            updateAlerts('Kathmandu');
            
            getMyLocationBtn.innerHTML = originalText;
            
            // Show message
            const modal = document.createElement('div');
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 1000; display: flex; justify-content: center; align-items: center;';
            modal.innerHTML = `
                <div style="background: var(--card-bg); border-radius: 20px; padding: 30px; max-width: 400px; width: 90%; border: 1px solid var(--border-color); text-align: center;">
                    <h3 style="color: var(--accent-brown); margin-bottom: 15px;"><i class="fas fa-check-circle" style="color: var(--accent-green);"></i> Location Detected</h3>
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">Your location has been detected as <strong>Kathmandu</strong>. Alerts have been updated.</p>
                    <button id="close-modal" style="background: var(--accent-brown); color: white; border: none; border-radius: 10px; padding: 12px 24px; font-weight: 600; cursor: pointer;">
                        OK
                    </button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('#close-modal').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        }, 1500);
    });
    
    // Initialize with default data
    updateAirQualityData();
    updateFloodAlertData();
    updateWeatherData();
    generateAlertCards();
    
    // Map initialization
    let map;
    let riskLayers = {};
    
    function initializeMap() {
        // Initialize map centered on Nepal
        map = L.map('interactive-map').setView([28.3949, 84.1240], 7);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 10,
            minZoom: 6
        }).addTo(map);
        
        // Add search control
        L.Control.geocoder({
            defaultMarkGeocode: false
        }).on('markgeocode', function(e) {
            var bbox = e.geocode.bbox;
            map.fitBounds(bbox);
        }).addTo(map);
        
        // Define risk zones with click functionality
        const riskZones = [
            { name: 'Kathmandu', latlng: [27.7172, 85.3240], risks: ['earthquake'], level: 'high' },
            { name: 'Pokhara', latlng: [28.2096, 83.9856], risks: ['landslide'], level: 'high' },
            { name: 'Sindhupalchok', latlng: [27.9167, 85.5833], risks: ['earthquake', 'landslide'], level: 'high' },
            { name: 'Saptari', latlng: [26.5833, 86.8333], risks: ['flood'], level: 'high' },
            { name: 'Gorkha', latlng: [28.3333, 84.9167], risks: ['earthquake'], level: 'high' },
            { name: 'Biratnagar', latlng: [26.4833, 87.2833], risks: ['flood'], level: 'high' },
            { name: 'Nepalgunj', latlng: [28.0500, 81.6167], risks: ['flood'], level: 'medium' },
            { name: 'Kaski', latlng: [28.2096, 83.9856], risks: ['landslide'], level: 'high' },
            { name: 'Jhapa', latlng: [26.5833, 87.9167], risks: ['flood'], level: 'high' },
            { name: 'Chitwan', latlng: [27.5833, 84.5000], risks: ['flood', 'earthquake'], level: 'medium' }
        ];
        
        // Create layer groups
        riskLayers.earthquake = L.layerGroup();
        riskLayers.flood = L.layerGroup();
        riskLayers.landslide = L.layerGroup();
        riskLayers.all = L.layerGroup();
        
        // Add markers for each risk zone
        riskZones.forEach(zone => {
            let color;
            switch(zone.level) {
                case 'high': color = '#ef4444'; break;
                case 'medium': color = '#f59e0b'; break;
                case 'low': color = '#10b981'; break;
                default: color = '#6b7280';
            }
            
            // Create custom icon
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                    background: ${color};
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 12px;
                    cursor: pointer;
                ">
                    ${zone.risks.includes('earthquake') ? '⛰️' : 
                      zone.risks.includes('flood') ? '🌊' : '⛰️'}
                </div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            const marker = L.marker(zone.latlng, { icon: icon })
                .bindPopup(`
                    <div style="min-width: 200px;">
                        <h4 style="margin: 0 0 8px 0; color: var(--accent-brown);">${zone.name}</h4>
                        <p style="margin: 4px 0; font-size: 12px;">
                            <strong>Risk Level:</strong> 
                            <span style="color: ${color}; font-weight: bold;">${zone.level.toUpperCase()}</span>
                        </p>
                        <p style="margin: 4px 0; font-size: 12px;">
                            <strong>Primary Risks:</strong> ${zone.risks.join(', ')}
                        </p>
                        <button onclick="updateWeatherFromMap('${zone.name}')" 
                                style="width: 100%; margin-top: 8px; padding: 6px; background: var(--accent-brown); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            <i class="fas fa-cloud-sun"></i> View Weather
                        </button>
                    </div>
                `);
            
            // Add click handler to update district info
            marker.on('click', function() {
                const districtInfo = document.getElementById('district-info');
                const districtName = document.getElementById('district-name');
                const districtDescription = document.getElementById('district-description');
                const districtRisks = document.getElementById('district-risks');
                const districtTips = document.getElementById('district-tips');
                
                districtName.textContent = zone.name;
                districtDescription.textContent = `Located in Nepal with ${zone.level} risk level`;
                
                // Update weather widget
                updateWeatherForLocation(zone.name);
                
                // Clear and add risk tags
                districtRisks.innerHTML = '';
                zone.risks.forEach(risk => {
                    const tag = document.createElement('span');
                    tag.className = `risk-tag ${risk}`;
                    tag.style.cssText = 'display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 6px; margin-bottom: 6px;';
                    if (risk === 'earthquake') {
                        tag.style.background = 'rgba(197, 48, 48, 0.2)';
                        tag.style.color = 'var(--accent-red)';
                    } else if (risk === 'flood') {
                        tag.style.background = 'rgba(56, 161, 105, 0.2)';
                        tag.style.color = 'var(--accent-green)';
                    } else {
                        tag.style.background = 'rgba(210, 105, 30, 0.2)';
                        tag.style.color = 'var(--accent-orange)';
                    }
                    tag.textContent = risk.charAt(0).toUpperCase() + risk.slice(1);
                    districtRisks.appendChild(tag);
                });
                
                // Add tips
                let tips = '';
                if (zone.risks.includes('earthquake')) {
                    tips += '• Secure heavy furniture and know evacuation routes. ';
                }
                if (zone.risks.includes('flood')) {
                    tips += '• Prepare emergency supplies and evacuation plan. ';
                }
                if (zone.risks.includes('landslide')) {
                    tips += '• Avoid hillside areas during heavy rain. ';
                }
                districtTips.textContent = tips || 'Regular emergency preparedness recommended.';
                
                districtInfo.style.display = 'block';
            });
            
            // Add to appropriate layers
            if (zone.risks.includes('earthquake')) riskLayers.earthquake.addLayer(marker);
            if (zone.risks.includes('flood')) riskLayers.flood.addLayer(marker);
            if (zone.risks.includes('landslide')) riskLayers.landslide.addLayer(marker);
            riskLayers.all.addLayer(marker);
        });
        
        // Add all layers by default
        riskLayers.all.addTo(map);
        
        // Add click handler to map to close district info
        map.on('click', function() {
            document.getElementById('district-info').style.display = 'none';
        });
        
        // Layer control buttons
        document.querySelectorAll('.map-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const layer = this.getAttribute('data-layer');
                
                // Update button states
                document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Remove all layers
                Object.values(riskLayers).forEach(layerGroup => {
                    if (map.hasLayer(layerGroup)) {
                        map.removeLayer(layerGroup);
                    }
                });
                
                // Add selected layer
                if (layer === 'all') {
                    riskLayers.all.addTo(map);
                } else {
                    riskLayers[layer].addTo(map);
                }
            });
        });
        
        // Make function available globally for popup button
        window.updateWeatherFromMap = function(locationName) {
            updateWeatherForLocation(locationName);
        };
    }
    
    // Auto-refresh every 5 minutes
    setInterval(() => {
        updateAirQualityData();
        updateFloodAlertData();
        updateWeatherData();
    }, 300000);
    
    // Initialize with home tab active
    switchTab('home');
});
