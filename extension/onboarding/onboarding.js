/**
 * Onboarding page script
 */

document.addEventListener('DOMContentLoaded', () => {
  const getStartedButton = document.getElementById('get-started-button');

  if (getStartedButton) {
    getStartedButton.addEventListener('click', async () => {
      // Open Claude.ai in a new tab
      await chrome.tabs.create({ url: 'https://claude.ai' });
      
      // Close onboarding tab
      window.close();
    });
  }
});
