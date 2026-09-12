
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --------------------------------------------------
// CHECK GEMINI API KEY
// --------------------------------------------------

const apiKey = process.env.GEMINI_API_KEY;

console.log(
  "Gemini API key loaded:",
  !!apiKey
);

console.log(
  "Gemini API key length:",
  apiKey ? apiKey.length : 0
);

const genAI = apiKey
  ? new GoogleGenerativeAI(apiKey)
  : null;


// --------------------------------------------------
// FALLBACK ANALYSIS
// --------------------------------------------------

const fallbackAnalysis = (task) => {
  let risk = "Low Risk";

  if (
    task.isOverdue ||
    task.isDueToday ||
    (task.priority || "").toLowerCase() === "high"
  ) {
    risk = "High Risk";
  } else if (
    task.pendingDays > 2 ||
    task.progress < 50
  ) {
    risk = "Medium Risk";
  }


  // --------------------------------------------------
  // DEADLINE STATUS
  // --------------------------------------------------

  let deadlineMessage = "The task has no immediate deadline";

  if (task.isOverdue) {
    deadlineMessage = `The task is overdue by ${
      task.overdueDays
    } day${
      task.overdueDays === 1 ? "" : "s"
    }`;
  } else if (task.isDueToday) {
    deadlineMessage = "The task is due today";
  } else if (task.daysUntilDue === 1) {
    deadlineMessage = "The task is due tomorrow";
  } else if (
    task.daysUntilDue !== null &&
    task.daysUntilDue > 1
  ) {
    deadlineMessage = `The task is due in ${
      task.daysUntilDue
    } days`;
  }


  // --------------------------------------------------
  // DYNAMIC RECOVERY PLAN
  // --------------------------------------------------

  let recoveryPlan;

  if (task.isOverdue) {
    recoveryPlan = [
      {
        day: "Day 1",
        label: "Recover overdue work",
      },
      {
        day: "Day 2",
        label: "Complete remaining work",
      },
      {
        day: "Day 3",
        label: "Review and close",
      },
    ];
  } else if (task.isDueToday) {
    recoveryPlan = [
      {
        day: "Day 1",
        label: "Finish urgent work",
      },
      {
        day: "Day 2",
        label: "Review and follow up",
      },
      {
        day: "Day 3",
        label: "Close remaining items",
      },
    ];
  } else if (task.daysUntilDue === 1) {
    recoveryPlan = [
      {
        day: "Day 1",
        label: "Complete main work",
      },
      {
        day: "Day 2",
        label: "Final review",
      },
      {
        day: "Day 3",
        label: "Follow up and close",
      },
    ];
  } else if (
    task.daysUntilDue !== null &&
    task.daysUntilDue > 1
  ) {
    recoveryPlan = [
      {
        day: "Day 1",
        label: "Plan and prioritize",
      },
      {
        day: "Day 2",
        label: "Execute core work",
      },
      {
        day: "Day 3",
        label: "Review progress",
      },
    ];
  } else {
    recoveryPlan = [
      {
        day: "Day 1",
        label: "Plan the task",
      },
      {
        day: "Day 2",
        label: "Complete core work",
      },
      {
        day: "Day 3",
        label: "Review and finish",
      },
    ];
  }


  // --------------------------------------------------
  // FALLBACK RESPONSE
  // --------------------------------------------------

  return {
    risk,

    suggestions: [
      task.isOverdue
        ? "Work on this task immediately because it is overdue"
        : task.isDueToday
        ? "Prioritize this task today because the deadline is today"
        : task.daysUntilDue === 1
        ? "Prepare to complete this task because the deadline is tomorrow"
        : "Schedule a focused work session for this task",

      task.progress < 50
        ? `Increase task progress from ${
            task.progress || 0
          }% before focusing on other work`
        : "Continue making steady progress toward completion",

      task.description
        ? "Break the task description into smaller actionable steps"
        : "Add clear subtasks to make the work easier to manage",

      task.isOverdue
        ? "Review the deadline and create a realistic recovery schedule"
        : task.isDueToday
        ? "Complete the most important remaining work before the end of today"
        : "Review the task requirements before starting",
    ],

    recoveryPlan,

    estCompletion:
      risk === "High Risk"
        ? "3 Days"
        : risk === "Medium Risk"
        ? "2 Days"
        : "1 Day",

    reason:
      task.isOverdue
        ? `${deadlineMessage} and needs immediate attention`
        : task.isDueToday
        ? `${deadlineMessage} and still has unfinished work`
        : task.daysUntilDue === 1
        ? `${deadlineMessage} and needs preparation`
        : task.progress < 50
        ? `The task is only ${
            task.progress || 0
          }% complete`
        : task.pendingDays > 2
        ? "The task has been pending for several days"
        : deadlineMessage,
  };
};


