# Exercise Videos Update Guide

This guide explains how to add video URLs to your existing 42 exercises in the database.

## Overview

You have 42 exercises already seeded in the `fitness_exercises` table. Each exercise has a `video_url` field that needs to be populated with S3 video URLs.

## Options

### Option 1: Upload Videos via Script (Recommended)

If you have video files locally that need to be uploaded to S3.

**Steps:**

1. **Organize your videos:**
   ```
   life-os-backend/
   └── videos/
       └── exercises/
           ├── barbell-bench-press.mp4
           ├── incline-dumbbell-press.mp4
           ├── pushups.mp4
           └── ... (all 42 exercise videos)
   ```

2. **Update the mapping in `src/scripts/update-exercise-videos.ts`:**
   - Open the file
   - Update the `videoMappings` array with all 42 exercises
   - Match exercise names EXACTLY as they appear in the database

3. **Run the script:**
   ```bash
   cd /Users/user/Desktop/life-os/life-os-backend
   npx ts-node src/scripts/update-exercise-videos.ts
   ```

4. **What the script does:**
   - Reads video files from your local `videos/exercises/` folder
   - Uploads each video to Fluxez S3 storage (exercises bucket)
   - Stores videos organized by category: `exercises/{category}/{exercise_id}/{video_name}.mp4`
   - Updates the exercise record with the video URL

### Option 2: Update with Existing S3 URLs

If you've already uploaded videos to S3 manually and just need to update the database.

**Steps:**

1. **Get your S3 URLs:**
   - List all your video URLs from S3

2. **Update the mapping in `src/scripts/update-exercise-video-urls.ts`:**
   - Open the file
   - Update the `exerciseVideoUrls` array with exercise names and their S3 URLs

3. **Run the script:**
   ```bash
   cd /Users/user/Desktop/life-os/life-os-backend
   npx ts-node src/scripts/update-exercise-video-urls.ts
   ```

## Exercise List (All 42)

Here's the complete list of exercises that need videos:

### Chest (5)
- Barbell Bench Press
- Incline Dumbbell Press
- Push-ups
- Cable Chest Fly
- Dips (Chest Focused)

### Back (6)
- Deadlift
- Pull-ups
- Barbell Row
- Lat Pulldown
- T-Bar Row
- Face Pulls

### Shoulders (4)
- Overhead Press
- Dumbbell Lateral Raise
- Arnold Press
- Rear Delt Fly

### Arms (6)
- Barbell Curl
- Hammer Curl
- Close-Grip Bench Press
- Tricep Dips
- Cable Tricep Pushdown
- Preacher Curl

### Legs (7)
- Barbell Back Squat
- Romanian Deadlift
- Bulgarian Split Squat
- Leg Press
- Walking Lunges
- Leg Curl
- Calf Raises

### Core (6)
- Plank
- Russian Twists
- Hanging Leg Raises
- Cable Woodchop
- Ab Wheel Rollout
- Bicycle Crunches

### Cardio (5)
- Running
- Burpees
- Jump Rope
- Rowing Machine
- Mountain Climbers

### Full Body (4)
- Kettlebell Swing
- Thruster
- Turkish Get-Up
- Man Maker

### Flexibility (6)
- Hip Flexor Stretch
- Hamstring Stretch
- Cat-Cow Stretch
- Downward Dog
- Pigeon Pose
- Shoulder Dislocations

## Video Requirements

- **Format:** MP4 (recommended)
- **Quality:** 720p or 1080p
- **Duration:** 30-60 seconds showing proper form
- **Content:** Clear demonstration of the exercise from multiple angles
- **Size:** Keep under 50MB per video for faster loading

## Verification

After running the update script, verify the updates:

```bash
# Check if videos were added
SELECT name, category, video_url
FROM fitness_exercises
WHERE video_url IS NOT NULL;
```

## Troubleshooting

**Exercise not found in database:**
- Check that the exercise name matches EXACTLY (case-sensitive)
- Verify the category is correct

**Video upload fails:**
- Check video file exists at the specified path
- Ensure video file is not corrupted
- Check file size is reasonable (<100MB)

**Permission errors:**
- Ensure Fluxez storage bucket exists
- Verify your API keys have upload permissions

## Example Mapping Template

```typescript
const videoMappings: ExerciseVideoMapping[] = [
  // Chest
  { exerciseName: 'Barbell Bench Press', videoFileName: 'barbell-bench-press.mp4', category: 'chest' },
  { exerciseName: 'Incline Dumbbell Press', videoFileName: 'incline-dumbbell-press.mp4', category: 'chest' },
  { exerciseName: 'Push-ups', videoFileName: 'pushups.mp4', category: 'chest' },
  { exerciseName: 'Cable Chest Fly', videoFileName: 'cable-chest-fly.mp4', category: 'chest' },
  { exerciseName: 'Dips (Chest Focused)', videoFileName: 'chest-dips.mp4', category: 'chest' },

  // Back
  { exerciseName: 'Deadlift', videoFileName: 'deadlift.mp4', category: 'back' },
  { exerciseName: 'Pull-ups', videoFileName: 'pullups.mp4', category: 'back' },
  { exerciseName: 'Barbell Row', videoFileName: 'barbell-row.mp4', category: 'back' },
  { exerciseName: 'Lat Pulldown', videoFileName: 'lat-pulldown.mp4', category: 'back' },
  { exerciseName: 'T-Bar Row', videoFileName: 'tbar-row.mp4', category: 'back' },
  { exerciseName: 'Face Pulls', videoFileName: 'face-pulls.mp4', category: 'back' },

  // ... continue for all 42 exercises
];
```

## Notes

- The scripts will create the `exercises` storage bucket if it doesn't exist
- Videos are organized by category for better organization
- Each exercise gets its own folder: `exercises/{category}/{exercise_id}/`
- The script logs progress for each exercise
- Failed uploads won't stop the script - it continues with remaining exercises
