const $ = (id) => document.getElementById(id);
let token = localStorage.getItem('taskflow_token');
let userEmail = localStorage.getItem('taskflow_email');

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function showView() {
  $('auth-view').hidden = !!token;
  $('task-view').hidden = !token;
  if (token) {
    $('user-email').textContent = userEmail;
    loadTasks();
  }
}

async function authenticate(kind) {
  try {
    const data = await api(`/api/auth/${kind}`, {
      method: 'POST',
      body: JSON.stringify({ email: $('email').value, password: $('password').value }),
    });
    token = data.token;
    userEmail = data.user.email;
    localStorage.setItem('taskflow_token', token);
    localStorage.setItem('taskflow_email', userEmail);
    $('auth-msg').textContent = '';
    showView();
  } catch (err) {
    $('auth-msg').textContent = err.message;
  }
}

async function loadTasks() {
  try {
    const tasks = await api('/api/tasks');
    const list = $('task-list');
    list.innerHTML = '';
    tasks.forEach((t) => {
      const li = document.createElement('li');
      if (t.done) li.className = 'done';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = t.done;
      cb.style.width = 'auto';
      cb.style.margin = '0';
      cb.onchange = async () => {
        await api(`/api/tasks/${t.id}`, { method: 'PUT', body: JSON.stringify({ done: cb.checked }) });
        loadTasks();
      };
      const span = document.createElement('span');
      span.textContent = t.title;
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.onclick = async () => {
        await api(`/api/tasks/${t.id}`, { method: 'DELETE' });
        loadTasks();
      };
      li.append(cb, span, del);
      list.appendChild(li);
    });
  } catch {
    logout();
  }
}

function logout() {
  token = null;
  localStorage.removeItem('taskflow_token');
  localStorage.removeItem('taskflow_email');
  showView();
}

$('login-btn').onclick = () => authenticate('login');
$('register-btn').onclick = () => authenticate('register');
$('logout-btn').onclick = logout;
$('add-btn').onclick = async () => {
  const title = $('task-title').value.trim();
  if (!title) return;
  await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title }) });
  $('task-title').value = '';
  loadTasks();
};

showView();