// --------------------------------------------------
// GENERATE TASKPILOT AI ANALYSIS
// --------------------------------------------------

const generateTaskPilotAnalysis = async (task) => {
  try {

    // --------------------------------------------------
    // CHECK API KEY
    // --------------------------------------------------

    if (!apiKey) {
      console.error(
        "TaskPilot: GEMINI_API_KEY is missing from .env"
      );

      return fallbackAnalysis(task);
    }


    // --------------------------------------------------
    // GEMINI MODEL
    // --------------------------------------------------

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });


    // --------------------------------------------------
    // DETERMINE DEADLINE STATUS
    // --------------------------------------------------

    let deadlineStatus = "No due date";

    if (task.isOverdue) {
      deadlineStatus = `Overdue by ${
        task.overdueDays
      } day${
        task.overdueDays === 1 ? "" : "s"
      }`;
    } else if (task.isDueToday) {
      deadlineStatus = "Due Today";
    } else if (task.daysUntilDue === 1) {
      deadlineStatus = "Due Tomorrow";
    } else if (
      task.daysUntilDue !== null &&
      task.daysUntilDue > 1
    ) {
      deadlineStatus = `Due in ${
        task.daysUntilDue
      } days`;
    }


    // --------------------------------------------------
    // PROMPT
    // --------------------------------------------------

    const prompt = `
You are TaskPilot AI, an intelligent task management assistant.

Analyze the user's task and provide practical,
task-specific recommendations.

Do not give generic advice.

--------------------------------------------------
TASK INFORMATION
--------------------------------------------------

Title:
${task.title}

Description:
${task.description || "No description"}

Status:
${task.status}

Priority:
${task.priority}

Category:
${task.category || "General"}

Due Date:
${task.dueDate || "Not set"}

Deadline Status:
${deadlineStatus}

Progress:
${task.progress || 0}%

Pending Days:
${task.pendingDays}

Overdue Days:
${task.overdueDays}

Days Until Due:
${
  task.daysUntilDue !== null &&
  task.daysUntilDue !== undefined
    ? task.daysUntilDue
    : "No due date"
}

Is Overdue:
${task.isOverdue}

Is Due Today:
${task.isDueToday}

Task Priority Score:
${task.score}

Number of Participants:
${task.participants?.length || 0}


--------------------------------------------------
DEADLINE INTERPRETATION
--------------------------------------------------

If Is Overdue is true:
The task is overdue.
Clearly mention that it is overdue.

If Is Due Today is true:
The task is due today.
Do NOT call it overdue.
Clearly mention that the deadline is today.

If Days Until Due is 1:
The task is due tomorrow.

If Days Until Due is greater than 1:
The task is upcoming.


--------------------------------------------------
DYNAMIC RECOVERY PLAN
--------------------------------------------------

The recovery plan MUST depend on the deadline.

If the task is OVERDUE:

Day 1:
Recover the overdue work.

Day 2:
Complete the remaining work.

Day 3:
Review and close the task.


If the task is DUE TODAY:

Day 1:
Finish the most urgent remaining work today.

Day 2:
Review and follow up.

Day 3:
Close any remaining items.


If the task is DUE TOMORROW:

Day 1:
Complete the main work.

Day 2:
Perform the final review.

Day 3:
Follow up and close.


If the task is UPCOMING:

Day 1:
Plan and prioritize.

Day 2:
Execute the core work.

Day 3:
Review progress.


If there is NO DEADLINE:

Day 1:
Plan the task.

Day 2:
Complete the core work.

Day 3:
Review and finish.

IMPORTANT:
Do not use the same recovery plan for every task.
Adapt the recovery plan to the actual deadline status
and task description.


--------------------------------------------------
SUGGESTIONS
--------------------------------------------------

Give exactly 4 suggestions.

Every suggestion must be practical and related to:

- task title
- task description
- deadline
- priority
- progress
- participants when relevant

Avoid generic repeated advice.


--------------------------------------------------
RISK
--------------------------------------------------

Choose exactly one:

"High Risk"
"Medium Risk"
"Low Risk"

High Risk:
- overdue
- due today
- very close deadline with low progress
- high priority with significant remaining work

Medium Risk:
- moderate delay
- moderate remaining work
- approaching deadline

Low Risk:
- good progress
- comfortable deadline
- low urgency


--------------------------------------------------
ESTIMATED COMPLETION
--------------------------------------------------

Give a realistic estimate such as:

"1 Day"
"2 Days"
"3 Days"
"5 Days"
"1 Week"

Base it on progress, description, priority,
and remaining work.


--------------------------------------------------
REASON
--------------------------------------------------

Give a short task-specific reason.

Mention important factors such as:

- deadline
- overdue status
- priority
- progress
- pending duration


--------------------------------------------------
OUTPUT
--------------------------------------------------

Return ONLY valid JSON.

Do not use markdown.

Do not use code blocks.

Use exactly this structure:

{
  "risk": "High Risk",
  "suggestions": [
    "specific suggestion 1",
    "specific suggestion 2",
    "specific suggestion 3",
    "specific suggestion 4"
  ],
  "recoveryPlan": [
    {
      "day": "Day 1",
      "label": "short task-specific action"
    },
    {
      "day": "Day 2",
      "label": "short task-specific action"
    },
    {
      "day": "Day 3",
      "label": "short task-specific action"
    }
  ],
  "estCompletion": "3 Days",
  "reason": "short task-specific explanation"
}
`;


    // --------------------------------------------------
    // CALL GEMINI
    // --------------------------------------------------

    const result = await model.generateContent(prompt);

    const response = result.response;

    let text = response.text().trim();


    // --------------------------------------------------
    // REMOVE MARKDOWN
    // --------------------------------------------------

    text = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();


    // --------------------------------------------------
    // PARSE JSON
    // --------------------------------------------------

    const analysis = JSON.parse(text);


    // --------------------------------------------------
    // VALIDATE RESPONSE
    // --------------------------------------------------

    if (
      !analysis.risk ||
      !Array.isArray(analysis.suggestions) ||
      !Array.isArray(analysis.recoveryPlan)
    ) {
      throw new Error(
        "Invalid Gemini response structure"
      );
    }


    if (analysis.suggestions.length !== 4) {
      throw new Error(
        "Gemini did not return exactly 4 suggestions"
      );
    }


    if (analysis.recoveryPlan.length !== 3) {
      throw new Error(
        "Gemini did not return exactly 3 recovery steps"
      );
    }


    const validRisks = [
      "High Risk",
      "Medium Risk",
      "Low Risk",
    ];

    if (!validRisks.includes(analysis.risk)) {
      throw new Error(
        "Invalid risk value returned by Gemini"
      );
    }


    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    console.log(
      "TaskPilot Gemini analysis generated successfully"
    );

    return analysis;

  } catch (error) {

    console.error(
      "TaskPilot Gemini error:",
      error.message
    );

    return fallbackAnalysis(task);
  }
};


// --------------------------------------------------
// EXPORT
// --------------------------------------------------

module.exports = {
  generateTaskPilotAnalysis,
};
