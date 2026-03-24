const fs = require('fs');
const { parse } = require('csv-parse');
const admin = require('firebase-admin');

// 1. Configurar Firebase
const serviceAccount = require('./serviceAccountKey.json');
const { getFirestore } = require('firebase-admin/firestore');
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const specificDb = getFirestore(firebaseApp, 'serverless');

async function uploadCsv() {
//   const filePath = './netflix_user_behavior_dataset.csv';
  const filePath = './netflix_part.csv';
  const collectionName = 'serverless';
  
  let count = 0;
  let batch = specificDb.batch();
  const parser = fs.createReadStream(filePath).pipe(
    parse({ columns: true, skip_empty_lines: true })
  );

  console.log('Iniciando subida...');

  for await (const record of parser) {
    const docRef = specificDb.collection(collectionName).doc(); // ID automático
    const data = {
      ...record,
      account_age_months: parseInt(record.account_age_months) || 0,
      age: parseInt(record.age) || 0,
      avg_watch_time_minutes: parseFloat(record.avg_watch_time_minutes) || 0,
      binge_watch_sessions: parseInt(record.binge_watch_sessions) || 0,
      churned: record.churned === 'Yes',
      completion_rate: parseFloat(record.completion_rate) || 0,
      content_interactions: parseFloat(record.content_interactions) || 0,
      days_since_last_login: parseInt(record.days_since_last_login) || 0,
      devices_used: parseInt(record.devices_used) || 0,
      monthly_fee: parseFloat(record.monthly_fee) || 0,
      rating_given: parseFloat(record.rating_given) || 0,
      recommendation_click_rate: parseFloat(record.recommendation_click_rate) || 0,
      watch_sessions_per_week: parseFloat(record.watch_sessions_per_week) || 0
    };

    batch.set(docRef, data);
    count++;

    // 2. Enviar lote cada 500 registros (límite de Firestore)
    if (count % 500 === 0) {
      await batch.commit();
      batch = specificDb.batch();
      console.log(`Subidos: ${count} registros...`);
    }
  }

  // 3. Enviar el último lote si no está vacío
  if (count % 500 !== 0) {
    await batch.commit();
  }

  console.log(`¡Éxito! Se subieron ${count} documentos en total.`);
}

uploadCsv().catch(console.error);