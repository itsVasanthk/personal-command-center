import { documentDirectory, writeAsStringAsync, readAsStringAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { SQLiteBindValue } from 'expo-sqlite';
import * as db from '../database';

export const exportData = async () => {
  try {
    const database = db.getDb();
    
    const records = database.getAllSync('SELECT * FROM daily_records');
    const allTasks = database.getAllSync('SELECT * FROM tasks');
    const goals = database.getAllSync('SELECT * FROM goals');
    const settings = database.getAllSync('SELECT * FROM settings');

    const backupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      daily_records: records,
      tasks: allTasks,
      goals: goals,
      settings: settings
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    
    const fileUri = `${documentDirectory}PCC_Backup_${new Date().toISOString().split('T')[0]}.json`;
    await writeAsStringAsync(fileUri, jsonString);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
    }
  } catch (error) {
    Alert.alert('Export Failed', String(error));
  }
};

export const importData = async (reloadApp: () => void) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const fileUri = result.assets[0].uri;
    const fileContents = await readAsStringAsync(fileUri);
    const parsedData = JSON.parse(fileContents);

    if (!parsedData.daily_records || !parsedData.tasks || !parsedData.goals || !parsedData.settings) {
      Alert.alert('Invalid File', 'The selected JSON file does not have the required structure.');
      return;
    }

    Alert.alert(
      'Confirm Import',
      'This will import data from the backup file. Duplicate dates/records will be overwritten. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          style: 'destructive',
          onPress: () => processImport(parsedData, reloadApp) 
        }
      ]
    );

  } catch (error) {
    Alert.alert('Import Failed', String(error));
  }
};

const processImport = (parsedData: any, reloadApp: () => void) => {
  const database = db.getDb();
  
  try {
    database.execSync('BEGIN TRANSACTION;');

    parsedData.daily_records.forEach((r: any) => {
      const keys = Object.keys(r);
      const placeholders = keys.map(() => '?').join(',');
      const values = Object.values(r) as SQLiteBindValue[];
      database.runSync(`INSERT OR REPLACE INTO daily_records (${keys.join(',')}) VALUES (${placeholders})`, values);
    });

    parsedData.tasks.forEach((t: any) => {
      const keys = Object.keys(t);
      const placeholders = keys.map(() => '?').join(',');
      const values = Object.values(t) as SQLiteBindValue[];
      database.runSync(`INSERT OR REPLACE INTO tasks (${keys.join(',')}) VALUES (${placeholders})`, values);
    });

    parsedData.goals.forEach((g: any) => {
      const keys = Object.keys(g);
      const placeholders = keys.map(() => '?').join(',');
      const values = Object.values(g) as SQLiteBindValue[];
      database.runSync(`INSERT OR REPLACE INTO goals (${keys.join(',')}) VALUES (${placeholders})`, values);
    });

    parsedData.settings.forEach((s: any) => {
      const keys = Object.keys(s);
      const placeholders = keys.map(() => '?').join(',');
      const values = Object.values(s) as SQLiteBindValue[];
      database.runSync(`INSERT OR REPLACE INTO settings (${keys.join(',')}) VALUES (${placeholders})`, values);
    });

    database.execSync('COMMIT;');
    Alert.alert('Success', 'Data imported successfully!');
    reloadApp();
  } catch (error) {
    database.execSync('ROLLBACK;');
    Alert.alert('Import Error', 'Database rollback executed. ' + String(error));
  }
};

export const deleteAllData = (reloadApp: () => void) => {
  Alert.alert(
    'WARNING: DELETE ALL DATA',
    'Are you completely sure? This will wipe ALL your history, goals, and tasks permanently. This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'WIPE EVERYTHING', 
        style: 'destructive',
        onPress: () => {
          const database = db.getDb();
          database.execSync(`
            DELETE FROM daily_records;
            DELETE FROM tasks;
            DELETE FROM goals;
            DELETE FROM settings;
          `);
          Alert.alert('Data Wiped', 'App data has been reset.');
          reloadApp();
        }
      }
    ]
  );
};
