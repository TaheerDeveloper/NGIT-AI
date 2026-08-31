document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     NGIT AI MENTOR
     Frontend Controller
     
     Flow:
     Login/Register
          ↓
     Node.js / Express
          ↓
     PHP Backend API
          ↓
     NGIT AI Mentor
  ========================================================= */

  /* =========================================================
     ELEMENTS
  ========================================================= */

  // Screens
  const languageScreen = document.getElementById("languageScreen");
  const chatScreen = document.getElementById("chatScreen");

  // Auth tabs
  const showLoginBtn = document.getElementById("showLoginBtn");
  const showRegisterBtn = document.getElementById("showRegisterBtn");

  // Forms
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Login
  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");

  // Register
  const registerName = document.getElementById("registerName");
  const registerEmail = document.getElementById("registerEmail");
  const registerPassword = document.getElementById("registerPassword");
  const registerGender = document.getElementById("registerGender");
  const registerBtn = document.getElementById("registerBtn");

  // Chat
  const brandTitle = document.getElementById("brandTitle");
  const statusText = document.getElementById("statusText");
  const chatBody = document.getElementById("chatBody");

  const welcomeCard = document.getElementById("welcomeCard");
  const welcomeTitle = document.getElementById("welcomeTitle");
  const welcomeText = document.getElementById("welcomeText");

  const messagesContainer = document.getElementById("messages");

  const suggestedQuestions =
    document.getElementById("suggestedQuestions");

  const suggestedQuestionsContainer =
    document.getElementById("suggestedQuestionsContainer");

  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  // History
  const historyToggleBtn =
    document.getElementById("historyToggleBtn");

  const historyPanel =
    document.getElementById("historyPanel");

  const closeHistoryBtn =
    document.getElementById("closeHistoryBtn");

  const historyList =
    document.getElementById("historyList");

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");

  /* =========================================================
     STORAGE
  ========================================================= */

  const USER_STORAGE_KEY = "ngit_ai_user";
  const HISTORY_STORAGE_KEY = "ngit_ai_history";

  /* =========================================================
     STATE
  ========================================================= */

  let currentUser = null;
  let conversationHistory = [];
  let isLoading = false;

  /* =========================================================
     COMPANY DATA
  ========================================================= */

  const COMPANY_DATA = `
NGIT SOFTWARE SOLUTIONS
Also known as Next Generation IT Gombe.

Address:
Layol Plaza, Along FCE(T) Road, Tashan Dukku,
Gombe, Gombe State, Nigeria.

Core Values:
Faith, Respect, Timeliness, Objectivity, Merit,
Effective Communication, Compliance, Integrity.

Team:
Abubakar Abdullahi — CEO / Full-stack Developer
Adamu Adamu — CTO / System Analyst
Yakubu Nuhu — CMM Marketing Manager
Nasir Ismail — Assistant Marketing Manager

Courses and Prices:
1. Web Design & Development — ₦35,000 — 8 weeks
2. Computer Networking & Maintenance — ₦30,000 — 6 weeks
3. Mobile App Development — ₦45,000 — 10 weeks
4. Digital Marketing — ₦25,000 — 4 weeks
5. Computer Appreciation — ₦15,000 — 4 weeks
6. Graphic Design — ₦20,000 — 6 weeks
7. ArchiCAD — ₦35,000 — 8 weeks
8. JAMB CBT Preparatory Coaching — ₦10,000 — 4 weeks

Teaching Languages:
English and Hausa.

Learning Modes:
Physical classes in Gombe and online classes.
`;

  /* =========================================================
     SUGGESTIONS
  ========================================================= */

  const SUGGESTIONS = [
    {
      text: "Which course is best for beginners? 🚀",
      prompt:
        "I'm a complete beginner. Which NGIT course should I start with and why?",
    },

    {
      text: "Show all courses and prices 💰",
      prompt:
        "List all courses offered by NGIT Software Solutions and their prices.",
    },

    {
      text: "Full-Stack Developer roadmap 💻",
      prompt:
        "Create a roadmap for becoming a Full-Stack Developer using NGIT courses.",
    },

    {
      text: "Tell me about NGIT 📚",
      prompt:
        "Tell me about NGIT Software Solutions, its courses, location and learning options.",
    },
  ];

  /* =========================================================
     INIT
  ========================================================= */

  init();

  function init() {
    setupAuthTabs();
    setupAuthForms();
    setupChat();
    setupHistory();
    setupLogout();

    adjustInputHeight();
    updateSendButton();

    loadSavedUser();
  }

  /* =========================================================
     AUTH TABS
  ========================================================= */

  function setupAuthTabs() {
    showLoginBtn?.addEventListener("click", showLogin);
    showRegisterBtn?.addEventListener("click", showRegister);
  }

  function showLogin() {
    showLoginBtn?.classList.add("active");
    showRegisterBtn?.classList.remove("active");

    loginForm?.classList.remove("hidden");
    registerForm?.classList.add("hidden");

    clearAuthMessage();

    setTimeout(() => {
      loginEmail?.focus();
    }, 100);
  }

  function showRegister() {
    showRegisterBtn?.classList.add("active");
    showLoginBtn?.classList.remove("active");

    registerForm?.classList.remove("hidden");
    loginForm?.classList.add("hidden");

    clearAuthMessage();

    setTimeout(() => {
      registerName?.focus();
    }, 100);
  }

  /* =========================================================
     AUTH FORMS
  ========================================================= */

  function setupAuthForms() {
    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      await loginUser();
    });

    registerForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      await registerUser();
    });
  }

  /* =========================================================
     LOGIN
  ========================================================= */

  async function loginUser() {
    const email =
      loginEmail?.value.trim().toLowerCase() || "";

    const password =
      loginPassword?.value || "";

    if (!email || !password) {
      showAuthMessage(
        "Please enter your email and password.",
        "error"
      );
      return;
    }

    if (!isValidEmail(email)) {
      showAuthMessage(
        "Please enter a valid email address.",
        "error"
      );
      loginEmail?.focus();
      return;
    }

    setButtonLoading(
      loginBtn,
      true,
      "Logging in..."
    );

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await parseJSON(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Invalid email or password."
        );
      }

      if (!data.user) {
        throw new Error(
          "Login succeeded, but user information was not returned."
        );
      }

      currentUser = data.user;

      saveUser(currentUser);

      clearAuthMessage();

      loginForm?.reset();

      await enterChat();

    } catch (error) {
      console.error("Login error:", error);

      showAuthMessage(
        error.message ||
          "Unable to connect to the authentication server.",
        "error"
      );
    } finally {
      setButtonLoading(
        loginBtn,
        false,
        "Login"
      );
    }
  }

  /* =========================================================
     REGISTER
  ========================================================= */

  async function registerUser() {
    const full_name =
      registerName?.value.trim() || "";

    const email =
      registerEmail?.value.trim().toLowerCase() || "";

    const password =
      registerPassword?.value || "";

    const gender =
      registerGender?.value.trim() || "";

    if (
      !full_name ||
      !email ||
      !password ||
      !gender
    ) {
      showAuthMessage(
        "Please complete all registration fields.",
        "error"
      );
      return;
    }

    if (full_name.length < 2) {
      showAuthMessage(
        "Please enter your full name.",
        "error"
      );

      registerName?.focus();
      return;
    }

    if (!isValidEmail(email)) {
      showAuthMessage(
        "Please enter a valid email address.",
        "error"
      );

      registerEmail?.focus();
      return;
    }

    if (password.length < 6) {
      showAuthMessage(
        "Password must be at least 6 characters.",
        "error"
      );

      registerPassword?.focus();
      return;
    }

    setButtonLoading(
      registerBtn,
      true,
      "Creating account..."
    );

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            full_name,
            email,
            password,
            gender,
          }),
        }
      );

      const data = await parseJSON(response);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Registration failed."
        );
      }

      showAuthMessage(
        data.message ||
          "Registration successful. You can now login.",
        "success"
      );

      registerForm?.reset();

      setTimeout(() => {
        clearAuthMessage();

        showLogin();

        if (loginEmail) {
          loginEmail.value = email;
        }

        loginPassword?.focus();
      }, 1000);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      showAuthMessage(
        error.message ||
          "Unable to connect to the registration server.",
        "error"
      );
    } finally {
      setButtonLoading(
        registerBtn,
        false,
        "Register"
      );
    }
  }

  /* =========================================================
     CHAT SETUP
  ========================================================= */

  function setupChat() {
    chatInput?.addEventListener(
      "input",
      () => {
        adjustInputHeight();
        updateSendButton();
      }
    );

    sendBtn?.addEventListener(
      "click",
      handleUserSendMessage
    );

    chatInput?.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {
          event.preventDefault();

          if (!isLoading) {
            handleUserSendMessage();
          }
        }
      }
    );
  }

  /* =========================================================
     ENTER CHAT
  ========================================================= */

  async function enterChat() {
    if (!currentUser) return;

    const name =
      currentUser.full_name ||
      currentUser.name ||
      "there";

    if (brandTitle) {
      brandTitle.textContent =
        "NGIT AI Mentor";
    }

    setStatus("Active");

    if (welcomeTitle) {
      welcomeTitle.textContent =
        `Welcome, ${name}! 👋`;
    }

    if (welcomeText) {
      welcomeText.textContent =
        "I’m ready to help you learn digital skills, explore NGIT courses, and answer your technology questions.";
    }

    languageScreen?.classList.add("hidden");

    loadConversation();

    setTimeout(() => {
      chatScreen?.classList.add("visible");

      if (!conversationHistory.length) {
        renderSuggestions();
      }

      chatInput?.focus();

      scrollChatToBottom();
    }, 250);
  }

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  async function handleUserSendMessage() {
    const text =
      chatInput?.value.trim() || "";

    if (
      !text ||
      isLoading ||
      !currentUser
    ) {
      return;
    }

    chatInput.value = "";

    adjustInputHeight();

    updateSendButton();

    appendMessageBubble(
      "user",
      text
    );

    isLoading = true;

    setStatus("Thinking...");

    updateSendButton();

    const typingIndicator =
      appendMessageBubble(
        "ai",
        "",
        true
      );

    try {
      const responseText =
        await callAI(text);

      typingIndicator?.remove();

      appendMessageBubble(
        "ai",
        responseText
      );

      conversationHistory.push({
        role: "user",
        text,
        timestamp: new Date().toISOString(),
      });

      conversationHistory.push({
        role: "model",
        text: responseText,
        timestamp: new Date().toISOString(),
      });

      if (
        conversationHistory.length > 20
      ) {
        conversationHistory =
          conversationHistory.slice(-20);
      }

      saveConversation();

    } catch (error) {
      console.error(
        "AI error:",
        error
      );

      typingIndicator?.remove();

      appendMessageBubble(
        "ai",
        "⚠️ I'm having trouble connecting right now. Please try again in a moment."
      );

    } finally {
      isLoading = false;

      setStatus("Active");

      updateSendButton();

      chatInput?.focus();
    }
  }

  /* =========================================================
     CALL AI API
  ========================================================= */

  async function callAI(userPrompt) {
    const response =
      await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept:
              "application/json",
          },
          body: JSON.stringify({
            conversationHistory,
            userPrompt,
            userName:
              currentUser?.full_name ||
              currentUser?.name ||
              "",
            companyData:
              COMPANY_DATA,
          }),
        }
      );

    const data =
      await parseJSON(response);

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.error ||
          data.message ||
          "AI request failed."
      );
    }

    return (
      data.reply ||
      "I'm here to help with NGIT and technology questions."
    );
  }

  /* =========================================================
     MESSAGE UI
  ========================================================= */

  function appendMessageBubble(
    sender,
    content,
    isTyping = false
  ) {
    if (!messagesContainer) {
      return null;
    }

    welcomeCard?.style.setProperty(
      "display",
      "none"
    );

    suggestedQuestionsContainer?.classList.add(
      "hidden"
    );

    const messageDiv =
      document.createElement("div");

    messageDiv.className =
      `message ${sender}`;

    messageDiv.dataset.sender =
      sender;

    const bubble =
      document.createElement("div");

    bubble.className =
      `bubble ${
        isTyping
          ? "typing"
          : sender
      }`;

    if (isTyping) {
      bubble.setAttribute(
        "aria-label",
        "AI is typing"
      );

      bubble.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      `;
    } else if (sender === "ai") {
      bubble.innerHTML =
        parseMarkdown(content);
    } else {
      bubble.textContent =
        content;
    }

    messageDiv.appendChild(
      bubble
    );

    messagesContainer.appendChild(
      messageDiv
    );

    scrollChatToBottom();

    return messageDiv;
  }

  /* =========================================================
     SUGGESTIONS
  ========================================================= */

  function renderSuggestions() {
    if (!suggestedQuestions) {
      return;
    }

    suggestedQuestions.innerHTML =
      "";

    SUGGESTIONS.forEach(
      (item) => {
        const chip =
          document.createElement(
            "button"
          );

        chip.type = "button";

        chip.className =
          "suggest-chip";

        chip.textContent =
          item.text;

        chip.addEventListener(
          "click",
          () => {
            sendDirectPrompt(
              item.prompt
            );
          }
        );

        suggestedQuestions.appendChild(
          chip
        );
      }
    );
  }

  function sendDirectPrompt(text) {
    if (
      isLoading ||
      !chatInput
    ) {
      return;
    }

    chatInput.value = text;

    adjustInputHeight();

    updateSendButton();

    handleUserSendMessage();
  }

  /* =========================================================
     HISTORY
  ========================================================= */

  function setupHistory() {
    historyToggleBtn?.addEventListener(
      "click",
      toggleHistory
    );

    closeHistoryBtn?.addEventListener(
      "click",
      closeHistory
    );

    // Close history when clicking outside
    document.addEventListener(
      "click",
      (event) => {
        if (
          historyPanel?.classList.contains(
            "hidden"
          )
        ) {
          return;
        }

        if (
          historyPanel.contains(
            event.target
          ) ||
          historyToggleBtn?.contains(
            event.target
          )
        ) {
          return;
        }

        closeHistory();
      }
    );
  }

  function toggleHistory() {
    if (!historyPanel) {
      return;
    }

    historyPanel.classList.toggle(
      "hidden"
    );

    if (
      !historyPanel.classList.contains(
        "hidden"
      )
    ) {
      renderHistory();
    }
  }

  function closeHistory() {
    historyPanel?.classList.add(
      "hidden"
    );
  }

  /* =========================================================
     SAVE CONVERSATION
  ========================================================= */

  function saveConversation() {
    if (!currentUser?.id) {
      return;
    }

    const data = {
      userId: currentUser.id,
      messages:
        conversationHistory,
      updatedAt:
        new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        HISTORY_STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.warn(
        "Could not save conversation:",
        error
      );
    }
  }

  /* =========================================================
     LOAD CONVERSATION
  ========================================================= */

  function loadConversation() {
    if (!currentUser?.id) {
      return;
    }

    try {
      const saved =
        localStorage.getItem(
          HISTORY_STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const data =
        JSON.parse(saved);

      if (
        data?.userId ===
          currentUser.id &&
        Array.isArray(
          data.messages
        )
      ) {
        conversationHistory =
          data.messages.slice(-20);

        if (
          messagesContainer &&
          chatScreen?.classList.contains(
            "visible"
          )
        ) {
          restoreMessages();
        }
      }
    } catch (error) {
      console.warn(
        "Could not load conversation:",
        error
      );

      conversationHistory = [];
    }
  }

  /* =========================================================
     RESTORE MESSAGES
  ========================================================= */

  function restoreMessages() {
    if (!messagesContainer) {
      return;
    }

    messagesContainer.innerHTML =
      "";

    conversationHistory.forEach(
      (message) => {
        if (
          message.role !== "user" &&
          message.role !== "model"
        ) {
          return;
        }

        appendMessageBubble(
          message.role === "model"
            ? "ai"
            : "user",
          message.text
        );
      }
    );

    if (
      conversationHistory.length >
      0
    ) {
      welcomeCard?.style.setProperty(
        "display",
        "none"
      );

      suggestedQuestionsContainer?.classList.add(
        "hidden"
      );
    }
  }

  /* =========================================================
     HISTORY LIST
  ========================================================= */

  function renderHistory() {
    if (!historyList) {
      return;
    }

    historyList.innerHTML =
      "";

    if (
      !conversationHistory.length
    ) {
      historyList.innerHTML = `
        <div class="history-empty">
          <span class="material-symbols-outlined">
            forum
          </span>
          <p>No recent conversations yet.</p>
        </div>
      `;

      return;
    }

    const userMessages =
      conversationHistory.filter(
        (message) =>
          message.role ===
          "user"
      );

    userMessages
      .slice()
      .reverse()
      .forEach(
        (message) => {
          const item =
            document.createElement(
              "button"
            );

          item.type = "button";

          item.className =
            "history-item";

          const title =
            message.text.length >
            70
              ? message.text.substring(
                  0,
                  70
                ) + "..."
              : message.text;

          item.innerHTML = `
            <span class="material-symbols-outlined">
              chat
            </span>

            <span class="history-item-text">
              ${escapeHTML(title)}
            </span>
          `;

          item.addEventListener(
            "click",
            () => {
              closeHistory();

              if (chatInput) {
                chatInput.value =
                  message.text;

                adjustInputHeight();

                updateSendButton();

                chatInput.focus();
              }
            }
          );

          historyList.appendChild(
            item
          );
        }
      );
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  function setupLogout() {
    logoutBtn?.addEventListener(
      "click",
      logoutUser
    );
  }

  function logoutUser() {
    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (!confirmed) {
      return;
    }

    currentUser = null;

    conversationHistory = [];

    localStorage.removeItem(
      USER_STORAGE_KEY
    );

    localStorage.removeItem(
      HISTORY_STORAGE_KEY
    );

    if (messagesContainer) {
      messagesContainer.innerHTML =
        "";
    }

    welcomeCard?.style.setProperty(
      "display",
      ""
    );

    suggestedQuestionsContainer?.classList.remove(
      "hidden"
    );

    chatScreen?.classList.remove(
      "visible"
    );

    closeHistory();

    setTimeout(() => {
      languageScreen?.classList.remove(
        "hidden"
      );

      showLogin();

      loginForm?.reset();
      registerForm?.reset();

      clearAuthMessage();

      if (chatInput) {
        chatInput.value = "";
      }

      adjustInputHeight();
      updateSendButton();

      loginEmail?.focus();
    }, 250);
  }

  /* =========================================================
     USER STORAGE
  ========================================================= */

  function saveUser(user) {
    if (!user) {
      return;
    }

    try {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(user)
      );
    } catch (error) {
      console.warn(
        "Could not save user:",
        error
      );
    }
  }

  function loadSavedUser() {
    try {
      const saved =
        localStorage.getItem(
          USER_STORAGE_KEY
        );

      if (!saved) {
        showLogin();
        return;
      }

      const user =
        JSON.parse(saved);

      if (
        !user ||
        !user.id
      ) {
        localStorage.removeItem(
          USER_STORAGE_KEY
        );

        showLogin();

        return;
      }

      currentUser = user;

      loadConversation();

      enterChat();

    } catch (error) {
      console.warn(
        "Invalid saved user:",
        error
      );

      localStorage.removeItem(
        USER_STORAGE_KEY
      );

      showLogin();
    }
  }

  /* =========================================================
     AUTH MESSAGE
  ========================================================= */

  function showAuthMessage(
    message,
    type = "error"
  ) {
    let box =
      document.getElementById(
        "authMessage"
      );

    if (!box) {
      box =
        document.createElement(
          "div"
        );

      box.id =
        "authMessage";

      const activeForm =
        !registerForm?.classList.contains(
          "hidden"
        )
          ? registerForm
          : loginForm;

      activeForm?.prepend(box);
    }

    box.className =
      `auth-message ${type}`;

    box.textContent =
      message;
  }

  function clearAuthMessage() {
    const box =
      document.getElementById(
        "authMessage"
      );

    box?.remove();
  }

  /* =========================================================
     BUTTON LOADING
  ========================================================= */

  function setButtonLoading(
    button,
    loading,
    text
  ) {
    if (!button) {
      return;
    }

    if (loading) {
      button.disabled = true;

      if (
        !button.dataset.originalHTML
      ) {
        button.dataset.originalHTML =
          button.innerHTML;
      }

      button.innerHTML = `
        <span>${escapeHTML(text)}</span>

        <span
          class="material-symbols-outlined loading-icon"
          aria-hidden="true"
        >
          progress_activity
        </span>
      `;
    } else {
      button.disabled = false;

      button.innerHTML =
        button.dataset.originalHTML ||
        `
          <span>${escapeHTML(text)}</span>

          <span
            class="material-symbols-outlined"
            aria-hidden="true"
          >
            arrow_forward
          </span>
        `;

      delete button.dataset
        .originalHTML;
    }
  }

  /* =========================================================
     SEND BUTTON STATE
  ========================================================= */

  function updateSendButton() {
    if (!sendBtn) {
      return;
    }

    const hasText =
      !!chatInput?.value.trim();

    sendBtn.disabled =
      !hasText || isLoading;

    sendBtn.setAttribute(
      "aria-disabled",
      String(
        sendBtn.disabled
      )
    );
  }

  /* =========================================================
     STATUS
  ========================================================= */

  function setStatus(status) {
    if (!statusText) {
      return;
    }

    statusText.textContent =
      status;

    statusText.classList.toggle(
      "thinking",
      status === "Thinking..."
    );

    statusText.classList.toggle(
      "active",
      status === "Active"
    );
  }

  /* =========================================================
     INPUT HEIGHT
  ========================================================= */

  function adjustInputHeight() {
    if (!chatInput) {
      return;
    }

    chatInput.style.height =
      "auto";

    const maxHeight = 140;

    chatInput.style.height =
      Math.min(
        chatInput.scrollHeight,
        maxHeight
      ) + "px";
  }

  /* =========================================================
     SCROLL
  ========================================================= */

  function scrollChatToBottom(
    behavior = "smooth"
  ) {
    if (!chatBody) {
      return;
    }

    requestAnimationFrame(() => {
      chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior,
      });
    });
  }

  /* =========================================================
     VALIDATION
  ========================================================= */

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    );
  }

  /* =========================================================
     JSON PARSER
  ========================================================= */

  async function parseJSON(
    response
  ) {
    const text =
      await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        success: false,
        message:
          cleanServerMessage(text),
      };
    }
  }

  function cleanServerMessage(text) {
    const value =
      String(text || "").trim();

    if (
      value.startsWith("<")
    ) {
      return "The server returned an invalid response.";
    }

    return value.substring(
      0,
      500
    );
  }

  /* =========================================================
     MARKDOWN
     Safe Lightweight Renderer
  ========================================================= */

  function parseMarkdown(text) {
    if (!text) {
      return "";
    }

    let safeText =
      escapeHTML(text);

    const codeBlocks = [];

    /*
      Extract fenced code blocks first.
    */

    safeText =
      safeText.replace(
        /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g,
        (match, lang, code) => {
          const id =
            `__CODE_BLOCK_${codeBlocks.length}__`;

          const language =
            escapeHTML(
              lang || ""
            );

          const cleanCode =
            code
              .trim()
              .replace(
                /\n/g,
                "<br>"
              );

          codeBlocks.push(`
            <pre class="code-block">
              <code class="language-${language}">${cleanCode}</code>
            </pre>
          `);

          return id;
        }
      );

    /*
      Inline code
    */

    safeText =
      safeText.replace(
        /`([^`\n]+)`/g,
        "<code>$1</code>"
      );

    /*
      Bold
    */

    safeText =
      safeText.replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>"
      );

    /*
      Italic
    */

    safeText =
      safeText.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
      );

    /*
      Headings
    */

    safeText =
      safeText.replace(
        /^###\s+(.+)$/gm,
        "<h4>$1</h4>"
      );

    safeText =
      safeText.replace(
        /^##\s+(.+)$/gm,
        "<h3>$1</h3>"
      );

    safeText =
      safeText.replace(
        /^#\s+(.+)$/gm,
        "<h2>$1</h2>"
      );

    const lines =
      safeText.split("\n");

    const result = [];

    let inList = false;
    let listType = null;

    for (
      let i = 0;
      i < lines.length;
      i++
    ) {
      const line =
        lines[i].trim();

      const ulMatch =
        line.match(
          /^[-*]\s+(.+)/
        );

      const olMatch =
        line.match(
          /^\d+\.\s+(.+)/
        );

      /*
        Unordered list
      */

      if (ulMatch) {
        if (
          !inList ||
          listType !== "ul"
        ) {
          if (inList) {
            result.push(
              `</${listType}>`
            );
          }

          inList = true;
          listType = "ul";

          result.push("<ul>");
        }

        result.push(
          `<li>${ulMatch[1]}</li>`
        );

        continue;
      }

      /*
        Ordered list
      */

      if (olMatch) {
        if (
          !inList ||
          listType !== "ol"
        ) {
          if (inList) {
            result.push(
              `</${listType}>`
            );
          }

          inList = true;
          listType = "ol";

          result.push("<ol>");
        }

        result.push(
          `<li>${olMatch[1]}</li>`
        );

        continue;
      }

      /*
        Close list
      */

      if (inList) {
        result.push(
          `</${listType}>`
        );

        inList = false;
        listType = null;
      }

      /*
        Ignore empty lines
      */

      if (!line) {
        continue;
      }

      /*
        Code block placeholder
      */

      if (
        line.startsWith(
          "__CODE_BLOCK_"
        ) &&
        line.endsWith("__")
      ) {
        result.push(line);
        continue;
      }

      /*
        Already-rendered headings
      */

      if (
        line.startsWith("<h2>") ||
        line.startsWith("<h3>") ||
        line.startsWith("<h4>")
      ) {
        result.push(line);
        continue;
      }

      result.push(
        `<p>${line}</p>`
      );
    }

    if (inList) {
      result.push(
        `</${listType}>`
      );
    }

    let html =
      result.join("\n");

    /*
      Restore code blocks
    */

    codeBlocks.forEach(
      (block, index) => {
        html =
          html.replace(
            `__CODE_BLOCK_${index}__`,
            block
          );
      }
    );

    return html;
  }

  /* =========================================================
     ESCAPE HTML
  ========================================================= */

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }
});