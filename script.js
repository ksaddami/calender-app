document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: loadEvents(),
        eventClick: function(info) {
            showEventDetails(info.event);
        },
        dateClick: function(info) {
            document.getElementById('taskDate').value = info.dateStr;
        }
    });
    calendar.render();
    updateTodayTasks();

    // Form submission
    const taskForm = document.getElementById('taskForm');
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value;
        const date = document.getElementById('taskDate').value;
        const description = document.getElementById('taskDescription').value;
        const color = document.getElementById('taskColor').value;
        
        if (!title || !date) return;
        
        const newEvent = {
            id: Date.now().toString(),
            title: title,
            start: date,
            description: description,
            color: color
        };
        
        let events = loadEvents();
        events.push(newEvent);
        saveEvents(events);
        
        calendar.refetchEvents();
        updateTodayTasks();
        taskForm.reset();
    });

    // Delete event button
    document.getElementById('deleteEventBtn').addEventListener('click', function() {
        const eventId = this.dataset.eventId;
        if (eventId) {
            let events = loadEvents().filter(event => event.id !== eventId);
            saveEvents(events);
            calendar.refetchEvents();
            updateTodayTasks();
            bootstrap.Modal.getInstance(document.getElementById('eventModal')).hide();
        }
    });
});

function loadEvents() {
    const eventsJson = localStorage.getItem('calendarEvents');
    return eventsJson ? JSON.parse(eventsJson) : [];
}

function saveEvents(events) {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function showEventDetails(event) {
    document.getElementById('eventModalTitle').textContent = event.title;
    document.getElementById('eventModalDate').textContent = 
        `Date: ${event.start.toLocaleDateString()}`;
    document.getElementById('eventModalDescription').textContent = 
        event.extendedProps.description || 'No description provided';
    document.getElementById('deleteEventBtn').dataset.eventId = event.id;
    
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

function updateTodayTasks() {
    const todayTasksEl = document.getElementById('todayTasks');
    todayTasksEl.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const events = loadEvents().filter(event => {
        const eventDate = new Date(event.start);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
    });
    
    if (events.length === 0) {
        todayTasksEl.innerHTML = '<li class="list-group-item">No tasks for today</li>';
        return;
    }
    
    events.forEach(event => {
        const taskEl = document.createElement('li');
        taskEl.className = 'list-group-item';
        taskEl.style.borderLeft = `4px solid ${event.color}`;
        
        const titleEl = document.createElement('strong');
        titleEl.textContent = event.title;
        
        const descEl = document.createElement('div');
        descEl.className = 'text-muted small';
        descEl.textContent = event.description || '';
        
        taskEl.appendChild(titleEl);
        taskEl.appendChild(descEl);
        todayTasksEl.appendChild(taskEl);
    });
}
