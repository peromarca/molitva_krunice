// Multi-bin JSONBin.io konfiguracija za redundanciju
const JSONBIN_CONFIG = {
   accessKey: '$2a$10$I2wEmhX.DPtBALkQ3TcdI.bhy4ZOoAChjdbTzPP/XAsNao5M7CjVy',
   baseUrl: 'https://api.jsonbin.io/v3',
   bins: {
      primary: '68dc0107ae596e708f0161d5',   // Bin 1 - glavni
      backup1: '68f0d752ae596e708f16e152',   // Bin 2 - backup
      backup2: '68f0d77fae596e708f16e1a5',   // Bin 3 - backup
      auditLog: '68f0da3d43b1c97be96b2c13'   // Bin 4 - audit log
   }
};

// Admin konfiguracija
const ADMIN_CONFIG = {
   code: 'molitva2025'
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

// Helper funkcije za multi-bin rad
async function loadFromBin(binId) {
   try {
      const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/b/${binId}/latest`, {
         headers: {
            'X-Access-Key': JSONBIN_CONFIG.accessKey
         }
      });

      if (response.ok) {
         const data = await response.json();
         return data.record || {};
      }
      return null;
   } catch (error) {
      console.log(`Greška pri učitavanju iz bin ${binId}:`, error);
      return null;
   }
}

async function saveToBin(binId, data) {
   try {
      const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/b/${binId}`, {
         method: 'PUT',
         headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': JSONBIN_CONFIG.accessKey
         },
         body: JSON.stringify(data)
      });

      return response.ok;
   } catch (error) {
      console.log(`Greška pri spremanju u bin ${binId}:`, error);
      return false;
   }
}

async function logToAudit(datum, kategorija, vrijednost) {
   try {
      const timestamp = new Date().toISOString().replace('T', '_').substring(0, 16);
      const logEntry = {
         [timestamp]: {
            datum: datum,
            kategorija: kategorija,
            vrijednost: vrijednost,
            akcija: 'dodao'
         }
      };

      // Učitaj postojeći log
      const existingLog = await loadFromBin(JSONBIN_CONFIG.bins.auditLog) || {};

      // Dodaj novi unos
      const updatedLog = { ...existingLog, ...logEntry };

      // Spremi nazad
      await saveToBin(JSONBIN_CONFIG.bins.auditLog, updatedLog);
   } catch (error) {
      console.log('Greška pri logiranju:', error);
   }
}

// Lokalni backup funkcije
function saveLocalBackup() {
   try {
      localStorage.setItem('molitva_krunice_backup', JSON.stringify({
         data: scheduleData,
         timestamp: new Date().toISOString(),
         version: '1.0'
      }));
      console.log('Lokalni backup spremljen');
   } catch (error) {
      console.error('Greška pri spremanju lokalnog backup-a:', error);
   }
}

