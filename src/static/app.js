document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch(`/activities?ts=${Date.now()}`, { cache: 'no-store' });
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Reset activity select options before repopulating
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants list HTML
        const participantsHTML = (details.participants || []).map(p => `\n          <li class="participant-item"><span class="participant-email">${p}</span><button class="remove-btn" data-activity="${name}" data-email="${p}" aria-label="Remove participant">✕</button></li>`).join('');

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants">
            <h5>Participants (${details.participants.length})</h5>
            <ul class="participants-list">${participantsHTML}\n            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Attach remove handlers for this card's buttons
        activityCard.querySelectorAll('.remove-btn').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = btn.dataset.email;
            const activityName = btn.dataset.activity;

            // Optimistic disable
            btn.disabled = true;

            try {
              const res = await fetch(
                `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`,
                { method: 'DELETE' }
              );

              const result = await res.json();

              if (res.ok) {
                messageDiv.textContent = result.message;
                messageDiv.className = 'success';
                // Refresh activities to reflect change
                  await fetchActivities();
              } else {
                messageDiv.textContent = result.detail || 'Failed to remove participant';
                messageDiv.className = 'error';
                btn.disabled = false;
              }
            } catch (err) {
              console.error('Error removing participant:', err);
              messageDiv.textContent = 'Failed to remove participant. Please try again.';
              messageDiv.className = 'error';
              btn.disabled = false;
            }

            messageDiv.classList.remove('hidden');
            setTimeout(() => {
              messageDiv.classList.add('hidden');
            }, 4000);
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so participant lists and availability update
          await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
