let fullData = {};
    let filteredStaff = [];
    let filteredDepartments = [];
    let filteredSpecialists = [];
    let currentSort = { column: null, asc: true, table: null };

    async function loadData() {
      try {
        const response = await fetch('directory.json');
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

    function renderStaff(staff) {
      const container = document.getElementById('staff');
      container.innerHTML = `
        <table class="directory-table">
          <thead>
            <tr>
              <th class="sortable" onclick="sortTable('staff', 'first_name')">First Name <span class="sort-indicator">${getSortIndicator('staff', 'first_name')}</span></th>
              <th class="sortable" onclick="sortTable('staff', 'last_name')">Last Name <span class="sort-indicator">${getSortIndicator('staff', 'last_name')}</span></th>
              <th class="sortable" onclick="sortTable('staff', 'title')">Title <span class="sort-indicator">${getSortIndicator('staff', 'title')}</span></th>
              <th class="sortable" onclick="sortTable('staff', 'department')">Department <span class="sort-indicator">${getSortIndicator('staff', 'department')}</span></th>
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
  container.innerHTML = `
    <table class="directory-table">
      <thead>
        <tr>
          <th class="sortable" onclick="sortTable('departments', 'name')">Department <span class="sort-indicator">\${getSortIndicator('departments', 'name')}</span></th>
          <th class="sortable" onclick="sortTable('departments', 'location')">Location <span class="sort-indicator">\${getSortIndicator('departments', 'location')}</span></th>
          <th>Contact Information</th>
        </tr>
      </thead>
      <tbody>
        \${departments.map(d => `
          <tr>
            <td>\${d.url ? `<a href="\${d.url}" class="highlight-link">\${d.name}</a>` : d.name}</td>
            <td>\${(d.location ?? []).map(loc => `<p>\${loc}</p>`).join('')}</td>
            <td>\${(d.contact ?? []).map(info => `<p>\${info}</p>`).join('')}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}</span></th>
              <th class="sortable" onclick="sortTable('departments', 'contact')">Contact Information</th>
            </tr>
          </thead>
          <tbody>
            ${departments.map(d => `
              <tr>
                <td>${d.name}</td>
                <td>
                  ${d.phone ? `<p>${d.phone}</p>` : ''}
                  ${d.email ? `<p>${d.email}</p>` : ''}
                  ${d.url ? `<p><a href="${d.url}" class="highlight-link">Visit Department Page</a></p>` : ''}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      `;
    }

    function renderSpecialists(subjectSpecialists) {
      const container = document.getElementById('subject_specialists');
      container.innerHTML = `
        <table class="directory-table">
          <thead>
            <tr>
              <th class="sortable" onclick="sortTable('specialists', 'department')">Department <span class="sort-indicator">${getSortIndicator('specialists', 'department')}</span></th>
              <th class="sortable" onclick="sortTable('specialists', 'name')">LWLC Faculty Member <span class="sort-indicator">${getSortIndicator('specialists', 'name')}</span></th>
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
      return '';
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
        const aVal = (a[column] || '').toLowerCase();
        const bVal = (b[column] || '').toLowerCase();
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

    function filterAllSections() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      filteredStaff = fullData.staff.filter(s =>
        s.first_name.toLowerCase().includes(query) ||
        s.last_name.toLowerCase().includes(query) ||
        s.title.toLowerCase().includes(query) ||
        s.department.toLowerCase().includes(query)
      );
      renderStaff(filteredStaff);
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
    }

    loadData();