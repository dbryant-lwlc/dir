let fullData = {};
let filteredStaff = [];
let filteredDepartments = [];
let filteredSpecialists = [];
let currentSort = { column: null, asc: true, table: null };

async function loadData() {
  try {
    const response = await fetch('src/directory.json');
    const data = await response.json();
    fullData = data;
    filteredStaff = data.staff;
    filteredDepartments = data.departments;
    filteredSpecialists = data.subject_specialists;
    renderAll();
    showSection('staff');
  } catch (error) {
    document.body.innerHTML = '<div class="alert alert-danger">Failed to load directory data. Please try again later.</div>';
    console.error('Data loading error:', error);
  }
}

function renderAll() {
  renderStaff(filteredStaff);
  renderDepartments(filteredDepartments);
  renderSpecialists(filteredSpecialists);
}

function highlightColumn(table, column) {
  return currentSort.table === table && currentSort.column === column ? 'highlight-sort' : '';
}

function renderStaff(staff) {
  const container = document.getElementById('staff');
  if (staff.length === 0) {
    container.innerHTML = '<p>No results found.</p>';
    return;
  }
  container.innerHTML = `
    <table class="directory-table">
      <thead>
        <tr>
          <th class="sortable ${highlightColumn('staff', 'first_name')}" onclick="sortTable('staff', 'first_name')">First Name <span class="sort-indicator">${getSortIndicator('staff', 'first_name')}</span></th>
          <th class="sortable ${highlightColumn('staff', 'last_name')}" onclick="sortTable('staff', 'last_name')">Last Name <span class="sort-indicator">${getSortIndicator('staff', 'last_name')}</span></th>
          <th class="sortable ${highlightColumn('staff', 'title')}" onclick="sortTable('staff', 'title')">Title <span class="sort-indicator">${getSortIndicator('staff', 'title')}</span></th>
          <th class="sortable ${highlightColumn('staff', 'department')}" onclick="sortTable('staff', 'department')">Department <span class="sort-indicator">${getSortIndicator('staff', 'department')}</span></th>
          <th>Contact Information</th>
        </tr>
      </thead>
      <tbody>
        ${staff.map(s => `
          <tr>
            <td>${s.first_name}</td>
            <td>${s.last_name}</td>
            <td>${s.title}</td>
            <td>${s.department}</td>
            <td><p>${s.email}</p><p>${s.phone}</p></td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;
}

function renderDepartments(departments) {
  const container = document.getElementById('departments');
  if (departments.length === 0) {
    container.innerHTML = '<p>No results found.</p>';
    return;
  }
  container.innerHTML = `
    <table class="directory-table">
      <thead>
        <tr>
          <th class="sortable ${highlightColumn('departments', 'name')}" onclick="sortTable('departments', 'name')">Department <span class="sort-indicator">${getSortIndicator('departments', 'name')}</span></th>
          <th class="sortable ${highlightColumn('departments', 'location')}" onclick="sortTable('departments', 'location')">Location <span class="sort-indicator">${getSortIndicator('departments', 'location')}</span></th>
          <th>Contact Information</th>
        </tr>
      </thead>
      <tbody>
        ${departments.map(d => `
          <tr>
            <td>${d.name}</td>
            <td>${(d.location ?? []).map(loc => `<p>${loc}</p>`).join('')}</td>
            <td>${(d.contact ?? []).map(info => `<p>${info}</p>`).join('')}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;
}

function renderSpecialists(subjectSpecialists) {
  const container = document.getElementById('subject_specialists');
  if (subjectSpecialists.length === 0) {
    container.innerHTML = '<p>No results found.</p>';
    return;
  }
  container.innerHTML = `
    <table class="directory-table">
      <thead>
        <tr>
          <th class="sortable ${highlightColumn('specialists', 'department')}" onclick="sortTable('specialists', 'department')">Department <span class="sort-indicator">${getSortIndicator('specialists', 'department')}</span></th>
          <th class="sortable ${highlightColumn('specialists', 'name')}" onclick="sortTable('specialists', 'name')">LWLC Faculty Member <span class="sort-indicator">${getSortIndicator('specialists', 'name')}</span></th>
          <th>Contact Information</th>
        </tr>
      </thead>
      <tbody>
        ${flattenedSpecialists().map(s => `
          <tr>
            <td>${s.department}</td>
            <td>${s.name}, ${s.title}</td>
            <td><p>${s.email}</p><p>${s.phone}</p></td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;
}

