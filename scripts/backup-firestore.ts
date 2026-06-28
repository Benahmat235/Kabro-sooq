import { runFirestoreBackup } from '../src/utils/backupService';

async function main() {
  console.log("=== EXÉCUTION DU SCRIPT DE SAUVEGARDE FIRESTORE ===");
  try {
    const result = await runFirestoreBackup("CLI_Script");
    console.log("=================================================");
    console.log(`Sauvegarde réussie !`);
    console.log(`Fichier: ${result.filename}`);
    console.log(`Taille: ${result.sizeKb} KB`);
    console.log(`Heure: ${result.timestamp}`);
    console.log("=================================================");
    process.exit(0);
  } catch (error) {
    console.error("=================================================");
    console.error("Échec du script de sauvegarde :", error);
    console.error("=================================================");
    process.exit(1);
  }
}

main();