function loadLocalBackup() {
   try {
      const backup = localStorage.getItem('molitva_krunice_backup');
      if (backup) {
         const backupData = JSON.parse(backup);
         console.log('Lokalni backup pronađen:', backupData.timestamp);
         return backupData.data;
      }
   } catch (error) {
      console.error('Greška pri učitavanju lokalnog backup-a:', error);
   }
   return null;
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

// Multi-bin učitavanje podataka
async function loadData() {
   try {
      console.log('Pokušavam učitati podatke s multi-bin sustava...');

      const binIds = [
         JSONBIN_CONFIG.bins.primary,
         JSONBIN_CONFIG.bins.backup1,
         JSONBIN_CONFIG.bins.backup2
      ];

      let successfulBins = 0;
      let loadedData = null;

      // Pokušaj učitati iz svih binova
      for (let i = 0; i < binIds.length; i++) {
         const data = await loadFromBin(binIds[i]);
         if (data && Object.keys(data).length > 0) {
            successfulBins++;
            if (!loadedData) {
               loadedData = data; // Koristi podatke iz prvog uspješnog bina
            }
         }
      }

      // Odredi status poruku
      if (successfulBins === 3) {
         showStatus('Svi podatci uspješno učitani', 'success');
         scheduleData = loadedData;
      } else if (successfulBins > 0) {
         showStatus('Podatci učitani', 'warning');
         scheduleData = loadedData;
      } else {
         // Pokušaj lokalni backup
         const localData = loadLocalBackup();
         if (localData) {
            showStatus('Neuspješno učitavanje → uzimam lokalno', 'warning');
            scheduleData = localData;
         } else {
            showStatus('Neuspješno učitavanje → kreiranje praznih podataka', 'error');
            initializeData();
         }
      }

   } catch (error) {
      console.error('Greška pri učitavanju:', error);
      const localData = loadLocalBackup();
      if (localData) {
         showStatus('Neuspješno učitavanje → uzimam lokalno', 'warning');
         scheduleData = localData;
      } else {
         showStatus('Greška: kreiranje praznih podataka', 'error');
         initializeData();
      }
   }

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

   renderTable();
   document.getElementById('loading').style.display = 'none';
   document.getElementById('schedule-table').style.display = 'table';
}

// Multi-bin spremanje podataka
async function saveData() {
   // Spremi lokalni backup uvijek
   saveLocalBackup();

   try {
      console.log('Pokušavam spremiti podatke u multi-bin sustav...');

      const binIds = [
         JSONBIN_CONFIG.bins.primary,
         JSONBIN_CONFIG.bins.backup1,
         JSONBIN_CONFIG.bins.backup2
      ];

      // Pokušaj spremiti u sve binove paralelno
      const savePromises = binIds.map(binId => saveToBin(binId, scheduleData));
      const results = await Promise.all(savePromises);

      // Broji uspješne binove
      const successfulSaves = results.filter(result => result === true).length;

      if (successfulSaves === 3) {
         showStatus('Uspješno poslano', 'success');
      } else if (successfulSaves >= 2) {
         showStatus('Podatci uploadani na cloud', 'warning');
      } else {
         showStatus('Greška pri spremanju na cloud', 'error');
      }

      console.log(`Uspješno spremljeno u ${successfulSaves}/3 binova`);

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

// Editiranje ćelije s admin zaštitom i potvrdom
function editCell(date, category, cellElement) {
   // ✅ Provjeri da li je POST polje onemogućeno
   if (category === 'post' && disabledPostDates.includes(date)) {
      return; // Ne radi ništa za onemogućena polja
   }

   const currentValue = scheduleData[date][category] || '';
   const categoryName = category === 'post' ? 'POST' : `${category.toUpperCase()} OTAJSTVA`;

   // Provjeri da li korisnik pokušava obrisati (admin zaštita)
   if (currentValue && currentValue.trim() !== '') {
      const adminCode = prompt(
         `${date} - ${categoryName}\n\nZa brisanje postojećeg unosa trebate admin kod:`,
         ''
      );

      if (adminCode !== ADMIN_CONFIG.code) {
         showStatus('Neispravan admin kod! Brisanje nije dozvoljeno.', 'error');
         return;
      }
   }

   const newValue = prompt(
      `${date} - ${categoryName}\n\nUnesite ime (ili ostavite prazno za brisanje):`,
      currentValue
   );

   if (newValue !== null) {
      // Potvrda unosa (samo za dodavanje imena)
      if (newValue.trim() !== '') {
         const confirmation = confirm('Jeste li sigurni da se želite upisati?');
         if (!confirmation) {
            return; // Odustani ako korisnik ne potvrdi
         }
      }

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

      // Log samo dodavanja (ne brisanja)
      if (newValue.trim() !== '') {
         logToAudit(date, category, newValue.trim());
      }

      saveData();
   }
}

// Pokretanje aplikacije
document.addEventListener('DOMContentLoaded', () => {
   loadData();
});

// Admin funkcionalnost
function showAdminInfo() {
   // Zatraži admin kod prije prikaza informacija
   const enteredCode = prompt('Unesite admin kod za pristup informacijama:');

   if (enteredCode !== ADMIN_CONFIG.code) {
      if (enteredCode !== null) { // Samo ako nije kliknuo Cancel
         showStatus('Neispravan admin kod!', 'error');
      }
      return;
   }

   // Prikaži admin informacije samo ako je kod točan
   const info = `
🔧 ADMIN INFORMACIJE

📊 Multi-bin sustav:
• Bin 1 (primary): ${JSONBIN_CONFIG.bins.primary}
• Bin 2 (backup): ${JSONBIN_CONFIG.bins.backup1}  
• Bin 3 (backup): ${JSONBIN_CONFIG.bins.backup2}
• Bin 4 (audit log): ${JSONBIN_CONFIG.bins.auditLog}

🔐 Admin kod: ${ADMIN_CONFIG.code}

📝 Funkcionalnosti:
• Brisanje postojećih unosa - zahtijeva admin kod
• Dodavanje novih unosa - potvrda "Jeste li sigurni?"
• Automatski backup u 3 bina
• Audit log svih dodavanja

⚙️ Status poredaka:
• Svi podatci uspješno učitani = sva 3 bina OK
• Podatci učitani = 1-2 bina OK  
• Neuspješno učitavanje = koristim lokalne podatke

📡 Status spremanja:
• Uspješno poslano = sva 3 bina OK
• Podatci uploadani na cloud = 2+ bina OK
   `;

   alert(info);
   showStatus('Admin informacije prikazane', 'success');
}