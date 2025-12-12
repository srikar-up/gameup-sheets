🎮 GameUp Sheets (STONKS Life OS)
GameUp Sheets is a fully gamified personal productivity dashboard (Life OS) built entirely within Google Sheets and Google Apps Script. It turns your life into an RPG where completing tasks, tracking habits, and managing events earns you XP, levels you up, and unlocks rewards.

It features a modern, dark-mode web interface (index.html) that interacts with a Google Sheet backend (code.gs) to store your data.

✨ Features
⚔️ Quest System (Task Tracker)
Turn your to-do list into Quests with specific ranks and rewards.

Ranks & XP:

🥇 Gold: High priority (+150 XP)

🥈 Silver: Medium priority (+100 XP)

🥉 Bronze: Low priority (+50 XP)

🛡️ Steel: Trivial tasks (+20 XP)

Quest Types:

Repeating: Resets daily (great for morning routines).

Daily/Monthly: Standard deadlines.

Reminder: Simple alerts.

Rewards: Assign real-life rewards (e.g., "Ice Cream") to tasks, which appear upon completion.

Progress Bars: Tasks can have multi-step targets (e.g., "Read 10 pages" -> 0/10).

📈 "Work" Counters
A dedicated section for grinding repetitions or counts without deadlines.

Perfect for tracking pushups, DSA problems solved, or pages read.

+10 XP for every increment/click.

Optimistic UI updates with confetti effects.

📝 Notes & Memory
A sticky-note interface for quick thoughts.

Permanent Notes: Standard notes that stay until deleted.

Temporary Notes: Auto-expiring notes (you set the duration in days). The system automatically hides them after they expire.

📊 Dashboard & Stats
Visualize your progress with Chart.js integrations.

Leveling System: visual XP bar and current Level display.

Charts: XP Trend (Yearly), Quest Priority breakdown, and Status completion rates.

Highlights: Displays your "Best Month," "Total XP," and "Success Rate."

⏰ Utilities
Focus Timer: Built-in stopwatch to track deep work sessions.

IST Clock: Live digital clock (set to Indian Standard Time by default).

Event Alerts: Birthday and event countdowns that appear at the top of the dashboard when the date is near (0-10 days out).

🛠️ Installation & Setup
Since this runs on Google Apps Script, you don't need a server. You just need a Google Account.

Step 1: Create the Sheet
Go to Google Sheets and create a new, blank spreadsheet.

Name it GameUp Database (or whatever you prefer).

Optional: You do not need to create the tabs/columns manually. The script contains a "self-healing" feature that will automatically generate the required sheets (Tracker, Events, Notes, Counters, History) when you first run it.

Step 2: Open Script Editor
In your Google Sheet, go to Extensions > Apps Script.

This will open a new tab with the code editor.

Step 3: Add the Code
Backend:

Rename the default Code.gs file to code.gs.

Copy the entire content of the provided code.gs file and paste it into the editor.

Frontend:

Click the (+) plus icon next to "Files" and select HTML.

Name the file index. (This will create index.html).

Copy the entire content of the provided index.html file and paste it into the editor.

Step 4: Deploy
Click the blue Deploy button > New deployment.

Click the "Select type" gear icon ⚙️ and choose Web app.

Fill in the details:

Description: GameUp v1

Execute as: Me (your email)

Who has access: Anyone (or Only myself if you don't plan to share the link).

Click Deploy.

Authorize: Google will ask for permission to access your spreadsheets. Click "Review permissions," choose your account, click "Advanced," and "Go to (Project Name) (unsafe)" (it is safe, it's your own code).

Copy the Web App URL. This is the link to your new dashboard!

Step 5: Setup Automation (Important!)
To make "Repeating" quests reset automatically every day:

In the Apps Script editor, look at the left sidebar and click on Triggers (the alarm clock icon).

Click + Add Trigger.

Configure:

Choose which function to run: resetRepeatingQuests

Select event source: Time-driven

Select type of time based trigger: Day timer

Select time of day: Midnight to 1am (or your preferred reset time).

Click Save.

🚀 Usage Guide
The Interface
Toggle Views: Use the pill-shaped buttons at the top (Quests, Work, Notes, Stats) to switch screens.

Floating Action Button (+): The big Gold button in the bottom right is your main tool. Click it to add a new Quest, Counter, Note, or Event.

Managing Quests
Adding: Click + -> Quest. Set the target count (default is 1).

Completing: Click the + button on the quest card. When the progress bar hits 100%, the card turns green, confetti pops, and the XP is logged to your history.

Repeating Quests: If you set a quest type to "Repeating", the system will reset its progress to 0 every night (if you set up the trigger in Step 5), allowing you to do it again the next day.

Data Management
All data is stored in the Google Sheet. You can open the sheet to manually edit data if you make a mistake (e.g., if you accidentally added 100 reps to a counter).

History Tab: This sheet acts as a log. Do not delete rows here if you want your "Total XP" and charts to remain accurate.

💻 Technologies Used
Google Apps Script: Backend logic and database connectivity.

Google Sheets: The database.

HTML5/CSS3: Frontend UI (Dark Mode).

Chart.js: For data visualization.

Canvas Confetti: For the victory effects.

Google Fonts: Inter & JetBrains Mono.

📄 License
This project is licensed under the MIT License. Copyright (c) 2025 srikar-up.

Built with ❤️ by srikar-up
