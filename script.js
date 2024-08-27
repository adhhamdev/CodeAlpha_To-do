document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    taskInput: document.getElementById('task-input'),
    addTaskButton: document.getElementById('add-task'),
    taskList: document.getElementById('task-list'),
    themeToggle: document.getElementById('theme-toggle'),
    filterDropdown: document.getElementById('filter-dropdown'),
    sortDropdown: document.getElementById('sort-dropdown'),
    clearAllButton: document.getElementById('clear-all'),
    profileButton: document.getElementById('profile-button'),
    favoritesButton: document.getElementById('favorites-button'),
    profileModal: document.getElementById('profile-modal'),
    profileList: document.getElementById('profile-list'),
    newProfileName: document.getElementById('new-profile-name'),
    newProfilePassword: document.getElementById('new-profile-password'),
    createProfileButton: document.getElementById('create-profile'),
    returnToListButton: document.getElementById('return-to-list'),
  };

  let currentProfile = 'default';
  let profiles = JSON.parse(localStorage.getItem('profiles')) || {
    default: { tasks: [], favorites: [], password: '' },
  };

  const saveProfiles = () =>
    localStorage.setItem('profiles', JSON.stringify(profiles));

  const renderTasks = (tasksToRender = profiles[currentProfile].tasks) => {
    elements.taskList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    tasksToRender.forEach((task) => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.innerHTML = `
        <input type="checkbox" ${task.completed ? 'checked' : ''} tabindex="0">
        <span class="task-text">${task.text}</span>
        <button class="favorite-task" aria-label="Favorite task" tabindex="0">
          <i class="fas fa-star ${
            profiles[currentProfile].favorites.includes(task.id)
              ? 'favorited'
              : ''
          }"></i>
        </button>
        <button class="delete-task" aria-label="Delete task" tabindex="0"><i class="fas fa-trash-alt"></i></button>
      `;

      const checkbox = li.querySelector('input[type="checkbox"]');
      const deleteButton = li.querySelector('.delete-task');
      const favoriteButton = li.querySelector('.favorite-task');

      checkbox.addEventListener('change', () => toggleTask(task.id));
      checkbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTask(task.id);
        }
      });

      deleteButton.addEventListener('click', () => deleteTask(task.id));
      deleteButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          deleteTask(task.id);
        }
      });

      favoriteButton.addEventListener('click', () => toggleFavorite(task.id));
      favoriteButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFavorite(task.id);
        }
      });

      fragment.appendChild(li);
    });
    elements.taskList.appendChild(fragment);
  };

  const addTask = () => {
    const text = elements.taskInput.value.trim();
    if (text) {
      const newTask = {
        id: Date.now(),
        text,
        completed: false,
        date: new Date(),
      };
      profiles[currentProfile].tasks.push(newTask);
      elements.taskInput.value = '';
      saveProfiles();
      applyFilterAndSort();
    }
  };

  const toggleTask = (id) => {
    const task = profiles[currentProfile].tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveProfiles();
      applyFilterAndSort();
    }
  };

  const deleteTask = (id) => {
    profiles[currentProfile].tasks = profiles[currentProfile].tasks.filter(
      (t) => t.id !== id
    );
    saveProfiles();
    applyFilterAndSort();
  };

  let currentFilter = 'all';
  let currentSort = 'date';

  const filterTasks = (filter) => {
    currentFilter = filter;
    applyFilterAndSort();
  };

  const sortTasks = (sortBy) => {
    currentSort = sortBy;
    applyFilterAndSort();
  };

  const applyFilterAndSort = () => {
    let filteredTasks = profiles[currentProfile].tasks;

    // Apply filter
    if (currentFilter !== 'all') {
      filteredTasks = filteredTasks.filter((task) =>
        currentFilter === 'active' ? !task.completed : task.completed
      );
    }

    // Apply sort
    if (currentSort === 'alphabetical') {
      filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
    } else if (currentSort === 'date') {
      filteredTasks.sort((a, b) => b.date - a.date);
    }

    renderTasks(filteredTasks);
  };

  const clearAllTasks = () => {
    profiles[currentProfile].tasks = [];
    saveProfiles();
    applyFilterAndSort();
  };

  // Profile management
  const renderProfiles = () => {
    elements.profileList.innerHTML = '';
    Object.keys(profiles).forEach((profile) => {
      const li = document.createElement('li');
      li.textContent = profile;
      li.addEventListener('click', () => switchProfile(profile));
      elements.profileList.appendChild(li);
    });
  };

  const switchProfile = (profile) => {
    const password = prompt('Enter password for ' + profile);
    if (password === profiles[profile].password) {
      currentProfile = profile;
      applyFilterAndSort();
      elements.profileModal.style.display = 'none';
    } else {
      alert('Incorrect password');
    }
  };

  const createProfile = () => {
    const name = elements.newProfileName.value.trim();
    const password = elements.newProfilePassword.value;
    if (name && password) {
      profiles[name] = { tasks: [], favorites: [], password: password };
      saveProfiles();
      renderProfiles();
      elements.newProfileName.value = '';
      elements.newProfilePassword.value = '';
    }
  };

  // Favorites functionality
  const toggleFavorite = (id) => {
    const taskIndex = profiles[currentProfile].tasks.findIndex(
      (t) => t.id === id
    );
    const favoriteIndex = profiles[currentProfile].favorites.indexOf(id);

    if (favoriteIndex === -1) {
      profiles[currentProfile].favorites.push(id);
    } else {
      profiles[currentProfile].favorites.splice(favoriteIndex, 1);
    }

    saveProfiles();
    renderTasks();
  };

  const showFavorites = () => {
    const favoriteTasks = profiles[currentProfile].tasks.filter((task) =>
      profiles[currentProfile].favorites.includes(task.id)
    );
    renderTasks(favoriteTasks);
    elements.favoritesButton.style.display = 'none';
    elements.returnToListButton.style.display = 'inline-block';
  };

  const returnToList = () => {
    applyFilterAndSort();
    elements.favoritesButton.style.display = 'inline-block';
    elements.returnToListButton.style.display = 'none';
  };

  // Event listeners
  elements.addTaskButton.addEventListener('click', addTask);
  elements.taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Remove this event listener as it's redundant
  // elements.themeToggle.addEventListener('click', () => {
  //   document.body.classList.toggle('dark-mode');
  //   const icon = elements.themeToggle.querySelector('i');
  //   icon.classList.toggle('fa-moon');
  //   icon.classList.toggle('fa-sun');
  // });

  // Update the toggleTheme function
  const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
    const icon = elements.themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');

    // Save the theme preference to localStorage
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
  };

  // Add event listeners for click and keydown
  elements.themeToggle.addEventListener('click', toggleTheme);
  elements.themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  });

  // Add this function to set the initial theme
  const setInitialTheme = () => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      document.body.classList.add('dark-mode');
      elements.themeToggle.querySelector('i').classList.remove('fa-moon');
      elements.themeToggle.querySelector('i').classList.add('fa-sun');
    }
  };

  // Call setInitialTheme at the end of the DOMContentLoaded event listener
  setInitialTheme();

  // Update event delegation for dropdowns
  document.addEventListener('click', handleDropdownClick);
  document.addEventListener('keydown', handleDropdownKeydown);

  function handleDropdownClick(e) {
    const dropdown = e.target.closest('.custom-dropdown');
    if (dropdown) {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      const isOpen = menu.style.display === 'block';

      if (e.target === toggle) {
        toggleDropdown(menu, isOpen);
      } else if (
        e.target.tagName === 'SPAN' &&
        e.target.closest('.dropdown-menu')
      ) {
        selectDropdownOption(toggle, menu, e.target, dropdown.id);
      } else if (!dropdown.contains(e.target)) {
        menu.style.display = 'none';
      }
    }
  }

  function handleDropdownKeydown(e) {
    const dropdown = e.target.closest('.custom-dropdown');
    if (dropdown) {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      const isOpen = menu.style.display === 'block';

      if (e.target === toggle) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          toggleDropdown(menu, isOpen);
        }
      } else if (
        e.target.tagName === 'SPAN' &&
        e.target.closest('.dropdown-menu')
      ) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectDropdownOption(toggle, menu, e.target, dropdown.id);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          navigateDropdown(e.target, e.key === 'ArrowUp' ? -1 : 1);
        }
      }

      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        menu.style.display = 'none';
      }
    }
  }

  function toggleDropdown(menu, isOpen) {
    menu.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) {
      menu.querySelector('span').focus();
    }
  }

  function selectDropdownOption(toggle, menu, target, dropdownId) {
    toggle.textContent = target.textContent;
    menu.style.display = 'none';
    toggle.focus();

    if (dropdownId === 'filter-dropdown') {
      filterTasks(target.dataset.value);
    } else if (dropdownId === 'sort-dropdown') {
      sortTasks(target.dataset.value);
    }
  }

  function navigateDropdown(currentItem, direction) {
    const items = Array.from(currentItem.parentNode.children);
    const currentIndex = items.indexOf(currentItem);
    const nextIndex = (currentIndex + direction + items.length) % items.length;
    items[nextIndex].focus();
  }

  // Update clear all button with keyboard support
  elements.clearAllButton.addEventListener('click', confirmClearAll);
  elements.clearAllButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      confirmClearAll();
    }
  });

  function confirmClearAll() {
    if (confirm('Are you sure you want to clear all tasks?')) {
      clearAllTasks();
    }
  }

  elements.profileButton.addEventListener('click', () => {
    renderProfiles();
    elements.profileModal.style.display = 'block';
  });

  elements.createProfileButton.addEventListener('click', createProfile);

  elements.favoritesButton.addEventListener('click', showFavorites);
  elements.returnToListButton.addEventListener('click', returnToList);

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === elements.profileModal) {
      elements.profileModal.style.display = 'none';
    }
  });

  applyFilterAndSort(); // Replace renderTasks() at the end
});
