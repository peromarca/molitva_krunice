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

// Hrvatski nazivi mjeseci
const CROATIAN_MONTHS = [
   'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
   'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
];

// Broj dana u svakom mjesecu (2025 nije prijestupna godina)
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Nazivi dana u tjednu na hrvatskom
const CROATIAN_DAYS = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];

// Trenutni mjesec i godina (početna vrijednost)
let currentMonth = 10; // studeni (0-based: siječanj=0, studeni=10)
let currentYear = 2025;

// Dinamičko generiranje datuma za trenutni mjesec
function generateDatesForMonth(year, month) {
   const dates = [];
   const daysInMonth = DAYS_IN_MONTH[month];

   for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayName = CROATIAN_DAYS[date.getDay()];

      dates.push({
         date: `${dayName} ${day}.${month + 1}.`,
         day: dayName,
         dateNum: day
      });
   }

   return dates;
}

// Generiranje nedjelja za onemogućavanje POST opcije
function generateDisabledPostDates(year, month) {
   const disabledDates = [];
   const daysInMonth = DAYS_IN_MONTH[month];

   for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() === 0) { // nedjelja je 0
         const dayName = CROATIAN_DAYS[date.getDay()];
         disabledDates.push(`${dayName} ${day}.${month + 1}.`);
      }
   }

   return disabledDates;
}

// Početni datumi i onemogućeni datumi
let dates = generateDatesForMonth(currentYear, currentMonth);
let disabledPostDates = generateDisabledPostDates(currentYear, currentMonth);

const categories = ['radosna', 'zalosna', 'slavna', 'svjetla', 'post'];
let scheduleData = {};

// ✅ Funkcija za dobijanje trenutnog datuma
function getCurrentDate() {
   return new Date();
}

// ✅ Funkcija za provjeru da li je datum prošao
function isPastDate(dateNum) {
   const today = new Date();
   const targetDate = new Date(currentYear, currentMonth, dateNum);

   // Postaviti vrijeme na početak dana za preciznu usporedbu
   today.setHours(0, 0, 0, 0);
   targetDate.setHours(0, 0, 0, 0);

   return targetDate < today;
}

