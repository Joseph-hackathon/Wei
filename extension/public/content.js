/**
 * EIP Nexus Chrome Extension — Content Script
 * Injected on all GitHub PR pages (github.com/*/pull/*)
 *
 * Flow:
 *  1. Detect PR page and extract PR number
 *  2. Fetch bounty info from NexusCore (via API or The Graph)
 *  3. Render floating overlay panel
 *  4. On "Verify & Submit Review" click → trigger World ID verification
 *  5. On proof received → call NexusCore.submitReview()
 */

(function () {
  "use strict";

  // ── Constants ─────────────────────────────────────────────────────────────
  const NEXUS_API = "https://api.eip-nexus.xyz"; // Backend API (for demo)
  const DASHBOARD_URL = "https://eip-nexus.xyz";

  // ── Extract PR number from URL ────────────────────────────────────────────
  const match = window.location.pathname.match(/\/pull\/(\d+)/);
  if (!match) return;
  const prNumber = match[1];

  // ── State ─────────────────────────────────────────────────────────────────
  let bountyData = null;
  let panelVisible = false;
  let alreadyReviewed = false;

  // ── Check if this PR has a bounty (mock for demo) ─────────────────────────
  async function checkBounty() {
    try {
      // In production: query The Graph subgraph
      // For demo: mock response
      const mockBounties = {
        "9999": { amount: 500, currentReviews: 3, requiredReviews: 5, token: "USDC" },
        "8741": { amount: 250, currentReviews: 1, requiredReviews: 3, token: "USDC" },
        "8700": { amount: 750, currentReviews: 5, requiredReviews: 7, token: "USDC" },
      };
      return mockBounties[prNumber] || null;
    } catch {
      return null;
    }
  }

  // ── Render overlay panel ──────────────────────────────────────────────────
  function createPanel(bounty) {
    const pct = Math.round((bounty.currentReviews / bounty.requiredReviews) * 100);
    const prTitle = document.querySelector(".js-issue-title")?.textContent?.trim()
      || `Pull Request #${prNumber}`;

    // FAB toggle button
    const fab = document.createElement("button");
    fab.id = "eip-nexus-fab";
    fab.textContent = "N";
    fab.title = "EIP Nexus — Earn bounty for reviewing this PR";
    fab.onclick = () => togglePanel();
    document.body.appendChild(fab);

    // Main panel
    const panel = document.createElement("div");
    panel.id = "eip-nexus-panel";
    panel.className = "hidden";
    panel.innerHTML = `
      <div id="eip-nexus-header" onclick="document.getElementById('eip-nexus-fab').click()">
        <div id="eip-nexus-logo">
          <div id="eip-nexus-logo-icon">N</div>
          <span>EIP Nexus</span>
        </div>
        <div id="eip-nexus-status-dot"></div>
      </div>

      <div id="eip-nexus-body">
        <div id="eip-nexus-pr-info">
          <div id="eip-nexus-pr-title">${escHtml(prTitle.slice(0, 60))}${prTitle.length > 60 ? "…" : ""}</div>
          <div id="eip-nexus-progress-label">
            Verified Reviews: ${bounty.currentReviews}/${bounty.requiredReviews}
          </div>
          <div id="eip-nexus-progress-bar">
            <div id="eip-nexus-progress-fill" style="width: ${pct}%"></div>
          </div>
        </div>

        <div id="eip-nexus-bounty">
          <div>
            <div id="eip-nexus-bounty-amount">$${bounty.amount} ${bounty.token}</div>
            <div id="eip-nexus-bounty-label">Split among all verified reviewers</div>
          </div>
          <span style="font-size: 24px">💰</span>
        </div>

        <button id="eip-nexus-world-id-btn" ${alreadyReviewed ? "disabled" : ""}>
          🌍 ${alreadyReviewed ? "Already Reviewed" : "Verify & Submit Review"}
        </button>

        <button id="eip-nexus-view-btn">
          ↗ View on Dashboard
        </button>

        <div id="eip-nexus-success">
          <div id="eip-nexus-success-icon">🎉</div>
          <div id="eip-nexus-success-title">Review Submitted!</div>
          <div id="eip-nexus-success-sub">Your World ID verified review has been recorded on Sepolia. The AI agent will analyze this PR.</div>
        </div>
      </div>

      <div id="eip-nexus-footer">
        🔗 Chainlink CRE &nbsp;·&nbsp; 🌍 World ID &nbsp;·&nbsp; 📊 The Graph
      </div>
    `;

    document.body.appendChild(panel);

    // Event listeners
    document.getElementById("eip-nexus-world-id-btn").addEventListener("click", handleVerifyClick);
    document.getElementById("eip-nexus-view-btn").addEventListener("click", () => {
      window.open(`${DASHBOARD_URL}?pr=${prNumber}`, "_blank");
    });
    document.getElementById("eip-nexus-header").addEventListener("click", () => {
      togglePanel();
    });
  }

  function togglePanel() {
    const panel = document.getElementById("eip-nexus-panel");
    const fab = document.getElementById("eip-nexus-fab");
    if (!panel) return;
    panelVisible = !panelVisible;
    if (panelVisible) {
      panel.classList.remove("hidden");
      fab.classList.add("hidden");
    } else {
      panel.classList.add("hidden");
      fab.classList.remove("hidden");
    }
  }

  // ── World ID Verification Flow ────────────────────────────────────────────
  async function handleVerifyClick() {
    const btn = document.getElementById("eip-nexus-world-id-btn");
    btn.disabled = true;
    btn.textContent = "⏳ Connecting wallet...";

    try {
      // Step 1: Check wallet connection
      if (!window.ethereum) {
        alert("Please install MetaMask to use EIP Nexus.");
        btn.disabled = false;
        btn.textContent = "🌍 Verify & Submit Review";
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const userAddress = accounts[0];

      btn.textContent = "🌍 Generating World ID proof...";

      // Step 2: Trigger World ID verification via IDKit (injected by popup/background)
      const proof = await requestWorldIDProof(userAddress, prNumber);

      if (!proof) {
        btn.disabled = false;
        btn.textContent = "🌍 Verify & Submit Review";
        return;
      }

      btn.textContent = "⛓️ Submitting on-chain...";

      // Step 3: Submit to NexusCore.sol on Sepolia
      const txHash = await submitReviewOnChain(userAddress, prNumber, proof);

      if (txHash) {
        alreadyReviewed = true;
        btn.disabled = true;
        btn.textContent = "✅ Review Submitted";
        showSuccess(txHash);
      }
    } catch (err) {
      console.error("[EIP Nexus]", err);
      btn.disabled = false;
      btn.textContent = "🌍 Verify & Submit Review";
      alert("Error: " + (err.message || "Unknown error. Check console."));
    }
  }

  async function requestWorldIDProof(address, prId) {
    // Send message to background script to open World ID IDKit popup
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: "REQUEST_WORLD_ID_PROOF", address, prId },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("[EIP Nexus] Runtime error:", chrome.runtime.lastError);
            resolve(null);
          } else {
            resolve(response?.proof || null);
          }
        }
      );
    });
  }

  async function submitReviewOnChain(address, prId, proof) {
    // NexusCore.submitReview(uint256 prId, address signal, uint256 root, uint256 nullifierHash, uint256[8] proof)
    const NEXUS_CORE = "0x0000000000000000000000000000000000000000"; // deployed address

    // ABI-encoded call (simplified for demo)
    // In production: use ethers.js or viem
    const callData = encodeSubmitReview(prId, address, proof);

    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        from: address,
        to: NEXUS_CORE,
        data: callData,
        gas: "0x7A120", // 500k gas limit
        chainId: "0xaa36a7", // Sepolia
      }],
    });

    return txHash;
  }

  function encodeSubmitReview(prId, signal, proof) {
    // Simplified ABI encoding for demo
    // Production: use ethers.Interface.encodeFunctionData
    const funcSig = "0x" + keccak256("submitReview(uint256,address,uint256,uint256,uint256[8])").slice(0, 8);
    return funcSig; // placeholder
  }

  function showSuccess(txHash) {
    const success = document.getElementById("eip-nexus-success");
    if (success) {
      success.classList.add("show");
      success.querySelector("#eip-nexus-success-sub").innerHTML =
        `Your World ID verified review is recorded on-chain. <a href="https://sepolia.etherscan.io/tx/${txHash}" target="_blank" style="color:#6366f1">View tx ↗</a><br><br>The Chainlink CRE AI Agent will now analyze this PR.`;
    }
  }

  function escHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function keccak256(str) {
    // Simplified stub — production uses ethers.js
    return "a6f2ae3a"; // submitReview selector placeholder
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  async function init() {
    bountyData = await checkBounty();
    if (!bountyData) return; // No bounty for this PR

    // Small delay to ensure GitHub page is fully rendered
    setTimeout(() => {
      createPanel(bountyData);
      // Auto-show panel after 1.5s on first visit
      setTimeout(() => togglePanel(), 1500);
    }, 500);
  }

  init();
})();
