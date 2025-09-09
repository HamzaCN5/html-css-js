document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const authSection = document.getElementById('auth-section');
  const appSection = document.getElementById('app-section');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const showSignupBtn = document.getElementById('show-signup');
  const showLoginBtn = document.getElementById('show-login');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userNameEl = document.getElementById('user-name');
  const showHistoryBtn = document.getElementById('show-history-btn');
  const historyModal = document.getElementById('history-modal');
  const closeHistoryBtn = document.getElementById('close-history');
  
  const taskInput = document.getElementById('task-input');
  const addTaskBtn = document.getElementById('add-task-btn');
  const taskList = document.getElementById('task-list');
  const emptyImg = document.querySelector('.empty-img');
  const totalTasksEl = document.getElementById('total-tasks');
  const completedTasksEl = document.getElementById('completed-tasks');
  const progressbar = document.getElementById('progresse');
  const progressNumber = document.getElementById('numbers');
  const filterButtons = document.querySelectorAll('.filter-buttons button');
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history');
  
  // App State
  let currentUser = null;
  let tasks = [];
  let history = [];
  let currentFilter = 'all';
  
  // Check if user is already logged in
  function checkLoggedIn() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
      currentUser = user;
      loadUserData();
      showApp();
    }
  }
  
  // Show/hide auth and app sections
  function showApp() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    showHistoryBtn.classList.remove('hidden');
    userNameEl.textContent = currentUser.name;
  }
  
  function showAuth() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    showHistoryBtn.classList.add('hidden');
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  }
  
  // Auth event listeners
  showSignupBtn.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
  });
  
  showLoginBtn.addEventListener('click', () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  });
  
  loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    // Simulate login - in a real app, this would call an API
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      loadUserData();
      showApp();
    } else {
      alert('Invalid email or password');
    }
  });
  
  signupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    if (!name || !email || !password) {
      alert('Please fill all fields');
      return;
    }
    
    // Simulate signup - in a real app, this would call an API
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.find(u => u.email === email)) {
      alert('User with this email already exists');
      return;
    }
    
    // In a real app, you would hash the password before storing it
    // This is just a demonstration and not secure for production
    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem(`tasks_${newUser.id}`, JSON.stringify([]));
    localStorage.setItem(`history_${newUser.id}`, JSON.stringify([]));
    
    showApp();
  });
  
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    currentUser = null;
    tasks = [];
    history = [];
    showAuth();
  });
  
  // History functions
  function addHistory(action, taskText, oldText = null) {
    const historyItem = {
      id: Date.now(),
      action,
      taskText,
      oldText,
      timestamp: new Date()
    };
    
    history.unshift(historyItem);
    if (history.length > 50) history = history.slice(0, 50); // Keep only last 50 items
    
    if (currentUser) {
      localStorage.setItem(`history_${currentUser.id}`, JSON.stringify(history));
    }
  }
  
  function loadHistory() {
    if (history.length === 0) {
      historyList.innerHTML = '<div class="no-history">No activity yet</div>';
      return;
    }
    
    historyList.innerHTML = '';
    history.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = `history-item ${item.action}`;
      
      let actionText = '';
      switch(item.action) {
        case 'added':
          actionText = `Added: "${item.taskText}"`;
          break;
        case 'completed':
          actionText = `Completed: "${item.taskText}"`;
          break;
        case 'uncompleted':
          actionText = `Marked as active: "${item.taskText}"`;
          break;
        case 'deleted':
          actionText = `Deleted: "${item.taskText}"`;
          break;
        case 'edited':
          actionText = `Edited: "${item.oldText}" → "${item.taskText}"`;
          break;
      }
      
      const timeString = formatTime(item.timestamp);
      
      historyItem.innerHTML = `
        <div>${actionText}</div>
        <div class="history-time">${timeString}</div>
      `;
      
      historyList.appendChild(historyItem);
    });
  }
  
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
  
  // History modal functionality
  showHistoryBtn.addEventListener('click', () => {
    loadHistory();
    historyModal.style.display = 'flex';
  });
  
  closeHistoryBtn.addEventListener('click', () => {
    historyModal.style.display = 'none';
  });
  
  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    if (currentUser) {
      localStorage.setItem(`history_${currentUser.id}`, JSON.stringify(history));
    }
    loadHistory();
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === historyModal) {
      historyModal.style.display = 'none';
    }
  });
  
  // Load user-specific data
  function loadUserData() {
    if (currentUser) {
      tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.id}`)) || [];
      history = JSON.parse(localStorage.getItem(`history_${currentUser.id}`)) || [];
      renderTasks();
      updateStats();
      updateProgress();
    }
  }
  
  // Save user-specific data
  function saveTasks() {
    if (currentUser) {
      localStorage.setItem(`tasks_${currentUser.id}`, JSON.stringify(tasks));
    }
  }
  
  // Todo App Functions
  const updateStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    
    totalTasksEl.textContent = `Total: ${totalTasks} task${totalTasks !== 1 ? 's' : ''}`;
    completedTasksEl.textContent = `Completed: ${completedTasks} task${completedTasks !== 1 ? 's' : ''}`;
  };
  
  const toggleEmptyState = () => {
    emptyImg.style.display = taskList.children.length === 0 ? 'block' : 'none';
    updateStats();
  };
  
  const updateProgress = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    progressbar.style.width = totalTasks ? `${(completedTasks/totalTasks)*100}%` : '0%';
    progressNumber.textContent = `${completedTasks}/${totalTasks}`;
  };
  
  const createTaskElement = (task) => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');
    
    li.innerHTML = `
      <div class="task-content">
        <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text">${task.text}</span>
      </div>
      <div class="edit-delete-btn">
        <button class="edit-btn"><i class="fas fa-pencil-alt"></i></button>
        <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
    
    const checkbox = li.querySelector('.checkbox');
    const editBtn = li.querySelector(".edit-btn");
    const span = li.querySelector('.task-text');
    const deleteBtn = li.querySelector('.delete-btn');
    
    if (task.completed) {
      editBtn.disabled = true;
      editBtn.style.pointerEvents = 'none';
      editBtn.style.opacity = '0.5';
    }
    
    // Edit functionality
    editBtn.addEventListener('click', () => {
      if (!checkbox.checked) {
        const oldText = span.textContent;
        const newText = prompt('Edit your task:', oldText);
        
        if (newText !== null && newText.trim() !== '') {
          span.textContent = newText.trim();
          
          // Update task in array
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks[taskIndex].text = newText.trim();
          }
          
          saveTasks();
          addHistory('edited', newText.trim(), oldText);
        }
      }
    });
    
    // Checkbox functionality
    checkbox.addEventListener('change', () => {
      li.classList.toggle('completed');
      editBtn.disabled = checkbox.checked;
      editBtn.style.pointerEvents = checkbox.checked ? 'none' : 'auto';
      editBtn.style.opacity = checkbox.checked ? '0.5' : '1';
      
      // Update task in array
      const taskIndex = tasks.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = checkbox.checked;
      }
      
      saveTasks();
      updateStats();
      updateProgress();
      filterTasks(currentFilter);
      
      // Add to history
      if (checkbox.checked) {
        addHistory('completed', task.text);
      } else {
        addHistory('uncompleted', task.text);
      }
    });
    
    // Delete functionality
    deleteBtn.addEventListener('click', () => {
      li.classList.add('fade-out');
      setTimeout(() => {
        // Remove from tasks array
        tasks = tasks.filter(t => t.id !== task.id);
        li.remove();
        saveTasks();
        toggleEmptyState();
        updateProgress();
        
        // Add to history
        addHistory('deleted', task.text);
      }, 300);
    });
    
    return li;
  };
  
  const renderTasks = () => {
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const li = createTaskElement(task);
      taskList.appendChild(li);
    });
    toggleEmptyState();
    filterTasks(currentFilter);
  };
  
  const addTask = (event) => {
    event.preventDefault();
    const taskText = taskInput.value.trim();
    
    if (!taskText) {
      taskInput.style.boxShadow = '0 0 0 2px rgba(255, 117, 140, 0.5)';
      setTimeout(() => {
        taskInput.style.boxShadow = 'none';
      }, 1000);
      return;
    }
    
    // Add to tasks array
    const newTask = {
      id: Date.now().toString(),
      text: taskText,
      completed: false
    };
    
    tasks.push(newTask);
    const li = createTaskElement(newTask);
    taskList.appendChild(li);
    taskInput.value = '';
    
    saveTasks();
    toggleEmptyState();
    updateProgress();
    filterTasks(currentFilter);
    
    // Add to history
    addHistory('added', taskText);
  };
  
  const filterTasks = (filter) => {
    const taskItems = taskList.querySelectorAll('li');
    
    taskItems.forEach(item => {
      const taskId = item.querySelector('.task-text').textContent;
      const task = tasks.find(t => t.text === taskId);
      const isCompleted = task ? task.completed : item.classList.contains('completed');
      
      if (filter === 'all') {
        item.style.display = 'flex';
      } else if (filter === 'active') {
        item.style.display = isCompleted ? 'none' : 'flex';
      } else if (filter === 'completed') {
        item.style.display = isCompleted ? 'flex' : 'none';
      }
    });
  };
  
  // Add event listeners for filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      filterTasks(currentFilter);
    });
  });
  
  addTaskBtn.addEventListener('click', addTask);
  
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTask(e);
    }
  });
  
  // Initialize the app
  checkLoggedIn();
});