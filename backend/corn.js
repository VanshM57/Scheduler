import cron from 'node-cron'
import { OriginalPeriod } from './models/originalPeriod.model.js';
import { TodayPeriod } from './models/todayPeriod.model.js';



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