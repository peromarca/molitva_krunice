// JSONBin.io konfiguracija - postavite svoje podatke
const JSONBIN_CONFIG = {
   binId: '68dc0107ae596e708f0161d5', // Novi bin ID za oktobar
   accessKey: '$2a$10$I2wEmhX.DPtBALkQ3TcdI.bhy4ZOoAChjdbTzPP/XAsNao5M7CjVy', // Vaš access key
   baseUrl: 'https://api.jsonbin.io/v3'
};

// Dani u mjesecu (oktobar 2025)
const dates = [
   { date: 'srijeda 1.10.', day: 'srijeda', dateNum: 1 },
   { date: 'četvrtak 2.10.', day: 'četvrtak', dateNum: 2 },
   { date: 'petak 3.10.', day: 'petak', dateNum: 3 },
   { date: 'subota 4.10.', day: 'subota', dateNum: 4 },
   { date: 'nedjelja 5.10.', day: 'nedjelja', dateNum: 5 },
   { date: 'ponedjeljak 6.10.', day: 'ponedjeljak', dateNum: 6 },
   { date: 'utorak 7.10.', day: 'utorak', dateNum: 7 },
   { date: 'srijeda 8.10.', day: 'srijeda', dateNum: 8 },
   { date: 'četvrtak 9.10.', day: 'četvrtak', dateNum: 9 },
   { date: 'petak 10.10.', day: 'petak', dateNum: 10 },
   { date: 'subota 11.10.', day: 'subota', dateNum: 11 },
   { date: 'nedjelja 12.10.', day: 'nedjelja', dateNum: 12 },
   { date: 'ponedjeljak 13.10.', day: 'ponedjeljak', dateNum: 13 },
   { date: 'utorak 14.10.', day: 'utorak', dateNum: 14 },
   { date: 'srijeda 15.10.', day: 'srijeda', dateNum: 15 },
   { date: 'četvrtak 16.10.', day: 'četvrtak', dateNum: 16 },
   { date: 'petak 17.10.', day: 'petak', dateNum: 17 },
   { date: 'subota 18.10.', day: 'subota', dateNum: 18 },
   { date: 'nedjelja 19.10.', day: 'nedjelja', dateNum: 19 },
   { date: 'ponedjeljak 20.10.', day: 'ponedjeljak', dateNum: 20 },
   { date: 'utorak 21.10.', day: 'utorak', dateNum: 21 },
   { date: 'srijeda 22.10.', day: 'srijeda', dateNum: 22 },
   { date: 'četvrtak 23.10.', day: 'četvrtak', dateNum: 23 },
   { date: 'petak 24.10.', day: 'petak', dateNum: 24 },
   { date: 'subota 25.10.', day: 'subota', dateNum: 25 },
   { date: 'nedjelja 26.10.', day: 'nedjelja', dateNum: 26 },
   { date: 'ponedjeljak 27.10.', day: 'ponedjeljak', dateNum: 27 },
   { date: 'utorak 28.10.', day: 'utorak', dateNum: 28 },
   { date: 'srijeda 29.10.', day: 'srijeda', dateNum: 29 },
   { date: 'četvrtak 30.10.', day: 'četvrtak', dateNum: 30 },
   { date: 'petak 31.10.', day: 'petak', dateNum: 31 }
];

const categories = ['radosna', 'zalosna', 'slavna', 'svjetla', 'post'];
let scheduleData = {};

// ✅ Nedjelje za koje je POST onemogućen (oktobar 2025)
const disabledPostDates = ['nedjelja 5.10.', 'nedjelja 12.10.', 'nedjelja 19.10.', 'nedjelja 26.10.'];

// ✅ Funkcija za dobijanje trenutnog datuma
function getCurrentDate() {
   return new Date();
}

// ✅ Funkcija za provjeru da li je datum prošao
function isPastDate(dateNum) {
   const today = new Date();
   const targetDate = new Date(2025, 9, dateNum); // oktobar je mjesec 9 (0-based: jan=0, feb=1, ..., oct=9)

   // Postaviti vrijeme na početak dana za preciznu usporedbu
   today.setHours(0, 0, 0, 0);
   targetDate.setHours(0, 0, 0, 0);

   return targetDate < today;
}

// ✅ Funkcija za provjeru da li je danas
function isToday(dateNum) {
   const today = new Date();
   const targetDate = new Date(2025, 9, dateNum); // oktobar je mjesec 9

   // Postaviti vrijeme na početak dana za preciznu usporedbu
   today.setHours(0, 0, 0, 0);
   targetDate.setHours(0, 0, 0, 0);

   return targetDate.getTime() === today.getTime();
}

// Inicijalizacija praznih podataka
function initializeData() {
   dates.forEach(dateObj => {
      scheduleData[dateObj.date] = {
         radosna: '',
         zalosna: '',
         slavna: '',
         svjetla: '',
         post: ''
      };
   });
}

// Prikaz poruke
function showStatus(message, type = 'success') {
   const statusDiv = document.getElementById('status');
   statusDiv.textContent = message;
   statusDiv.className = `status ${type}`;
   setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = '';
   }, 3000);
}