// ✅ Funkcija za provjeru da li je danas
function isToday(dateNum) {
   const today = new Date();
   const targetDate = new Date(currentYear, currentMonth, dateNum);

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

// Funkcija za kombinovanje podataka iz više binova sa fallback logikom
function combineDataWithFallback(allBinData) {
   console.log('Kombinujem podatke iz binova sa fallback logikom...');

   // Inicijalizuj prazan objekat za konačne podatke
   const combinedData = {};

   // Za svaki datum
   dates.forEach(dateObj => {
      const dateKey = dateObj.date;
      combinedData[dateKey] = {};

      // Za svaku kategoriju
      categories.forEach(category => {
         let foundValue = '';

         // Pretraži binove po redosledu prioriteta (bin 1, bin 2, bin 3)
         for (let i = 0; i < allBinData.length; i++) {
            const binData = allBinData[i];

            // Proveri da li bin ima podatke i da li sadrži ovaj datum i kategoriju
            if (binData &&
               binData[dateKey] &&
               binData[dateKey][category] &&
               binData[dateKey][category].trim() !== '') {

               foundValue = binData[dateKey][category];
               console.log(`${dateKey} - ${category}: uzeto iz bin ${i + 1} (${foundValue})`);
               break; // Prekini pretragu kada nađeš vrednost
            }
         }

         combinedData[dateKey][category] = foundValue;
      });
   });

   return combinedData;
}

// Multi-bin učitavanje podataka sa fallback logikom
async function loadData() {
   try {
      console.log('Pokušavam učitati podatke s multi-bin sustava...');

      const binIds = [
         JSONBIN_CONFIG.bins.primary,
         JSONBIN_CONFIG.bins.backup1,
         JSONBIN_CONFIG.bins.backup2
      ];

      let successfulBins = 0;
      let allBinData = [];

      // Pokušaj učitati iz svih binova
      for (let i = 0; i < binIds.length; i++) {
         const data = await loadFromBin(binIds[i]);
         if (data && Object.keys(data).length > 0) {
            successfulBins++;
            allBinData.push(data);
            console.log(`Uspešno učitano iz bin ${i + 1}`);
         } else {
            allBinData.push(null);
            console.log(`Neuspešno učitavanje iz bin ${i + 1}`);
         }
      }

      // Kombinuj podatke sa fallback logikom
      if (successfulBins > 0) {
         scheduleData = combineDataWithFallback(allBinData);

         if (successfulBins === 3) {
            showStatus('Svi podatci uspješno učitani', 'success');
         } else {
            showStatus(`Podatci učitani iz ${successfulBins}/3 binova`, 'warning');
         }
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

// Repair funkcija za sinhronizaciju binova
async function repairBins() {
   // Admin provjera
   const adminCode = prompt('Za repair funkciju trebate admin kod:', '');
   if (adminCode !== ADMIN_CONFIG.code) {
      showStatus('Neispravka admin kod', 'error');
      return;
   }

   try {
      showStatus('Počinje repair funkcija...', 'info');
      console.log('=== REPAIR BINOVA - POČETAK ===');

      const binIds = [
         JSONBIN_CONFIG.bins.primary,
         JSONBIN_CONFIG.bins.backup1,
         JSONBIN_CONFIG.bins.backup2
      ];

      // 1. Učitaj podatke iz svih binova
      console.log('Učitavanje podataka iz svih binova...');
      let allBinData = [];
      let loadedBins = 0;

      for (let i = 0; i < binIds.length; i++) {
         const data = await loadFromBin(binIds[i]);
         if (data && Object.keys(data).length > 0) {
            allBinData.push(data);
            loadedBins++;
            console.log(`✓ Bin ${i + 1}: učitano ${Object.keys(data).length} datuma`);
         } else {
            allBinData.push({});
            console.log(`✗ Bin ${i + 1}: prazan ili neuspešno učitano`);
         }
      }

      if (loadedBins === 0) {
         showStatus('Nema podataka za repair', 'error');
         return;
      }

      // 2. Kreiraj kompletne podatke za svaki bin koristeći fallback logiku
      console.log('Kreiranje kompletnih podataka za svaki bin...');
      let repairedBins = [];
      let totalRepairs = 0;

      for (let binIndex = 0; binIndex < binIds.length; binIndex++) {
         let repairedData = {};
         let repairsForThisBin = 0;

         // Za svaki datum
         dates.forEach(dateObj => {
            const dateKey = dateObj.date;
            repairedData[dateKey] = {};

            // Za svaku kategoriju
            categories.forEach(category => {
               let foundValue = '';
               let sourceDescription = '';

               // Prvo provjeri da li trenutni bin već ima podatak
               if (allBinData[binIndex] &&
                  allBinData[binIndex][dateKey] &&
                  allBinData[binIndex][dateKey][category] &&
                  allBinData[binIndex][dateKey][category].trim() !== '') {

                  foundValue = allBinData[binIndex][dateKey][category];
                  sourceDescription = `već ima`;
               } else {
                  // Traži podatak u drugim binovima
                  for (let sourceIndex = 0; sourceIndex < allBinData.length; sourceIndex++) {
                     if (sourceIndex === binIndex) continue; // Preskoči sam sebe

                     const sourceBinData = allBinData[sourceIndex];
                     if (sourceBinData &&
                        sourceBinData[dateKey] &&
                        sourceBinData[dateKey][category] &&
                        sourceBinData[dateKey][category].trim() !== '') {

                        foundValue = sourceBinData[dateKey][category];
                        sourceDescription = `dopunjeno iz bin ${sourceIndex + 1}`;
                        repairsForThisBin++;
                        totalRepairs++;
                        console.log(`  ↗ Bin ${binIndex + 1}: ${dateKey} - ${category} = "${foundValue}" (${sourceDescription})`);
                        break;
                     }
                  }
               }

               repairedData[dateKey][category] = foundValue;
            });
         });

         repairedBins.push(repairedData);
         console.log(`✓ Bin ${binIndex + 1}: ${repairsForThisBin} polja dopunjeno`);
      }

      // 3. Spremi popravljene podatke u sve binove
      console.log('Spremanje popravljenih podataka...');
      let savedBins = 0;

      for (let i = 0; i < binIds.length; i++) {
         const success = await saveToBin(binIds[i], repairedBins[i]);
         if (success) {
            savedBins++;
            console.log(`✓ Bin ${i + 1}: uspešno spremljeno`);
         } else {
            console.log(`✗ Bin ${i + 1}: greška pri spremanju`);
         }
      }

      // 4. Prikaži rezultate
      if (savedBins === binIds.length) {
         showStatus(`Repair uspješan: ${totalRepairs} polja popunjeno u ${savedBins} binova`, 'success');
      } else if (savedBins > 0) {
         showStatus(`Repair djelomičan: ${totalRepairs} polja popunjeno, ${savedBins}/${binIds.length} binova spremljeno`, 'warning');
      } else {
         showStatus('Repair neuspješan: greška pri spremanju', 'error');
      }

      console.log('=== REPAIR BINOVA - KRAJ ===');
      console.log(`Ukupno: ${totalRepairs} polja dopunjeno u ${savedBins}/${binIds.length} binova`);

      // 5. Učitaj podatke ponovno da prikažeš ažurirane podatke
      if (savedBins > 0) {
         await loadData();
      }

   } catch (error) {
      console.error('Greška pri repair funkciji:', error);
      showStatus('Greška pri repair funkciji', 'error');
   }
}

// Funkcija za prebacivanje podataka u sigurnosni bin
async function backupDataToAuditBin(data) {
   try {
      const timestamp = new Date().toISOString().replace('T', '_').substring(0, 16);
      const backupEntry = {
         [`backup_${CROATIAN_MONTHS[currentMonth]}_${currentYear}_${timestamp}`]: data
      };

      // Učitaj postojeći audit log
      const existingLog = await loadFromBin(JSONBIN_CONFIG.bins.auditLog) || {};

      // Dodaj backup podatke
      const updatedLog = { ...existingLog, ...backupEntry };

      // Spremi nazad u audit bin
      const success = await saveToBin(JSONBIN_CONFIG.bins.auditLog, updatedLog);
      if (success) {
         console.log(`✓ Backup podataka za ${CROATIAN_MONTHS[currentMonth]} ${currentYear} uspješno spremljen u audit bin`);
         return true;
      } else {
         console.log('✗ Greška pri spremanju backup-a u audit bin');
         return false;
      }
   } catch (error) {
      console.log('Greška pri backup-u podataka:', error);
      return false;
   }
}

// Funkcija za ažuriranje mjeseca i godine
function updateMonthAndYear() {
   const today = new Date();
   const newMonth = today.getMonth();
   const newYear = today.getFullYear();

   if (newMonth !== currentMonth || newYear !== currentYear) {
      currentMonth = newMonth;
      currentYear = newYear;

      // Regeneriraj datume za novi mjesec
      dates = generateDatesForMonth(currentYear, currentMonth);
      disabledPostDates = generateDisabledPostDates(currentYear, currentMonth);

      // Ažuriraj naslov na stranici
      updatePageTitle();

      console.log(`✓ Ažurirano na ${CROATIAN_MONTHS[currentMonth]} ${currentYear}`);
   }
}

// Funkcija za ažuriranje naslova na stranici
function updatePageTitle() {
   const titleElement = document.querySelector('.header-text p');
   if (titleElement) {
      titleElement.textContent = `${CROATIAN_MONTHS[currentMonth]} ${currentYear} - Kliknite na polje za unos/brisanje`;
   }
}

// Glavna funkcija za automatsko ažuriranje mjeseca (SAMO ADMIN)
async function updateMonth() {
   try {
      const today = new Date();
      const currentDate = today.getDate();
      const currentMonthActual = today.getMonth();
      const currentYearActual = today.getFullYear();

      // Provjeri da li je 1. u mjesecu
      if (currentDate !== 1) {
         return false; // Nije 1. u mjesecu
      }

      // ✅ ADMIN PROVJERA - samo admin može ažurirati mjesec
      const adminCode = prompt(
         `PRVI DAN MJESECA DETEKTIRAN!\n\n${CROATIAN_MONTHS[currentMonthActual]} ${currentYearActual}\n\nZa ažuriranje mjeseca trebate admin kod:`,
         ''
      );

      if (adminCode !== ADMIN_CONFIG.code) {
         console.log('Ažuriranje mjeseca preskočeno - nema admin koda');
         return false; // Nije admin
      }

      // Provjeri da li je već napravljeno ažuriranje za ovaj mjesec (u audit bin-u)
      console.log('Provjeravam da li je mjesec već ažuriran...');
      const auditData = await loadFromBin(JSONBIN_CONFIG.bins.auditLog) || {};
      const updateCheckKey = `monthUpdate_${currentYearActual}_${currentMonthActual}`;

      if (auditData[updateCheckKey] === 'completed') {
         console.log('Ažuriranje mjeseca već je izvršeno za ovaj mjesec (provjera iz audit bin-a)');
         showStatus('Mjesec je već ažuriran', 'info');
         return false; // Već je ažurirano
      }

      console.log('=== AUTOMATSKO AŽURIRANJE MJESECA - POČETAK ===');
      showStatus('Ažuriram na novi mjesec...', 'info');

      // 1. Učitaj postojeće podatke iz glavnih binova
      console.log('Učitavam postojeće podatke za backup...');
      const currentData = await loadFromBin(JSONBIN_CONFIG.bins.primary) || {};

      // 2. Spremi postojeće podatke u sigurnosni bin
      if (Object.keys(currentData).length > 0) {
         console.log('Prebacujem postojeće podatke u sigurnosni bin...');
         const backupSuccess = await backupDataToAuditBin(currentData);
         if (backupSuccess) {
            console.log('✓ Backup uspješan');
         } else {
            console.log('✗ Backup neuspješan, ali nastavlja s ažuriranjem');
         }
      }

      // 3. Ažuriraj mjesec i godinu
      updateMonthAndYear();

      // 4. Kreiraj prazne podatke za novi mjesec
      console.log('Kreiram prazne podatke za novi mjesec...');
      initializeData();

      // 5. Spremi prazne podatke u sve glavne binove
      console.log('Spremam prazne podatke u glavne binove...');
      const binIds = [
         JSONBIN_CONFIG.bins.primary,
         JSONBIN_CONFIG.bins.backup1,
         JSONBIN_CONFIG.bins.backup2
      ];

      let savedBins = 0;
      for (let i = 0; i < binIds.length; i++) {
         const success = await saveToBin(binIds[i], scheduleData);
         if (success) {
            savedBins++;
            console.log(`✓ Bin ${i + 1}: novi mjesec uspješno spremljen`);
         } else {
            console.log(`✗ Bin ${i + 1}: greška pri spremanju`);
         }
      }

      // 6. Označi da je ažuriranje završeno za ovaj mjesec (u audit bin)
      console.log('Označavam da je ažuriranje završeno...');
      const updatedAuditData = await loadFromBin(JSONBIN_CONFIG.bins.auditLog) || {};
      updatedAuditData[updateCheckKey] = 'completed';
      await saveToBin(JSONBIN_CONFIG.bins.auditLog, updatedAuditData);

      // 7. Također spremi u localStorage kao backup
      localStorage.setItem(`lastMonthUpdate_${currentYearActual}_${currentMonthActual}`, 'done');

      // 8. Očisti stare oznake (zadržaj samo zadnje 3 mjeseca)
      cleanupOldUpdateFlags();

      // 9. Prikaži rezultate
      if (savedBins === binIds.length) {
         showStatus(`Uspješno ažurirano na ${CROATIAN_MONTHS[currentMonth]} ${currentYear}`, 'success');
      } else if (savedBins > 0) {
         showStatus(`Djelomično ažurirano na ${CROATIAN_MONTHS[currentMonth]} ${currentYear} (${savedBins}/${binIds.length} binova)`, 'warning');
      } else {
         showStatus('Greška pri ažuriranju mjeseca', 'error');
      }

      console.log('=== AUTOMATSKO AŽURIRANJE MJESECA - KRAJ ===');
      console.log(`Ažurirano na ${CROATIAN_MONTHS[currentMonth]} ${currentYear}, spremljeno u ${savedBins}/${binIds.length} binova`);

      // 10. Ponovno učitaj tablicu
      renderTable();

      return true;

   } catch (error) {
      console.error('Greška pri ažuriranju mjeseca:', error);
      showStatus('Greška pri ažuriranju mjeseca', 'error');
      return false;
   }
}

// Ručna admin funkcija za ažuriranje mjeseca
async function manualUpdateMonth() {
   // Admin provjera
   const adminCode = prompt('Za ručno ažuriranje mjeseca trebate admin kod:', '');
   if (adminCode !== ADMIN_CONFIG.code) {
      showStatus('Neispravan admin kod', 'error');
      return;
   }

   const today = new Date();
   const currentDate = today.getDate();
   const currentMonthActual = today.getMonth();
   const currentYearActual = today.getFullYear();

   // ✅ PROVJERA - samo prvi u mjesecu
   if (currentDate !== 1) {
      showStatus(`Ažuriranje mjeseca je moguće samo 1. u mjesecu! (Danas je ${currentDate}.)`, 'error');
      alert(`SIGURNOSNA ZAŠTITA!\n\nAžuriranje mjeseca je dozvoljeno samo 1. u mjesecu.\nDanas je ${currentDate}. ${CROATIAN_MONTHS[currentMonthActual]} ${currentYearActual}.\n\nOva zaštita sprječava slučajno brisanje podataka.`);
      return;
   }

   const confirmation = confirm(
      `RUČNO AŽURIRANJE MJESECA - 1. ${CROATIAN_MONTHS[currentMonthActual]} ${currentYearActual}\n\n` +
      `Ova akcija će:\n\n` +
      `• Prebaciti sve postojeće podatke u sigurnosni bin\n` +
      `• Obrisati trenutnu tablicu\n` +
      `• Kreirati praznu tablicu za ${CROATIAN_MONTHS[currentMonthActual]} ${currentYearActual}\n\n` +
      `Da li ste sigurni da želite nastaviti?`
   );

   if (!confirmation) {
      return;
   }

   try {
      console.log('=== RUČNO AŽURIRANJE MJESECA - POČETAK ===');
      showStatus('Ručno ažuriram mjesec...', 'info');

      // Resetiraj provjeru da omogućiš ažuriranje
      const updateCheckKey = `monthUpdate_${currentYearActual}_${currentMonthActual}`;
      const auditData = await loadFromBin(JSONBIN_CONFIG.bins.auditLog) || {};
      delete auditData[updateCheckKey]; // Ukloni oznaku
      await saveToBin(JSONBIN_CONFIG.bins.auditLog, auditData);

      // Prisilno pozovi updateMonth (bez prompta za admin kod)
      const originalPrompt = window.prompt;
      window.prompt = () => ADMIN_CONFIG.code; // Preskoči admin prompt

      const result = await updateMonth();

      window.prompt = originalPrompt; // Vrati originalni prompt

      if (result) {
         showStatus('Ručno ažuriranje uspješno završeno', 'success');
      } else {
         showStatus('Greška pri ručnom ažuriranju', 'error');
      }
   } catch (error) {
      console.error('Greška pri ručnom ažuriranju:', error);
      showStatus('Greška pri ručnom ažuriranju', 'error');
   }
}

// Funkcija za brisanje starih oznaka ažuriranja
function cleanupOldUpdateFlags() {
   try {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Ukloni oznake starije od 3 mjeseca
      for (let i = 0; i < localStorage.length; i++) {
         const key = localStorage.key(i);
         if (key && key.startsWith('lastMonthUpdate_')) {
            const parts = key.split('_');
            if (parts.length === 3) {
               const year = parseInt(parts[1]);
               const month = parseInt(parts[2]);

               // Izračunaj razliku u mjesecima
               const monthsDiff = (currentYear - year) * 12 + (currentMonth - month);

               if (monthsDiff > 3) {
                  localStorage.removeItem(key);
                  console.log(`Uklonjena stara oznaka: ${key}`);
               }
            }
         }
      }
   } catch (error) {
      console.log('Greška pri čišćenju starih oznaka:', error);
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
document.addEventListener('DOMContentLoaded', async () => {
   // Ažuriraj naslov stranice prema trenutnom mjesecu
   updatePageTitle();

   // Provjeri da li treba automatski ažurirati mjesec
   console.log('Pokretanje aplikacije - provjera ažuriranja mjeseca...');

   const monthUpdated = await updateMonth();

   if (monthUpdated) {
      console.log('Mjesec je ažuriran, podaci su ponovno učitani');
      // Podatci su već učitani u updateMonth() funkciji, samo treba renderirati tablicu
      renderTable();
      document.getElementById('loading').style.display = 'none';
      document.getElementById('schedule-table').style.display = 'table';
   } else {
      console.log('Mjesec nije ažuriran, učitavam postojeće podatke');
      loadData();
   }
});// Admin funkcionalnost
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

🔄 Automatsko ažuriranje:
• Svaki 1. u mjesecu aplikacija automatski:
  - Traži admin kod za ažuriranje
  - Prebacuje postojeće podatke u sigurnosni bin
  - Kreira praznu tablicu za novi mjesec
  - Ažurira broj dana i naslov
• Provjera ažuriranja se sprema u audit bin

🛠️ Admin funkcije:
• manualUpdateMonth() - ručno ažuriranje mjeseca (SAMO 1. u mjesecu!)
• repairBins() - sinhronizacija binova

🔒 Sigurnosne mjere:
• Automatsko ažuriranje - samo 1. u mjesecu + admin kod
• Ručno ažuriranje - samo 1. u mjesecu + admin kod
• Sprječava slučajno brisanje podataka bilo koji drugi dan

🗑️ Sigurnosni backup:
• Bin ID: ${JSONBIN_CONFIG.bins.auditLog}
• Automatski backup postojećih podataka prije brisanja
   `;

   alert(info);
   showStatus('Admin informacije prikazane', 'success');
}