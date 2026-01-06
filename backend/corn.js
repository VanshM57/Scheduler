import cron from 'node-cron'
import { OriginalPeriod } from './models/originalPeriod.model.js';
import { TodayPeriod } from './models/todayPeriod.model.js';
import { PastPeriod } from './models/pastPeriod.model.js';

// Job to migrate todayPeriod to pastPeriod at 11:59 PM
cron.schedule('59 23 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      console.log(`[CRON] Migrating today's periods to pastPeriod at 11:59 PM...`);
  
      // 1. Fetch all periods from TodayPeriod
      const todayPeriods = await TodayPeriod.find({});
  
      if (todayPeriods.length === 0) {
        console.log(`[CRON] No periods found in TodayPeriod to migrate`);
        return;
      }
  
      // 2. Transform and insert into PastPeriod
      const pastPeriods = todayPeriods.map(p => ({
        periodName: p.periodName,
        teacherName: p.teacherName,
        teacher: p.teacher || null,
        roomNo: p.roomNo,
        sem: p.sem,
        branch: p.branch,
        batch: p.batch || "",
        startTime: p.startTime,
        endTime: p.endTime,
        isClassCancelled: p.isClassCancelled || false,
        updatedBy: p.updatedBy || "",
        date: today
      }));
  
      await PastPeriod.insertMany(pastPeriods);
  
      console.log(`[CRON] Migrated ${pastPeriods.length} periods to PastPeriod`);
  
    } catch (err) {
      console.error('[CRON] Error during pastPeriod migration:', err);
    }
  });

// Job to reset TodayPeriod and load new periods at 12:00 AM
cron.schedule('0 0 * * *', async () => {
    try {
      const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' }); // e.g., "Monday"
  
      console.log(`[CRON] Running reset for ${currentDay}...`);
  
      // 1. Delete all from TodayPeriod
      await TodayPeriod.deleteMany({});
      console.log(`[CRON] Cleared TodayPeriodModel`);
  
      // 2. Fetch today's periods from MasterPeriod (OriginalPeriodModel)
      const periodsForToday = await OriginalPeriod.find({ day: currentDay });
  
      if (periodsForToday.length === 0) {
        console.log(`[CRON] No periods found in master for ${currentDay}`);
        return;
      }
  
      // 3. Transform and insert into TodayPeriodModel
      const transformedPeriods = periodsForToday.map(p => ({
        periodName: p.periodName,
        teacher: p.teacher || null,
        teacherName: p.teacherName,
        roomNo: p.roomNo,
        sem: p.sem,
        branch: p.branch,
        batch: p.batch,
        startTime: p.startTime,
        endTime: p.endTime
      }));
  
      await TodayPeriod.insertMany(transformedPeriods);
  
      console.log(`[CRON] Inserted ${transformedPeriods.length} periods into TodayPeriodModel`);
  
    } catch (err) {
      console.error('[CRON] Error during daily period reset:', err);
    }
  });