function flattenedSpecialists() {
  return filteredSpecialists.flatMap(group =>
    group.specialists.map(s => ({ ...s, department: group.department }))
  );
}

function getSortIndicator(table, column) {
  if (currentSort.table === table && currentSort.column === column) {
    return currentSort.asc ? '▲' : '▼';
  }
  return '►';
}

function highlightColumn(table, column) {
  return currentSort.table === table && currentSort.column === column ? 'highlight-sort' : '';
}

function sortTable(table, column) {
  if (currentSort.column === column && currentSort.table === table) {
    currentSort.asc = !currentSort.asc;
  } else {
    currentSort.column = column;
    currentSort.table = table;
    currentSort.asc = true;
  }

  const compare = (a, b) => {
    const aVal = Array.isArray(a[column]) ? a[column].join(' ').toLowerCase() : (a[column] || '').toLowerCase();
    const bVal = Array.isArray(b[column]) ? b[column].join(' ').toLowerCase() : (b[column] || '').toLowerCase();
    if (aVal < bVal) return currentSort.asc ? -1 : 1;
    if (aVal > bVal) return currentSort.asc ? 1 : -1;
    return 0;
  };

  if (table === 'staff') {
    filteredStaff.sort(compare);
    renderStaff(filteredStaff);
  } else if (table === 'departments') {
    filteredDepartments.sort(compare);
    renderDepartments(filteredDepartments);
  } else if (table === 'specialists') {
    filteredSpecialists = filteredSpecialists.sort((a, b) => {
      const aFlat = flattenedSpecialists().find(s => s.department === a.department);
      const bFlat = flattenedSpecialists().find(s => s.department === b.department);
      return compare(aFlat, bFlat);
    });
    renderSpecialists(filteredSpecialists);
  }
}

function normalizeText(text) {
  return (text || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function filterAllSections() {
  const query = normalizeText(document.getElementById('searchInput').value);

  filteredStaff = fullData.staff.filter(s =>
    normalizeText(s.first_name).includes(query) ||
    normalizeText(s.last_name).includes(query) ||
    normalizeText(s.title).includes(query) ||
    normalizeText(s.department).includes(query)
  );

  filteredDepartments = fullData.departments.filter(d =>
    normalizeText(d.name).includes(query) ||
    (d.location ?? []).some(loc => normalizeText(loc).includes(query)) ||
    (d.contact ?? []).some(info => normalizeText(info).includes(query))
  );

  filteredSpecialists = fullData.subject_specialists.map(group => {
    const filtered = group.specialists.filter(s =>
      normalizeText(s.name).includes(query) ||
      normalizeText(s.title).includes(query) ||
      normalizeText(s.email).includes(query) ||
      normalizeText(s.phone).includes(query)
    );
    return filtered.length ? { department: group.department, specialists: filtered } : null;
  }).filter(Boolean);

  renderAll();
}

function showSection(id) {
  document.querySelectorAll('section').forEach(sec => {
    sec.style.display = 'none';
    sec.classList.remove('fade-in');
  });
  const target = document.getElementById(id);
  target.style.display = 'block';
  void target.offsetWidth;
  target.classList.add('fade-in');

  document.querySelectorAll('nav button').forEach(btn => {
    btn.classList.remove('btn-warning', 'active-button');
    btn.classList.add('btn-primary');
  });
  const activeBtn = document.querySelector(`nav button[onclick*="${id}"]`);
  if (activeBtn) {
    activeBtn.classList.remove('btn-primary');
    activeBtn.classList.add('btn-warning', 'active-button');
  }
}

loadData();

const style = document.createElement('style');
style.innerHTML = `
  .highlight-sort { background-color: #ffc107 !important; }
`;
document.head.appendChild(style);