// Učitavanje podataka s JSONBin.io
async function loadData() {
   try {
      if (!JSONBIN_CONFIG.binId || JSONBIN_CONFIG.binId === 'YOUR_BIN_ID_HERE') {
         console.log('JSONBin.io nije konfiguriran, koristim lokalne podatke');
         initializeData();
         renderTable();
         document.getElementById('loading').style.display = 'none';
         document.getElementById('schedule-table').style.display = 'table';
         return;
      }

      console.log('Pokušavam učitati podatke s JSONBin.io...');
      const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/b/${JSONBIN_CONFIG.binId}/latest`, {
         headers: {
            'X-Access-Key': JSONBIN_CONFIG.accessKey
         }
      });

      console.log('Response status:', response.status);

      if (response.ok) {
         const data = await response.json();
         scheduleData = data.record || {};
         console.log('Podaci uspješno učitani:', scheduleData);

         // Provjeri da li su svi datumi prisutni
         dates.forEach(dateObj => {
            if (!scheduleData[dateObj.date]) {
               scheduleData[dateObj.date] = {
                  radosna: '',
                  zalosna: '',
                  slavna: '',
                  svjetla: '',
                  post: ''
               };
            }
            // ✅ Dodaj post ako ne postoji
            if (!scheduleData[dateObj.date].hasOwnProperty('post')) {
               scheduleData[dateObj.date].post = '';
            }
         });
         showStatus('Podaci uspješno učitani s clouda!', 'success');
      } else {
         const errorText = await response.text();
         console.error('API Error:', response.status, errorText);
         throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
   } catch (error) {
      console.error('Greška:', error);
      initializeData();
      showStatus(`Greška: ${error.message}. Koristim lokalne podatke.`, 'error');
   }

   renderTable();
   document.getElementById('loading').style.display = 'none';
   document.getElementById('schedule-table').style.display = 'table';
}

// Spremanje podataka na JSONBin.io
async function saveData() {
   try {
      if (!JSONBIN_CONFIG.binId || JSONBIN_CONFIG.binId === 'YOUR_BIN_ID_HERE') {
         console.log('JSONBin.io nije konfiguriran');
         showStatus('Podaci spremljeni lokalno', 'success');
         return;
      }

      const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/b/${JSONBIN_CONFIG.binId}`, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': JSONBIN_CONFIG.accessKey
         },
         body: JSON.stringify(scheduleData)
      });

      if (response.ok) {
         showStatus('Podaci uspješno spremljeni!', 'success');
      } else {
         throw new Error('Greška pri spremanju');
      }
   } catch (error) {
      console.error('Greška pri spremanju:', error);
      showStatus('Greška pri spremanju podataka', 'error');
   }
}

// Kreiranje tablice
function renderTable() {
   const tbody = document.getElementById('table-body');
   tbody.innerHTML = '';

   dates.forEach(dateObj => {
      const row = document.createElement('tr');

      // Datum
      const dateCell = document.createElement('td');
      dateCell.textContent = dateObj.date;

      // ✅ Dodij klase za datum ovisno o statusu
      let dateCellClass = 'date-cell';
      if (isToday(dateObj.dateNum)) {
         dateCellClass += ' today';
      } else if (isPastDate(dateObj.dateNum)) {
         dateCellClass += ' past';
      }
      dateCell.className = dateCellClass;
      row.appendChild(dateCell);

      // Kategorije otajstava
      categories.forEach(category => {
         const cell = document.createElement('td');
         const value = scheduleData[dateObj.date][category] || '';

         // ✅ Posebno tretiranje POST stupca
         if (category === 'post') {
            if (disabledPostDates.includes(dateObj.date)) {
               // Crvena polja za nedjelje - onemogućena
               cell.textContent = 'NED';
               cell.className = 'post-cell disabled';
               cell.onclick = null; // Onemogući klik
            } else {
               // Normalna POST polja
               cell.textContent = value;
               let cellClass = value ? 'post-cell filled' : 'post-cell';

               // ✅ Dodaj past klasu ako je datum prošao
               if (isPastDate(dateObj.dateNum)) {
                  cellClass += ' past';
               }

               cell.className = cellClass;
               cell.onclick = () => editCell(dateObj.date, category, cell);
            }
         } else {
            // Ostale kategorije
            cell.textContent = value;
            let cellClass = value ? 'data-cell filled' : 'data-cell';

            // ✅ Dodaj past klasu ako je datum prošao
            if (isPastDate(dateObj.dateNum)) {
               cellClass += ' past';
            }

            cell.className = cellClass;
            cell.onclick = () => editCell(dateObj.date, category, cell);
         }

         row.appendChild(cell);
      });

      tbody.appendChild(row);
   });
}

// Editiranje ćelije
function editCell(date, category, cellElement) {
   // ✅ Provjeri da li je POST polje onemogućeno
   if (category === 'post' && disabledPostDates.includes(date)) {
      return; // Ne radi ništa za onemogućena polja
   }

   const currentValue = scheduleData[date][category] || '';
   const categoryName = category === 'post' ? 'POST' : `${category.toUpperCase()} OTAJSTVA`;

   const newValue = prompt(
      `${date} - ${categoryName}\n\nUnesite ime (ili ostavite prazno za brisanje):`,
      currentValue
   );

   if (newValue !== null) {
      scheduleData[date][category] = newValue.trim();
      cellElement.textContent = newValue.trim();

      // ✅ Ažuriraj klase uz provjeru datuma
      const dateNum = dates.find(d => d.date === date)?.dateNum;
      const isPast = isPastDate(dateNum);

      if (category === 'post') {
         let cellClass = newValue.trim() ? 'post-cell filled' : 'post-cell';
         if (isPast) cellClass += ' past';
         cellElement.className = cellClass;
      } else {
         let cellClass = newValue.trim() ? 'data-cell filled' : 'data-cell';
         if (isPast) cellClass += ' past';
         cellElement.className = cellClass;
      }

      saveData();
   }
}

// Pokretanje aplikacije
document.addEventListener('DOMContentLoaded', () => {
   loadData();
});