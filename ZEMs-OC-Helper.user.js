// ==UserScript==
// @name         ZEM's OC 2.0 Helper
// @namespace    https://www.torn.com/profiles.php?XID=4038551
// @version      2.8.2
// @description  Modern UI, tactical SVG button, Page OCs dashboard, 100% verified offline OC 2.0 database, accurate fail badge risk colors.
// @author       ZEM [4038551]
// @match        https://www.torn.com/factions.php?step=your*
// @updateURL    https://github.com/else-ai/Torn-OC-helper/raw/refs/heads/main/ZEMs-OC-Helper.user.js
// @downloadURL  https://github.com/else-ai/Torn-OC-helper/raw/refs/heads/main/ZEMs-OC-Helper.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @connect      raw.githubusercontent.com
// @connect      github.com
// @connect      api.github.com
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // =========================================================================
    // 1. LOCKED THRESHOLDS, VERSION & SETTINGS
    // =========================================================================
    const SCRIPT_VERSION = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version)
        ? GM_info.script.version
        : '2.8.2';
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/else-ai/Torn-OC-helper/main/ZEMs-OC-Helper.user.js';
    const GITHUB_API_URL = 'https://api.github.com/repos/else-ai/Torn-OC-helper/contents/ZEMs-OC-Helper.user.js';
    const INSTALL_URL = 'https://github.com/else-ai/Torn-OC-helper/raw/refs/heads/main/ZEMs-OC-Helper.user.js';

    const ANCHOR_MIN = 20.0;    // 20%+ is Anchor
    const SECONDARY_MIN = 14.0; // 14% - 19.9% is Secondary
    const STORAGE_KEY = 'zem_oc2_helper_settings_v24';

    const DEFAULT_SETTINGS = {
        anchorColor: '#ff4d4d',     // Crimson Red
        secondaryColor: '#ffaa00',  // Amber Gold
        lowColor: '#38d9a9',        // Crisp Teal/Cyan
        showWeightBadges: true,
        showFailChances: true,
        btnPos: { top: '140px', left: '20px' }
    };

    // Verified Consumable Items (Used up during OC 2.0 planning/execution)
    const CONSUMABLE_ITEMS = new Set([
        'dog treats',
        'shaving foam',
        'id badge',
        'atm key',
        'cell phone',
        'gasoline',
        'pcp',
        'blank casino chips',
        'spray paint : black',
        'chloroform',
        'zip ties',
        'polymorphic virus',
        'tunneling virus',
        'ipecac syrup',
        'thermite',
        'flash grenade',
        'c4 explosive',
        'core drill',
        'shaped charge',
        'firewalk virus',
        'razor wire',
        'floor cleaner',
        'tracking device',
        'syringe',
        'blood bag : irradiated',
        'stealth virus',
        'smoke grenade',
        'car battery',
        'armored virus',
        'lubricant',
        'ecstasy',
        'single red rose',
        'nail bomb',
        'psu',
        'hard drive',
        'igniter cord',
        'tear gas'
    ]);

    // =========================================================================
    // 2. COMPLETE & 100.0% VERIFIED OFFLINE OC 2.0 DATABASE (LEVELS 1-10)
    // =========================================================================
    const OC_DATABASE = {
        // --- LEVEL 1 ---
        "Mob Mentality": {
            level: 1,
            roles: {
                "LOOTER #1": { weight: 34.0, item: "Jemmy" },
                "LOOTER #2": { weight: 26.5, item: null },
                "LOOTER #4": { weight: 21.2, item: null },
                "LOOTER #3": { weight: 18.3, item: "Jemmy" }
            }
        },
        "Pet Project": {
            level: 1,
            roles: {
                "PICKLOCK": { weight: 36.4, item: "Lockpicks" },
                "MUSCLE": { weight: 32.6, item: "Net" },
                "KIDNAPPER": { weight: 31.0, item: "Dog Treats" }
            }
        },
        "First Aid and Abet": {
            level: 1,
            roles: {
                "PICKPOCKET": { weight: 43.3, item: null },
                "DECOY": { weight: 30.7, item: "Shaving Foam" },
                "PICKLOCK": { weight: 26.0, item: "Lockpicks" }
            }
        },

        // --- LEVEL 2 ---
        "Thou Shalt Not Steal": {
            level: 2,
            roles: {
                "PICKLOCK": { weight: 49.7, item: "Lockpicks" },
                "PICKPOCKET": { weight: 37.9, item: "Cell Phone" },
                "THIEF": { weight: 12.4, item: "Cassock" }
            }
        },
        "Cash Me If You Can": {
            level: 2,
            roles: {
                "THIEF #1": { weight: 54.2, item: "ID Badge" },
                "THIEF #2": { weight: 28.0, item: "ATM Key" },
                "LOOKOUT": { weight: 17.8, item: null }
            }
        },
        "Best of the Lot": {
            level: 2,
            roles: {
                "MUSCLE": { weight: 43.7, item: null },
                "PICKLOCK": { weight: 20.7, item: "Lockpicks" },
                "CAR THIEF": { weight: 19.5, item: null },
                "IMITATOR": { weight: 16.1, item: "Police Badge" }
            }
        },

        // --- LEVEL 3 ---
        "Smoke and Wing Mirrors": {
            level: 3,
            roles: {
                "CAR THIEF": { weight: 50.9, item: "RF Detector" },
                "IMITATOR": { weight: 27.1, item: "DSLR Camera" },
                "HUSTLER #2": { weight: 13.0, item: null },
                "HUSTLER #1": { weight: 9.0, item: null }
            }
        },
        "Market Forces": {
            level: 3,
            roles: {
                "ENFORCER": { weight: 29.4, item: null },
                "NEGOTIATOR": { weight: 27.2, item: null },
                "MUSCLE": { weight: 22.5, item: null },
                "LOOKOUT": { weight: 16.4, item: null },
                "ARSONIST": { weight: 4.5, item: "Gasoline" }
            }
        },
        "Gaslight the Way": {
            level: 3,
            roles: {
                "IMITATOR #3": { weight: 41.3, item: "ID Badge" },
                "IMITATOR #2": { weight: 27.5, item: "ID Badge" },
                "LOOTER #3": { weight: 12.4, item: null },
                "IMITATOR #1": { weight: 9.4, item: "Construction Helmet" },
                "LOOTER #1": { weight: 9.4, item: null },
                "LOOTER #2": { weight: 0.0, item: null }
            }
        },

        // --- LEVEL 4 ---
        "Stage Fright": {
            level: 4,
            roles: {
                "SNIPER": { weight: 46.3, item: null },
                "MUSCLE #1": { weight: 20.0, item: null },
                "ENFORCER": { weight: 15.7, item: null },
                "MUSCLE #3": { weight: 9.2, item: null },
                "LOOKOUT": { weight: 6.2, item: "Binoculars" },
                "MUSCLE #2": { weight: 2.6, item: null }
            }
        },
        "Snow Blind": {
            level: 4,
            roles: {
                "HUSTLER": { weight: 48.4, item: null },
                "IMITATOR": { weight: 34.6, item: "PCP" },
                "MUSCLE #1": { weight: 8.5, item: null },
                "MUSCLE #2": { weight: 8.5, item: null }
            }
        },
        "Plucking the Lotus Petal": {
            level: 4,
            roles: {
                "MUSCLE": { weight: 47.9, item: null },
                "ROBBER #2": { weight: 23.7, item: null },
                "HUSTLER": { weight: 14.4, item: "Blank Casino Chips" },
                "ROBBER #1": { weight: 14.0, item: null }
            }
        },

        // --- LEVEL 5 ---
        "No Reserve": {
            level: 5,
            roles: {
                "TECHIE": { weight: 38.4, item: "Spray Paint : Black" },
                "ENGINEER": { weight: 31.1, item: "Chloroform" },
                "CAR THIEF": { weight: 30.5, item: "Bolt Cutters" }
            }
        },
        "Guardian Angels": {
            level: 5,
            roles: {
                "HUSTLER": { weight: 42.1, item: null },
                "ENGINEER": { weight: 30.5, item: "Hand Drill" },
                "ENFORCER": { weight: 27.4, item: null }
            }
        },
        "Counter Offer": {
            level: 5,
            roles: {
                "ROBBER": { weight: 35.9, item: "Zip Ties" },
                "ENGINEER": { weight: 28.4, item: "Wire Cutters" },
                "PICKLOCK": { weight: 16.5, item: "Lockpicks" },
                "HACKER": { weight: 12.1, item: "Polymorphic Virus" },
                "LOOTER": { weight: 7.1, item: "Zip Ties" }
            }
        },
        "Honey Trap": {
            level: 5,
            roles: {
                "MUSCLE #2": { weight: 42.2, item: "Billfold" },
                "MUSCLE #1": { weight: 30.9, item: null },
                "ENFORCER": { weight: 26.9, item: "Billfold" }
            }
        },

        // --- LEVEL 6 ---
        "Leave No Trace": {
            level: 6,
            roles: {
                "IMITATOR": { weight: 36.9, item: "Police Badge" },
                "NEGOTIATOR": { weight: 34.1, item: "Police Badge" },
                "TECHIE": { weight: 29.0, item: null }
            }
        },
        "Sneaky Git Grab": {
            level: 6,
            roles: {
                "PICKPOCKET": { weight: 50.9, item: null },
                "IMITATOR": { weight: 17.5, item: null },
                "TECHIE": { weight: 17.1, item: "Wireless Dongle" },
                "HACKER": { weight: 14.5, item: "Tunneling Virus" }
            }
        },
        "Dish It Out": {
            level: 6,
            roles: {
                "ASSASSIN": { weight: 37.3, item: "Ipecac Syrup" },
                "MUSCLE": { weight: 25.2, item: "Bolt Cutters" },
                "SABOTEUR #1": { weight: 14.6, item: "Thermite" },
                "ENGINEER": { weight: 13.9, item: "Wire Cutters" },
                "SABOTEUR #2": { weight: 9.0, item: "Thermite" }
            }
        },
        "Bidding War": {
            level: 6,
            roles: {
                "ROBBER #3": { weight: 31.7, item: "Dental Mirror" },
                "ROBBER #2": { weight: 22.9, item: "Flash Grenade" },
                "BOMBER #2": { weight: 18.0, item: "C4 Explosive" },
                "DRIVER": { weight: 12.5, item: null },
                "BOMBER #1": { weight: 7.8, item: "C4 Explosive" },
                "ROBBER #1": { weight: 7.1, item: "Jemmy" }
            }
        },

        // --- LEVEL 7 ---
        "Blast From The Past": {
            level: 7,
            roles: {
                "MUSCLE": { weight: 34.6, item: "Zip Ties" },
                "ENGINEER": { weight: 24.0, item: "Core Drill" },
                "BOMBER": { weight: 15.6, item: "Shaped Charge" },
                "HACKER": { weight: 12.1, item: "Firewalk Virus" },
                "PICKLOCK #1": { weight: 10.8, item: null },
                "PICKLOCK #2": { weight: 2.9, item: null }
            }
        },
        "Window of Opportunity": {
            level: 7,
            roles: {
                "LOOTER #2": { weight: 25.8, item: "Angle Grinder" },
                "MUSCLE #1": { weight: 23.1, item: "Razor Wire" },
                "LOOTER #1": { weight: 19.5, item: "Ladder" },
                "MUSCLE #2": { weight: 17.0, item: "Floor Cleaner" },
                "ENGINEER": { weight: 14.6, item: "Wire Cutters" }
            }
        },
        "Cleared for Takeoff": {
            level: 7,
            roles: {
                "INTERROGATOR": { weight: 25.2, item: "Bone Saw" },
                "IMITATOR": { weight: 24.9, item: "Large Suitcase" },
                "ASSASSIN": { weight: 18.2, item: null },
                "PICKPOCKET": { weight: 12.0, item: "Tracking Device" },
                "TECHIE": { weight: 11.3, item: "Hand Drill" },
                "LOOKOUT": { weight: 8.4, item: null }
            }
        },

        // --- LEVEL 8 ---
        "Break the Bank": {
            level: 8,
            roles: {
                "MUSCLE #3": { weight: 31.7, item: "Hand Drill" },
                "THIEF #2": { weight: 29.1, item: "Hand Drill" },
                "MUSCLE #1": { weight: 13.5, item: "Hand Drill" },
                "ROBBER": { weight: 12.7, item: "Hand Drill" },
                "MUSCLE #2": { weight: 10.1, item: "Zip Ties" },
                "THIEF #1": { weight: 2.9, item: "Hand Drill" }
            }
        },
        "Clinical Precision": {
            level: 8,
            roles: {
                "IMITATOR": { weight: 43.3, item: "Syringe" },
                "CLEANER": { weight: 21.7, item: "Blood Bag : Irradiated" },
                "CAT BURGLAR": { weight: 18.9, item: null },
                "ASSASSIN": { weight: 16.1, item: "Chloroform" }
            }
        },
        "Stacking the Deck": {
            level: 8,
            roles: {
                "IMITATOR": { weight: 48.2, item: "ID Badge" },
                "HACKER": { weight: 25.4, item: "Stealth Virus" },
                "CAT BURGLAR": { weight: 23.4, item: "Jemmy" },
                "DRIVER": { weight: 3.0, item: "Smoke Grenade" }
            }
        },
        "Manifest Cruelty": {
            level: 8,
            roles: {
                "REVIVER": { weight: 46.3, item: "Car Battery" },
                "INTERROGATOR": { weight: 23.5, item: "Cigar Cutter" },
                "HACKER": { weight: 16.3, item: "Stealth Virus" },
                "CAT BURGLAR": { weight: 13.9, item: "Zip Ties" }
            }
        },
        "Pier Pressure": {
            level: 8,
            isAlias: true,
            roles: {
                "REVIVER": { weight: 46.3, item: "Car Battery" },
                "INTERROGATOR": { weight: 23.5, item: "Cigar Cutter" },
                "HACKER": { weight: 16.3, item: "Stealth Virus" },
                "CAT BURGLAR": { weight: 13.9, item: "Zip Ties" }
            }
        },
        "Lock Stock": {
            level: 8,
            roles: {
                "ASSASSIN": { weight: 40.3, item: "Ecstasy" },
                "HACKER": { weight: 18.4, item: "Armored Virus" },
                "SMUGGLER": { weight: 17.5, item: "Lubricant" },
                "MUSCLE #1": { weight: 11.9, item: null },
                "MUSCLE #2": { weight: 11.9, item: null }
            }
        },
        "Ship Happens": {
            level: 8,
            roles: {
                "INTERROGATOR": { weight: 31.3, item: null },
                "SPY": { weight: 25.4, item: null },
                "HUSTLER": { weight: 19.7, item: "Single Red Rose" },
                "ENGINEER": { weight: 13.3, item: "Core Drill" },
                "ASSASSIN": { weight: 10.3, item: null }
            }
        },

        // --- LEVEL 9 ---
        "Ace in the Hole": {
            level: 9,
            roles: {
                "HACKER": { weight: 28.3, item: null },
                "MUSCLE #2": { weight: 24.7, item: null },
                "IMITATOR": { weight: 21.1, item: "ID Badge" },
                "MUSCLE #1": { weight: 18.3, item: null },
                "DRIVER": { weight: 7.6, item: null }
            }
        },
        "Gone Fission": {
            level: 9,
            roles: {
                "IMITATOR": { weight: 24.9, item: "DSLR Camera" },
                "HIJACKER": { weight: 24.9, item: "Zip Ties" },
                "BOMBER": { weight: 18.0, item: "C4 Explosive" },
                "PICKPOCKET": { weight: 16.5, item: "Cut-Throat Razor" },
                "ENGINEER": { weight: 15.7, item: "Thermite" }
            }
        },
        "Hostile Takeover": {
            level: 9,
            roles: {
                "NEGOTIATOR": { weight: 24.0, item: "Nail Bomb" },
                "MUSCLE": { weight: 20.7, item: "China Lake" },
                "CAT BURGLAR": { weight: 16.0, item: "Hard Drive" },
                "ENGINEER": { weight: 15.2, item: "PSU" },
                "KIDNAPPER": { weight: 12.9, item: "Igniter Cord" },
                "HACKER": { weight: 11.2, item: "Tunneling Virus" }
            }
        },

        // --- LEVEL 10 ---
        "Crane Reaction": {
            level: 10,
            roles: {
                "SNIPER": { weight: 40.7, item: null },
                "LOOKOUT": { weight: 16.6, item: "Binoculars" },
                "BOMBER": { weight: 15.9, item: "Remote Detonator" },
                "MUSCLE #1": { weight: 10.7, item: null },
                "ENGINEER": { weight: 8.3, item: "Shaped Charge" },
                "MUSCLE #2": { weight: 7.8, item: "Tear Gas" }
            }
        }
    };

    let settings = loadSettings();
    let normalizedDB = {};
    let scannedPageOCs = [];
    let liveFilterMode = 'all'; // 'all' | 'recruiting' | 'warnings'
    let dbLevelFilter = 'all';
    let uiBuilt = false;
    let stylesInjected = false;
    let observer = null;
    let isProcessingDOM = false;
    let debounceTimer = null;

    // =========================================================================
    // 3. HELPER FUNCTIONS
    // =========================================================================
    function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return {
                ...DEFAULT_SETTINGS,
                ...saved,
                btnPos: { ...DEFAULT_SETTINGS.btnPos, ...(saved?.btnPos || {}) }
            };
        } catch {
            return { ...DEFAULT_SETTINGS };
        }
    }

    function saveSettings() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        updateCSSVariables();
        processAllCrimes(true);
    }

    function normalizeStr(str) {
        return (str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');
    }

    function hexToRgba(hex, alpha) {
        let c = (hex || '#ff4d4d').replace('#', '');
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const num = parseInt(c, 16);
        return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
    }

    function isItemConsumable(itemName) {
        if (!itemName) return false;
        return CONSUMABLE_ITEMS.has(itemName.trim().toLowerCase());
    }

    function getOCRecommendedMinCPR(level, weight) {
        if (weight <= 0 || weight < 5.0) return 0;

        if (level >= 8) {
            if (weight >= 35.0) return 80;
            if (weight >= ANCHOR_MIN) return 75;
            if (weight >= SECONDARY_MIN) return 70;
            return 60;
        }
        if (level === 7) {
            if (weight >= ANCHOR_MIN) return 80;
            if (weight >= SECONDARY_MIN) return 75;
            return 65;
        }
        // Levels 1-6: Standard safe CPR targets (aligned with Torn's 80+ green / 75+ safe curve)
        if (weight >= ANCHOR_MIN) return 80;
        if (weight >= SECONDARY_MIN) return 75;
        return 70;
    }

    // Strict Fail Badge Risk Classifier: Combines Slot Fail % and Weighted OC Pull-Down
    function getFailBadgeRiskClass(cpr, slotFail, weightedFail, recMinCPR, weight) {
        if (weight <= 0) return 'risk-low';

        // Low-impact / Recon slots (<14% weight)
        if (weight < SECONDARY_MIN) {
            if (slotFail >= 35 || weightedFail >= 4.0) return 'risk-high';
            if (slotFail > 20 || weightedFail >= 2.2) return 'risk-med';
            return 'risk-low';
        }

        // Anchor (20%+) & Secondary (14%-19.9%) roles:
        // Never show green if CPR < 80% (Fail > 20%) or if pulling OC down by 3.5%+
        if (slotFail >= 26 || weightedFail >= 6.0 || (recMinCPR > 0 && cpr < recMinCPR - 5)) {
            return 'risk-high'; // Red: 26%+ slot fail (<=74% CPR) or -6.0%+ OC pull-down
        }
        if (slotFail > 15 || weightedFail >= 3.0 || (recMinCPR > 0 && cpr < recMinCPR)) {
            return 'risk-med';  // Yellow: 16%-25% slot fail (75%-84% CPR) or -3.0%+ OC pull-down
        }
        return 'risk-low';      // Green: <=15% slot fail (85%+ CPR) and low OC pull-down
    }

    function compareVersions(v1, v2) {
        const p1 = String(v1).split('.').map(n => parseInt(n, 10) || 0);
        const p2 = String(v2).split('.').map(n => parseInt(n, 10) || 0);
        const len = Math.max(p1.length, p2.length);
        for (let i = 0; i < len; i++) {
            const a = p1[i] || 0;
            const b = p2[i] || 0;
            if (a > b) return 1;
            if (a < b) return -1;
        }
        return 0;
    }

    function fetchRemoteScriptText() {
        const gmXhr = (typeof GM_xmlhttpRequest === 'function')
            ? GM_xmlhttpRequest
            : (typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function')
                ? GM.xmlHttpRequest
                : null;

        if (gmXhr) {
            return new Promise((resolve, reject) => {
                gmXhr({
                    method: 'GET',
                    url: `${GITHUB_RAW_URL}?t=${Date.now()}`,
                    headers: { 'Cache-Control': 'no-cache' },
                    onload: (res) => {
                        if (res.status >= 200 && res.status < 300 && res.responseText) {
                            resolve(res.responseText);
                        } else {
                            reject(new Error(`HTTP ${res.status}`));
                        }
                    },
                    onerror: () => reject(new Error('GM_xmlhttpRequest network error')),
                    ontimeout: () => reject(new Error('GM_xmlhttpRequest timeout'))
                });
            });
        }

        return fetch(`${GITHUB_API_URL}?t=${Date.now()}`, { cache: 'no-store' })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(data => {
                if (data && data.content) {
                    return atob(data.content.replace(/\s/g, ''));
                }
                throw new Error('Empty API content');
            });
    }

    async function checkForUpdates() {
        const statusEl = document.getElementById('zem-update-status');
        const btnEl = document.getElementById('zem-btn-check-update');
        if (!statusEl || !btnEl) return;

        btnEl.disabled = true;
        btnEl.textContent = 'Checking...';
        statusEl.textContent = 'Contacting GitHub...';
        statusEl.style.color = '#9ca3af';

        try {
            const scriptText = await fetchRemoteScriptText();
            const match = scriptText.match(/@version\s+([^\s\r\n]+)/);

            if (!match || !match[1]) {
                throw new Error('Could not parse @version from GitHub');
            }

            const remoteVersion = match[1].trim();
            const cmp = compareVersions(remoteVersion, SCRIPT_VERSION);

            if (cmp > 0) {
                statusEl.innerHTML = `<span style="color:#fbbf24; font-weight:700;">Update available: v${remoteVersion}</span>`;
                btnEl.textContent = `Install v${remoteVersion}`;
                btnEl.disabled = false;
                btnEl.style.borderColor = '#10b981';
                btnEl.style.color = '#34d399';
                btnEl.onclick = () => {
                    window.open(`${INSTALL_URL}?t=${Date.now()}`, '_blank');
                };
            } else {
                statusEl.innerHTML = `<span style="color:#34d399;">Up to date (v${SCRIPT_VERSION})</span>`;
                btnEl.textContent = 'Check for Updates';
                btnEl.disabled = false;
            }
        } catch (err) {
            statusEl.innerHTML = `<span style="color:#f87171;" title="${(err && err.message) || 'Unknown error'}">Check failed (Allow domain in Tampermonkey)</span>`;
            btnEl.textContent = 'Retry Check';
            btnEl.disabled = false;
        }
    }

    function buildNormalizedDB() {
        normalizedDB = {};
        for (const [ocName, ocObj] of Object.entries(OC_DATABASE)) {
            const ocKey = normalizeStr(ocName);
            let totalWeight = 0;
            const rolesMap = {};

            for (const [roleName, roleInfo] of Object.entries(ocObj.roles)) {
                totalWeight += roleInfo.weight;
                rolesMap[normalizeStr(roleName)] = {
                    displayName: roleName.toUpperCase(),
                    weight: roleInfo.weight,
                    item: roleInfo.item,
                    consumable: isItemConsumable(roleInfo.item),
                    recMinCPR: getOCRecommendedMinCPR(ocObj.level, roleInfo.weight)
                };
            }

            normalizedDB[ocKey] = {
                displayName: ocName,
                level: ocObj.level,
                isAlias: !!ocObj.isAlias,
                totalWeight: +totalWeight.toFixed(1),
                roles: rolesMap
            };
        }
    }

    function resolveRoleData(ocEntry, rawRoleText, roleCounts) {
        const normRole = normalizeStr(rawRoleText);
        roleCounts[normRole] = (roleCounts[normRole] || 0) + 1;

        if (ocEntry.roles[normRole]) {
            return ocEntry.roles[normRole];
        }

        const numberedKey = normalizeStr(`${rawRoleText} #${roleCounts[normRole]}`);
        if (ocEntry.roles[numberedKey]) {
            return ocEntry.roles[numberedKey];
        }

        const baseNorm = normalizeStr(rawRoleText.replace(/\s*#?\d+$/, ''));
        if (ocEntry.roles[baseNorm]) {
            return ocEntry.roles[baseNorm];
        }

        return null;
    }

    function isOCTabActive() {
        if (!location.href.includes('factions.php')) return false;
        if (location.hash.includes('tab=crimes')) return true;
        const crimeRoot = document.querySelector('#faction-crimes, [class*="crimesWrapper___"], [data-oc-id]');
        return !!(crimeRoot && crimeRoot.offsetParent !== null);
    }

    function extractSlotCPR(slot, roleTitleEl) {
        const walker = document.createTreeWalker(slot, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
            const parent = node.parentElement;
            if (!parent) continue;
            if (parent.closest('.zem-oc-slot-footer')) continue;
            if (roleTitleEl && roleTitleEl.contains(parent)) continue;

            const txt = node.textContent.trim();
            const pctMatch = txt.match(/^(\d{1,3}(?:\.\d+)?)\s*%?$/);
            if (pctMatch) {
                const val = parseFloat(pctMatch[1]);
                const cls = (parent.className || '').toLowerCase();
                if (cls.includes('chance') || cls.includes('rate') || cls.includes('success') || cls.includes('cpr') || cls.includes('percent') || txt.includes('%')) {
                    if (val >= 0 && val <= 100) return val;
                }
            }
        }

        const rateEl = slot.querySelector('[class*="chance"], [class*="rate"], [class*="success"], [class*="percent"]');
        if (rateEl && !rateEl.closest('.zem-oc-slot-footer')) {
            const m = rateEl.textContent.trim().match(/(\d{1,3}(?:\.\d+)?)/);
            if (m) {
                const v = parseFloat(m[1]);
                if (v >= 0 && v <= 100) return v;
            }
        }
        return null;
    }

    function extractPlayerInfo(slot, roleTitleEl) {
        let xid = null;
        let candidateName = '';

        const isIgnoredLabel = (str) => {
            if (!str) return true;
            const s = str.trim();
            if (!s || /^\d+(\.\d+)?%?$/.test(s)) return true;
            return /^(view profile|profile|join|assign|empty|open|slot|recruit|waiting|planning|ready|preparing|locked|cancel|leave|\?)$/i.test(s);
        };

        const profileLink = slot.querySelector('a[href*="profiles.php?XID="]');
        if (profileLink) {
            const xidMatch = profileLink.href.match(/XID=(\d+)/i);
            if (xidMatch) xid = xidMatch[1];

            const honorSpans = profileLink.querySelectorAll('[class*="honor-text-svg"] span, [class*="honor-text"], [class*="userName"], [class*="name"]');
            if (honorSpans.length > 0) {
                const combined = Array.from(honorSpans).map(el => el.textContent).join('').trim();
                if (!isIgnoredLabel(combined)) candidateName = combined;
            }

            if (!candidateName) {
                const rawLinkTxt = (profileLink.textContent || '').replace(/view profile/ig, '').trim();
                if (!isIgnoredLabel(rawLinkTxt)) candidateName = rawLinkTxt;
            }

            if (!candidateName) {
                const img = profileLink.querySelector('img[alt]');
                if (img) {
                    const altTxt = img.getAttribute('alt').replace(/('s banner|banner|avatar|profile)/ig, '').trim();
                    if (!isIgnoredLabel(altTxt)) candidateName = altTxt;
                }
            }
        }

        if (!candidateName && !xid) {
            const honorEl = slot.querySelector('[class*="honor-text"]:not([class*="svg"]), [class*="userName"], [class*="playerName"], [class*="memberName"]');
            if (honorEl && (!roleTitleEl || !roleTitleEl.contains(honorEl))) {
                const txt = (honorEl.textContent || '').replace(/view profile/ig, '').trim();
                if (!isIgnoredLabel(txt)) candidateName = txt;
            }
        }

        // Fallback: Check honor bar banner image inside the slot (e.g. completed/failed OCs where links may differ)
        if (!candidateName && !xid) {
            const imgs = slot.querySelectorAll('img[alt], img[src*="honor"]');
            for (const img of imgs) {
                const altTxt = (img.getAttribute('alt') || '').replace(/('s banner|banner|avatar|view profile)/ig, '').trim();
                if (!isIgnoredLabel(altTxt) && altTxt.length >= 2 && altTxt.length <= 20) {
                    candidateName = altTxt;
                    break;
                }
                if ((img.src || '').includes('honor')) {
                    candidateName = 'Member';
                    break;
                }
            }
        }

        if (candidateName || xid) {
            return {
                name: candidateName || (xid ? `Player [${xid}]` : 'Member'),
                xid,
                filled: true
            };
        }

        return { name: null, xid: null, filled: false };
    }

    function extractOCTimer(ocNode) {
        const text = ocNode.textContent || '';
        const m = text.match(/\b(\d{2}:\d{2}:\d{2}(?::\d{2})?)\b/);
        return m ? m[1] : null;
    }

    // =========================================================================
    // 4. MODERN DESIGN SYSTEM & COMPACT NON-CLIPPING CARD CSS
    // =========================================================================
    function updateCSSVariables() {
        const root = document.documentElement;
        const showFooter = settings.showWeightBadges || settings.showFailChances;

        root.style.setProperty('--zem-anchor-color', settings.anchorColor);
        root.style.setProperty('--zem-anchor-bg', hexToRgba(settings.anchorColor, 0.14));
        root.style.setProperty('--zem-anchor-glow', hexToRgba(settings.anchorColor, 0.35));
        root.style.setProperty('--zem-anchor-shadow', hexToRgba(settings.anchorColor, 0.28));

        root.style.setProperty('--zem-sec-color', settings.secondaryColor);
        root.style.setProperty('--zem-sec-bg', hexToRgba(settings.secondaryColor, 0.11));
        root.style.setProperty('--zem-sec-shadow', hexToRgba(settings.secondaryColor, 0.20));

        root.style.setProperty('--zem-low-color', settings.lowColor);
        root.style.setProperty('--zem-low-border', hexToRgba(settings.lowColor, 0.75));
        root.style.setProperty('--zem-low-bg', hexToRgba(settings.lowColor, 0.09));

        root.style.setProperty('--zem-footer-display', showFooter ? 'flex' : 'none');
        root.style.setProperty('--zem-weight-display', settings.showWeightBadges ? 'inline-flex' : 'none');
        root.style.setProperty('--zem-fail-display', settings.showFailChances ? 'inline-flex' : 'none');
    }

    function injectDynamicStyles() {
        updateCSSVariables();
        if (stylesInjected && document.getElementById('zem-oc-helper-styles')) return;

        let styleEl = document.getElementById('zem-oc-helper-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'zem-oc-helper-styles';
            document.head.appendChild(styleEl);
        }

        styleEl.textContent = `
            /* Native Crime Card Highlights - Exact v2.5.6 non-clipping sizing */
            .zem-oc-role-anchor,
            .zem-oc-role-secondary,
            .zem-oc-role-low {
                border-radius: 6px !important;
                position: relative !important;
                box-sizing: border-box !important;
                transition: box-shadow 0.2s ease, border-color 0.2s ease;
            }

            .zem-oc-role-anchor {
                border: 1.5px solid var(--zem-anchor-color) !important;
                background: linear-gradient(180deg, var(--zem-anchor-bg) 0%, rgba(15,15,15,0.45) 100%) !important;
                box-shadow: 0 2px 8px var(--zem-anchor-shadow), inset 0 1px 0 var(--zem-anchor-glow) !important;
            }

            .zem-oc-role-secondary {
                border: 1.5px solid var(--zem-sec-color) !important;
                background: linear-gradient(180deg, var(--zem-sec-bg) 0%, rgba(15,15,15,0.4) 100%) !important;
                box-shadow: 0 2px 6px var(--zem-sec-shadow) !important;
            }

            .zem-oc-role-low {
                border: 1px solid var(--zem-low-border) !important;
                background: linear-gradient(180deg, var(--zem-low-bg) 0%, rgba(15,15,15,0.35) 100%) !important;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3) !important;
            }

            /* Compact Non-Clipping Bottom Footer Inside Role Card */
            .zem-oc-slot-footer {
                display: var(--zem-footer-display, flex);
                align-items: center;
                justify-content: space-between;
                gap: 2px;
                width: 100%;
                box-sizing: border-box;
                padding: 3px 5px;
                margin-top: 4px;
                background: rgba(10, 10, 12, 0.90);
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                border-bottom-left-radius: 5px;
                border-bottom-right-radius: 5px;
                font-family: Arial, sans-serif;
                font-size: 9.5px;
                line-height: 1.15;
                white-space: nowrap;
                z-index: 3;
                clear: both;
            }

            .zem-oc-impact-pill {
                display: var(--zem-weight-display, inline-flex);
                align-items: center;
                font-weight: 700;
                letter-spacing: -0.1px;
            }
            .zem-oc-impact-pill.tier-anchor { color: var(--zem-anchor-color); }
            .zem-oc-impact-pill.tier-secondary { color: var(--zem-sec-color); }
            .zem-oc-impact-pill.tier-low { color: var(--zem-low-color); }

            .zem-oc-fail-pill {
                display: var(--zem-fail-display, inline-flex);
                align-items: center;
                font-weight: 700;
                padding: 1px 3px;
                border-radius: 3px;
                font-size: 9.5px;
                letter-spacing: -0.1px;
                margin-left: auto;
            }
            .zem-oc-fail-pill.risk-low {
                color: #69db7c;
                background: rgba(43, 138, 62, 0.24);
            }
            .zem-oc-fail-pill.risk-med {
                color: #ffd43b;
                background: rgba(230, 119, 0, 0.26);
            }
            .zem-oc-fail-pill.risk-high {
                color: #ff8787;
                background: rgba(201, 42, 42, 0.34);
            }
            .zem-oc-fail-pill.risk-open {
                color: #74c0fc;
                background: rgba(24, 100, 171, 0.24);
            }

            /* Crime Header Pass / Fail Summary Pill */
            .zem-oc-header-summary {
                display: var(--zem-fail-display, inline-flex);
                align-items: center;
                gap: 8px;
                margin-left: 12px;
                padding: 3px 10px;
                border-radius: 20px;
                font-family: Arial, sans-serif;
                font-size: 11.5px;
                font-weight: 700;
                background: rgba(18, 18, 20, 0.92);
                border: 1px solid rgba(255, 255, 255, 0.14);
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
                vertical-align: middle;
                line-height: 1.2;
            }
            .zem-oc-header-summary .zem-pass-txt {
                color: #69db7c;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            .zem-oc-header-summary .zem-pass-txt::before {
                content: '';
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #51cf66;
                box-shadow: 0 0 4px #51cf66;
            }
            .zem-oc-header-summary .zem-pass-txt.pass-med { color: #ffd43b; }
            .zem-oc-header-summary .zem-pass-txt.pass-med::before {
                background: #fcc419;
                box-shadow: 0 0 4px #fcc419;
            }
            .zem-oc-header-summary .zem-pass-txt.pass-low { color: #ff8787; }
            .zem-oc-header-summary .zem-pass-txt.pass-low::before {
                background: #ff6b6b;
                box-shadow: 0 0 4px #ff6b6b;
            }
            .zem-oc-header-summary .zem-fail-txt { color: #ff7676; }
            .zem-oc-header-summary .zem-est-txt {
                color: #aaa;
                font-weight: 500;
                font-size: 10.5px;
            }

            /* Redesigned Tactical SVG Floating Button */
            #zem-oc-float-btn {
                position: fixed;
                z-index: 99998;
                width: 48px;
                height: 48px;
                border-radius: 14px;
                background: radial-gradient(circle at 30% 25%, #2a2d3a 0%, #14161d 100%);
                border: 1.5px solid var(--zem-anchor-color);
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.75), 0 0 12px var(--zem-anchor-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.12);
                color: #fff;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1px;
                cursor: grab;
                user-select: none;
                transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.18s ease, border-color 0.2s ease;
                touch-action: none;
            }
            #zem-oc-float-btn:hover {
                transform: translateY(-2px) scale(1.04);
                box-shadow: 0 8px 22px rgba(0, 0, 0, 0.85), 0 0 16px var(--zem-anchor-glow), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            #zem-oc-float-btn:active {
                cursor: grabbing;
                transform: scale(0.97);
            }
            #zem-oc-float-btn svg {
                width: 22px;
                height: 22px;
                stroke: var(--zem-anchor-color);
                filter: drop-shadow(0 0 4px var(--zem-anchor-shadow));
                transition: transform 0.25s ease;
            }
            #zem-oc-float-btn:hover svg {
                transform: rotate(15deg) scale(1.06);
            }
            #zem-oc-float-btn .zem-btn-lbl {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                font-size: 8.5px;
                font-weight: 800;
                letter-spacing: 0.8px;
                color: #e5e7eb;
                line-height: 1;
                text-transform: uppercase;
            }

            /* Modern Glassmorphic Modal */
            #zem-oc-modal {
                position: fixed;
                z-index: 99999;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.98);
                width: 650px;
                max-width: 96vw;
                height: 620px;
                max-height: 88vh;
                background: #121318;
                border: 1px solid #2b2e3b;
                border-top: 3px solid var(--zem-anchor-color);
                border-radius: 12px;
                box-shadow: 0 24px 60px rgba(0, 0, 0, 0.92), 0 0 0 1px rgba(255, 255, 255, 0.04);
                color: #e5e7eb;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                display: none;
                flex-direction: column;
                overflow: hidden;
                opacity: 0;
                transition: opacity 0.15s ease, transform 0.15s ease;
            }
            #zem-oc-modal.open {
                display: flex;
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }

            /* Custom Scrollbar */
            .zem-modal-body::-webkit-scrollbar { width: 6px; }
            .zem-modal-body::-webkit-scrollbar-track { background: #121318; }
            .zem-modal-body::-webkit-scrollbar-thumb { background: #2e3240; border-radius: 3px; }
            .zem-modal-body::-webkit-scrollbar-thumb:hover { background: #43485c; }

            /* Modal Header */
            .zem-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 13px 18px;
                background: linear-gradient(180deg, #1b1d26 0%, #15171e 100%);
                border-bottom: 1px solid #262936;
                flex-shrink: 0;
            }
            .zem-brand-wrap {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .zem-brand-icon {
                width: 28px;
                height: 28px;
                border-radius: 7px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .zem-brand-icon svg {
                width: 17px;
                height: 17px;
                stroke: var(--zem-anchor-color);
            }
            .zem-brand-title {
                font-weight: 800;
                font-size: 14px;
                color: #f9fafb;
                letter-spacing: -0.2px;
            }
            .zem-title-ver {
                font-size: 10px;
                font-weight: 700;
                color: #9ca3af;
                background: #232632;
                border: 1px solid #34384a;
                padding: 1.5px 6px;
                border-radius: 999px;
                margin-left: 6px;
                vertical-align: middle;
            }
            .zem-modal-close {
                cursor: pointer;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                color: #9ca3af;
                width: 28px;
                height: 28px;
                border-radius: 7px;
                font-size: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
                transition: all 0.15s ease;
            }
            .zem-modal-close:hover {
                background: rgba(239, 68, 68, 0.16);
                border-color: rgba(239, 68, 68, 0.4);
                color: #f87171;
            }

            /* Segmented Navigation Bar */
            .zem-modal-tabs {
                display: flex;
                gap: 6px;
                padding: 8px 16px;
                background: #15171e;
                border-bottom: 1px solid #252834;
                flex-shrink: 0;
            }
            .zem-tab-btn {
                flex: 1;
                padding: 7px 8px;
                text-align: center;
                cursor: pointer;
                background: transparent;
                border: 1px solid transparent;
                border-radius: 7px;
                color: #9ca3af;
                font-weight: 700;
                font-size: 11.5px;
                transition: all 0.15s ease;
            }
            .zem-tab-btn:hover {
                color: #e5e7eb;
                background: rgba(255, 255, 255, 0.03);
            }
            .zem-tab-btn.active {
                color: #fff;
                background: #222634;
                border-color: #353b4f;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            }

            /* Modal Body */
            .zem-modal-body {
                padding: 16px;
                overflow-y: auto;
                font-size: 12px;
                flex: 1;
                line-height: 1.5;
                box-sizing: border-box;
                font-variant-numeric: tabular-nums;
            }

            /* KPI Metrics Row */
            .zem-kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                margin-bottom: 14px;
            }
            .zem-kpi-box {
                background: linear-gradient(180deg, #1b1e28 0%, #161821 100%);
                border: 1px solid #292d3d;
                border-radius: 8px;
                padding: 9px 8px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .zem-kpi-val {
                font-size: 16px;
                font-weight: 800;
                color: #f9fafb;
                letter-spacing: -0.3px;
            }
            .zem-kpi-lbl {
                font-size: 9.5px;
                font-weight: 600;
                color: #8b92a5;
                margin-top: 2px;
                text-transform: uppercase;
                letter-spacing: 0.4px;
            }

            /* Filter & Action Bar */
            .zem-filter-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 12px;
            }
            .zem-filter-group {
                display: flex;
                gap: 5px;
                background: #171922;
                padding: 3px;
                border-radius: 7px;
                border: 1px solid #262a38;
            }
            .zem-filter-pill {
                background: transparent;
                color: #9ca3af;
                border: none;
                padding: 4px 10px;
                border-radius: 5px;
                font-size: 11px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.15s ease;
            }
            .zem-filter-pill:hover { color: #e5e7eb; }
            .zem-filter-pill.active {
                background: #282c3c;
                color: #fff;
                box-shadow: 0 1px 2px rgba(0,0,0,0.25);
            }

            /* Live Crime Card */
            .zem-live-card {
                background: #181a22;
                border: 1px solid #282c3a;
                border-radius: 9px;
                padding: 12px 14px;
                margin-bottom: 11px;
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
            }
            .zem-live-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 6px;
                padding-bottom: 9px;
                margin-bottom: 8px;
                border-bottom: 1px solid #252836;
            }
            .zem-status-badge {
                font-size: 9.5px;
                font-weight: 800;
                padding: 2px 7px;
                border-radius: 999px;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            .zem-status-planning { background: rgba(56, 217, 169, 0.15); color: #38d9a9; border: 1px solid rgba(56, 217, 169, 0.35); }
            .zem-status-recruiting { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.35); }

            .zem-live-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11.5px;
            }
            .zem-live-table th {
                text-align: left;
                color: #8b92a5 !important;
                font-weight: 700;
                padding: 5px 6px;
                border-bottom: 1px solid #262936;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            .zem-live-table td {
                padding: 5.5px 6px;
                border-bottom: 1px solid #20232f;
                color: #d1d5db !important;
            }
            .zem-live-table tr:last-child td { border-bottom: none; }
            .zem-live-table tr:hover td { background: rgba(255, 255, 255, 0.02); }

            /* Item Usage Tags */
            .zem-item-tag {
                font-size: 9px;
                padding: 1px 5px;
                border-radius: 4px;
                margin-left: 4px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.2px;
            }
            .zem-item-used {
                color: #f87171;
                background: rgba(239, 68, 68, 0.16);
                border: 1px solid rgba(239, 68, 68, 0.28);
            }
            .zem-item-kept {
                color: #60a5fa;
                background: rgba(59, 130, 246, 0.16);
                border: 1px solid rgba(59, 130, 246, 0.28);
            }

            /* Database Search & Level Select */
            .zem-db-controls {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
            }
            .zem-search-input {
                flex: 1;
                box-sizing: border-box;
                padding: 8px 12px;
                background: #171922;
                border: 1px solid #2e3344;
                border-radius: 7px;
                color: #f9fafb;
                font-size: 12px;
                outline: none;
                transition: border-color 0.15s ease;
            }
            .zem-search-input:focus { border-color: var(--zem-anchor-color); }
            .zem-level-select {
                padding: 8px 10px;
                background: #171922;
                border: 1px solid #2e3344;
                border-radius: 7px;
                color: #e5e7eb;
                font-size: 11.5px;
                font-weight: 600;
                cursor: pointer;
                outline: none;
            }

            .zem-info-card {
                background: #181a22;
                border: 1px solid #282c3a;
                border-radius: 9px;
                padding: 11px 13px;
                margin-bottom: 10px;
            }
            .zem-info-title {
                font-weight: 700;
                color: #f9fafb;
                margin-bottom: 9px;
                font-size: 13px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .zem-level-badge {
                background: #252938;
                color: #d1d5db;
                border: 1px solid #34394d;
                padding: 2px 8px;
                border-radius: 6px;
                font-size: 10.5px;
                font-weight: 700;
            }
            .zem-info-roles-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 7px;
            }
            .zem-info-role-item {
                display: flex;
                flex-direction: column;
                padding: 6px 9px;
                border-radius: 6px;
                background: #13151c;
                border: 1px solid #222532;
                font-size: 11.5px;
            }
            .zem-info-role-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .zem-info-role-sub {
                font-size: 10px;
                color: #9ca3af;
                margin-top: 3px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            /* Settings Tab */
            .zem-settings-card {
                background: #181a22;
                border: 1px solid #282c3a;
                border-radius: 9px;
                padding: 6px 14px;
                margin-bottom: 12px;
            }
            .zem-setting-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #232734;
            }
            .zem-setting-row:last-child { border-bottom: none; }
            .zem-setting-row label {
                color: #e5e7eb;
                font-weight: 600;
                font-size: 12px;
            }
            .zem-setting-sub {
                display: block;
                font-size: 10.5px;
                color: #8b92a5;
                font-weight: 400;
                margin-top: 1px;
            }
            .zem-setting-row input[type="color"] {
                border: 1px solid #3f4458;
                border-radius: 6px;
                width: 40px;
                height: 26px;
                cursor: pointer;
                background: #121318;
                padding: 2px;
            }

            /* Redesigned "How It Works" Guide Layout */
            .zem-guide-hero {
                background: linear-gradient(135deg, rgba(255, 77, 77, 0.1) 0%, rgba(56, 217, 169, 0.06) 100%);
                border: 1px solid #2c3142;
                border-radius: 9px;
                padding: 12px 14px;
                margin-bottom: 12px;
            }
            .zem-guide-hero h4 {
                margin: 0 0 4px 0;
                font-size: 13.5px;
                color: #fff;
            }
            .zem-guide-hero p {
                margin: 0;
                color: #cbd5e1;
                font-size: 11.5px;
            }
            .zem-tier-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                margin-bottom: 12px;
            }
            .zem-tier-card {
                background: #181a22;
                border: 1px solid #282c3a;
                border-radius: 8px;
                padding: 10px;
            }
            .zem-tier-card-hdr {
                font-weight: 800;
                font-size: 11.5px;
                margin-bottom: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .zem-tier-card p {
                margin: 0;
                font-size: 11px;
                color: #9ca3af;
                line-height: 1.4;
            }
            .zem-guide-2col {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin-bottom: 12px;
            }
            .zem-guide-box {
                background: #181a22;
                border: 1px solid #282c3a;
                border-radius: 9px;
                padding: 11px 13px;
                margin-bottom: 10px;
            }
            .zem-guide-box h4 {
                margin: 0 0 6px 0;
                color: #f9fafb;
                font-size: 12.5px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .zem-guide-box p {
                margin: 0 0 6px 0;
                color: #9ca3af;
                font-size: 11.5px;
            }
            .zem-guide-box p:last-child { margin-bottom: 0; }
            .zem-demo-pill-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #111319;
                border: 1px solid #242836;
                padding: 5px 8px;
                border-radius: 5px;
                margin-top: 6px;
                font-size: 10px;
            }

            /* Buttons */
            .zem-btn {
                background: #232735;
                color: #e5e7eb;
                border: 1px solid #383e52;
                padding: 5.5px 11px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 5px;
                transition: all 0.15s ease;
            }
            .zem-btn:hover {
                background: #2e3346;
                border-color: #4a526d;
                color: #fff;
            }
            .zem-btn:disabled { opacity: 0.55; cursor: default; }
            .zem-dev-btn {
                background: rgba(16, 185, 129, 0.14);
                border-color: rgba(16, 185, 129, 0.35);
                color: #34d399;
                font-weight: 700;
            }
            .zem-dev-btn:hover {
                background: rgba(16, 185, 129, 0.24);
                color: #6ee7b7;
            }
        `;
        stylesInjected = true;
    }

    // =========================================================================
    // 5. DOM SCANNER & HIGHLIGHTER
    // =========================================================================
    function getTitleElement(ocNode) {
        return ocNode.querySelector('[class*="panelTitle___"]');
    }

    function getCleanOCName(titleEl) {
        if (!titleEl) return null;
        const clone = titleEl.cloneNode(true);
        const injected = clone.querySelector('.zem-oc-header-summary');
        if (injected) injected.remove();
        return clone.textContent.trim();
    }

    function processSingleOC(ocNode, forceReprocess = false) {
        const titleEl = getTitleElement(ocNode);
        const ocNameRaw = getCleanOCName(titleEl);
        if (!ocNameRaw) return null;

        const ocEntry = normalizedDB[normalizeStr(ocNameRaw)];
        if (!ocEntry) return null;

        let roleSlots = Array.from(ocNode.querySelectorAll('[class*="contentLayer___"] > [class*="wrapper___"] > [class*="wrapper___"]'));
        if (roleSlots.length === 0) {
            roleSlots = Array.from(ocNode.querySelectorAll('[class*="wrapper___"]')).filter(el => el.querySelector('[class*="title___"]'));
        }
        if (roleSlots.length === 0) return null;

        const roleCounts = {};
        let rawWeightedPassSum = 0;
        let matchedWeightSum = 0;
        let filledSlotsCount = 0;
        let totalSlotsCount = 0;
        let hasLowCPRWarning = false;
        let cprSignatureList = [];
        let slotDetails = [];

        roleSlots.forEach(slot => {
            const roleTitleEl = slot.querySelector('[class*="title___"]');
            if (!roleTitleEl) return;

            const rawRoleText = roleTitleEl.textContent.trim();
            const roleData = resolveRoleData(ocEntry, rawRoleText, roleCounts);
            if (!roleData) return;

            totalSlotsCount++;
            const weight = roleData.weight;
            const recMinCPR = roleData.recMinCPR;
            matchedWeightSum += weight;

            const player = extractPlayerInfo(slot, roleTitleEl);
            const isSlotFilled = player.filled;
            const rawDisplayedCPR = extractSlotCPR(slot, roleTitleEl);

            const memberCPR = isSlotFilled ? rawDisplayedCPR : null;
            const userPreviewCPR = !isSlotFilled ? rawDisplayedCPR : null;

            cprSignatureList.push(`${weight}:${isSlotFilled ? 'F' : 'E'}:${rawDisplayedCPR}:${player.name || ''}`);

            const baselineEmptyCPR = recMinCPR > 0 ? recMinCPR : 75;
            const effectiveTeamCPR = memberCPR !== null ? memberCPR : baselineEmptyCPR;
            const slotFail = memberCPR !== null ? Math.max(0, 100 - memberCPR) : Math.max(0, 100 - baselineEmptyCPR);
            const weightedFail = +(slotFail * (weight / 100)).toFixed(1);

            const riskClass = isSlotFilled && memberCPR !== null
                ? getFailBadgeRiskClass(memberCPR, slotFail, weightedFail, recMinCPR, weight)
                : 'risk-open';

            const isBelowRec = isSlotFilled && memberCPR !== null && (riskClass === 'risk-high' || (recMinCPR > 0 && memberCPR < recMinCPR));
            if (isBelowRec) hasLowCPRWarning = true;

            if (isSlotFilled) {
                filledSlotsCount++;
            }
            rawWeightedPassSum += (effectiveTeamCPR * weight);

            slotDetails.push({
                roleName: roleData.displayName,
                weight,
                item: roleData.item,
                consumable: roleData.consumable,
                recMinCPR,
                cpr: memberCPR,
                userPreviewCPR,
                slotFail,
                weightedFail,
                riskClass,
                isBelowRec,
                playerName: player.name,
                playerXid: player.xid,
                isFilled: isSlotFilled
            });

            const sig = `${weight}_${isSlotFilled ? 'F' : 'E'}_${rawDisplayedCPR}_${riskClass}`;
            if (!forceReprocess && slot.dataset.zemOcSig === sig) return;

            const isAnchor = weight >= ANCHOR_MIN;
            const isSecondary = !isAnchor && weight >= SECONDARY_MIN;

            slot.classList.remove('zem-oc-role-anchor', 'zem-oc-role-secondary', 'zem-oc-role-low');
            const oldFooter = slot.querySelector('.zem-oc-slot-footer');
            if (oldFooter) oldFooter.remove();

            const tierClass = isAnchor ? 'tier-anchor' : isSecondary ? 'tier-secondary' : 'tier-low';
            if (isAnchor) {
                slot.classList.add('zem-oc-role-anchor');
            } else if (isSecondary) {
                slot.classList.add('zem-oc-role-secondary');
            } else {
                slot.classList.add('zem-oc-role-low');
            }

            const footer = document.createElement('div');
            footer.className = 'zem-oc-slot-footer';

            // 1. Compact Impact Pill
            const impPill = document.createElement('span');
            impPill.className = `zem-oc-impact-pill ${tierClass}`;
            const itemTooltip = roleData.item
                ? ` | Item: ${roleData.item} (${roleData.consumable ? 'Used/Consumed' : 'Kept/Reusable'})`
                : '';
            const recText = recMinCPR > 0 ? `${recMinCPR}%+` : 'Any CPR';
            impPill.title = `Role Impact: ${weight.toFixed(1)}% | OC Recommended Min CPR: ${recText}${itemTooltip}`;
            impPill.textContent = `Imp: ${weight.toFixed(1)}%`;
            footer.appendChild(impPill);

            // 2. Compact Fail / Rec Pill
            const failPill = document.createElement('span');
            if (weight === 0) {
                failPill.className = 'zem-oc-fail-pill risk-low';
                failPill.title = '0.0% Impact Role: Zero failure checkpoints (safe for any CPR)';
                failPill.textContent = '0% Risk';
            } else if (isSlotFilled && memberCPR !== null) {
                failPill.className = `zem-oc-fail-pill ${riskClass}`;
                failPill.title = `Joined Member: ${memberCPR}% CPR (OC Rec: ${recText}) | Slot Fail: ${slotFail.toFixed(0)}% | Pulls total OC down by -${weightedFail.toFixed(1)}%`;
                failPill.textContent = `Fail: ${slotFail.toFixed(0)}%`;
            } else {
                const shortRec = recMinCPR > 0 ? `${recMinCPR}%+` : 'Any';
                if (userPreviewCPR !== null) {
                    const userMeetsRec = userPreviewCPR >= recMinCPR;
                    const userSlotFail = Math.max(0, 100 - userPreviewCPR);
                    const userWeightedFail = +(userSlotFail * (weight / 100)).toFixed(1);
                    failPill.className = `zem-oc-fail-pill ${userMeetsRec ? 'risk-low' : 'risk-open'}`;
                    failPill.title = `OPEN SLOT — OC Recommended Min CPR: ${recText} | Your Personal CPR: ${userPreviewCPR}% (${userMeetsRec ? 'Qualifies ✓' : 'Below Rec ⚠'} | Your Fail if joined: ${userSlotFail}% / -${userWeightedFail}% OC)`;
                    failPill.textContent = `${shortRec}${userMeetsRec ? ' ✓' : ''}`;
                } else {
                    failPill.className = 'zem-oc-fail-pill risk-open';
                    failPill.title = `OPEN SLOT — OC Recommended Min CPR: ${recText}`;
                    failPill.textContent = `Rec ${shortRec}`;
                }
            }
            footer.appendChild(failPill);

            slot.appendChild(footer);
            slot.dataset.zemOcSig = sig;
        });

        const hasMembers = filledSlotsCount > 0;
        const normDivisor = matchedWeightSum > 0 ? matchedWeightSum : 100;
        const normalizedPass = rawWeightedPassSum / normDivisor;
        const clampedPass = hasMembers ? Math.min(100, Math.max(0, normalizedPass)) : null;
        const clampedFail = hasMembers ? Math.max(0, 100 - clampedPass) : null;
        const isAllFilled = (filledSlotsCount === totalSlotsCount && totalSlotsCount > 0);
        const timerStr = extractOCTimer(ocNode);

        let status = 'RECRUITING';
        if (isAllFilled) {
            status = (timerStr && timerStr !== '00:00:00' && timerStr !== '00:00:00:00') ? 'PLANNING' : 'READY / PLANNING';
        } else if (filledSlotsCount > 0 && timerStr && !timerStr.startsWith('00:00:00')) {
            status = 'PLANNING (NEEDS FILL)';
        }

        const headerSig = `${filledSlotsCount}_${cprSignatureList.join('|')}`;
        if (titleEl && (forceReprocess || ocNode.dataset.zemHeaderSig !== headerSig)) {
            const oldSummary = titleEl.parentElement.querySelector('.zem-oc-header-summary');
            if (oldSummary) oldSummary.remove();

            if (hasMembers) {
                const summaryEl = document.createElement('span');
                summaryEl.className = 'zem-oc-header-summary';

                const prefix = isAllFilled ? '' : 'Est. ';
                const suffix = isAllFilled ? '' : `<span class="zem-est-txt">(${filledSlotsCount}/${totalSlotsCount})</span>`;
                const passTierClass = clampedPass < 75 ? 'pass-low' : clampedPass < 85 ? 'pass-med' : '';

                summaryEl.title = isAllFilled
                    ? `Total weighted OC Pass/Fail across all ${totalSlotsCount} joined members`
                    : `Estimated OC Pass/Fail (${filledSlotsCount}/${totalSlotsCount} filled; open slots estimated at OC Recommended Min CPR)`;

                summaryEl.innerHTML = `
                    <span class="zem-pass-txt ${passTierClass}">${prefix}Pass: ${clampedPass.toFixed(1)}%</span>
                    <span style="color:#444;">|</span>
                    <span class="zem-fail-txt">Fail: ${clampedFail.toFixed(1)}%</span>
                    ${suffix}
                `;

                titleEl.insertAdjacentElement('afterend', summaryEl);
            }
            ocNode.dataset.zemHeaderSig = headerSig;
        }

        return {
            ocName: ocEntry.displayName,
            level: ocEntry.level,
            status,
            isAllFilled,
            hasMembers,
            hasLowCPRWarning,
            filledSlotsCount,
            totalSlotsCount,
            timer: timerStr || 'N/A',
            passRate: clampedPass,
            failRate: clampedFail,
            slots: slotDetails
        };
    }

    function processAllCrimes(forceReprocess = false) {
        if (!isOCTabActive() || isProcessingDOM) return;
        isProcessingDOM = true;
        try {
            const ocContainers = document.querySelectorAll('[data-oc-id], [class*="crimeWrapper___"]');
            const list = [];
            ocContainers.forEach(node => {
                const data = processSingleOC(node, forceReprocess);
                if (data) list.push(data);
            });
            scannedPageOCs = list;
        } finally {
            isProcessingDOM = false;
        }
    }

    // =========================================================================
    // 6. UI BUILDER & DASHBOARD
    // =========================================================================
    const TACTICAL_SVG_ICON = `
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/>
            <circle cx="12" cy="11" r="3.2"/>
            <path d="M12 5.5v2M12 14.5v2M6.5 11h2M15.5 11h2"/>
        </svg>
    `;

    function clampFloatingButtonPosition() {
        const btn = document.getElementById('zem-oc-float-btn');
        if (!btn) return;
        const maxLeft = Math.max(6, window.innerWidth - 54);
        const maxTop = Math.max(6, window.innerHeight - 54);
        const curLeft = parseInt(btn.style.left, 10) || 20;
        const curTop = parseInt(btn.style.top, 10) || 140;
        btn.style.left = `${Math.max(6, Math.min(maxLeft, curLeft))}px`;
        btn.style.top = `${Math.max(6, Math.min(maxTop, curTop))}px`;
    }

    function copyOpenSlotsToClipboard() {
        const recruitingOCs = (scannedPageOCs || []).filter(o => !o.isAllFilled);
        const copyBtn = document.getElementById('zem-btn-copy-open');
        if (recruitingOCs.length === 0) {
            if (copyBtn) {
                copyBtn.textContent = 'No Open Slots!';
                setTimeout(() => { copyBtn.textContent = 'Copy Open Slots'; }, 1800);
            }
            return;
        }

        const lines = recruitingOCs.map(oc => {
            const openRoles = oc.slots
                .filter(s => !s.isFilled)
                .map(s => {
                    const recStr = s.recMinCPR > 0 ? `Rec ${s.recMinCPR}%+` : 'Any CPR';
                    const itemStr = s.item ? `, Item: ${s.item}` : '';
                    return `${s.roleName} (${s.weight.toFixed(1)}% | ${recStr}${itemStr})`;
                })
                .join(' • ');
            return `[Lv${oc.level} ${oc.ocName} (${oc.filledSlotsCount}/${oc.totalSlotsCount})] Needs: ${openRoles}`;
        });

        navigator.clipboard.writeText(lines.join('\n')).then(() => {
            if (copyBtn) {
                copyBtn.textContent = 'Copied! ✓';
                setTimeout(() => { copyBtn.textContent = 'Copy Open Slots'; }, 1800);
            }
        });
    }

    function buildUI() {
        if (uiBuilt) return;
        uiBuilt = true;

        injectDynamicStyles();

        // Tactical SVG Floating Launcher
        const btn = document.createElement('div');
        btn.id = 'zem-oc-float-btn';
        btn.title = `ZEM's OC 2.0 Helper v${SCRIPT_VERSION} (Click to open, drag to move)`;
        btn.innerHTML = `${TACTICAL_SVG_ICON}<span class="zem-btn-lbl">OC</span>`;
        btn.style.top = settings.btnPos.top;
        btn.style.left = settings.btnPos.left;
        document.body.appendChild(btn);
        clampFloatingButtonPosition();

        window.addEventListener('resize', clampFloatingButtonPosition, { passive: true });

        // Modal Window
        const modal = document.createElement('div');
        modal.id = 'zem-oc-modal';
        modal.innerHTML = `
            <div class="zem-modal-header">
                <div class="zem-brand-wrap">
                    <div class="zem-brand-icon">${TACTICAL_SVG_ICON}</div>
                    <div>
                        <span class="zem-brand-title">ZEM's OC 2.0 Helper</span>
                        <span class="zem-title-ver">v${SCRIPT_VERSION}</span>
                    </div>
                </div>
                <button class="zem-modal-close" title="Close (Esc)">&times;</button>
            </div>
            <div class="zem-modal-tabs">
                <button class="zem-tab-btn active" data-tab="live">Page OCs</button>
                <button class="zem-tab-btn" data-tab="database">All OCs (27)</button>
                <button class="zem-tab-btn" data-tab="guide">How It Works</button>
                <button class="zem-tab-btn" data-tab="settings">Settings</button>
            </div>

            <!-- TAB 1: LIVE PAGE OCs -->
            <div class="zem-modal-body" id="zem-tab-live">
                <div class="zem-filter-bar">
                    <div class="zem-filter-group">
                        <button class="zem-filter-pill active" data-filter="all">All Crimes</button>
                        <button class="zem-filter-pill" data-filter="recruiting">Recruiting</button>
                        <button class="zem-filter-pill" data-filter="warnings">⚠ Below Rec CPR</button>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <button class="zem-btn" id="zem-btn-copy-open" title="Copy open recruiting roles for Faction Chat / Discord">Copy Open Slots</button>
                        <button class="zem-btn" id="zem-btn-refresh-live">Refresh</button>
                    </div>
                </div>
                <div id="zem-live-oc-container"></div>
            </div>

            <!-- TAB 2: ALL OCs DATABASE -->
            <div class="zem-modal-body" id="zem-tab-database" style="display:none;">
                <div class="zem-db-controls">
                    <input type="text" class="zem-search-input" id="zem-info-search" placeholder="Search crime, role, item, or 'used' / 'kept'...">
                    <select class="zem-level-select" id="zem-info-level">
                        <option value="all">All Levels (1–10)</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                        <option value="5">Level 5</option>
                        <option value="6">Level 6</option>
                        <option value="7">Level 7</option>
                        <option value="8">Level 8</option>
                        <option value="9">Level 9</option>
                        <option value="10">Level 10</option>
                    </select>
                </div>
                <div id="zem-info-list-container"></div>
            </div>

            <!-- TAB 3: HOW IT WORKS (REDESIGNED VISUAL GUIDE) -->
            <div class="zem-modal-body" id="zem-tab-guide" style="display:none;">
                <div class="zem-guide-hero">
                    <h4>Quick Coordinator &amp; Member Guide</h4>
                    <p>Every OC 2.0 role has a verified impact weight summing to <strong>100.0%</strong>. Placing high-CPR members in Anchor roles and saving low-weight roles for newer members maximizes faction payout and scope.</p>
                </div>

                <div class="zem-tier-grid">
                    <div class="zem-tier-card" style="border-top: 3px solid var(--zem-anchor-color);">
                        <div class="zem-tier-card-hdr" style="color:var(--zem-anchor-color);">
                            <span>Anchor Roles</span>
                            <span>20%+</span>
                        </div>
                        <p><strong>Carry Slots:</strong> Dictate crime success. Require <strong>75%–80%+ CPR</strong> (Fail &le;20%).</p>
                    </div>
                    <div class="zem-tier-card" style="border-top: 3px solid var(--zem-sec-color);">
                        <div class="zem-tier-card-hdr" style="color:var(--zem-sec-color);">
                            <span>Secondary Roles</span>
                            <span>14%–19.9%</span>
                        </div>
                        <p><strong>Core Support:</strong> Moderate risk. Aim for <strong>70%–75%+ CPR</strong> for reliable clears.</p>
                    </div>
                    <div class="zem-tier-card" style="border-top: 3px solid var(--zem-low-color);">
                        <div class="zem-tier-card-hdr" style="color:var(--zem-low-color);">
                            <span>Low / Recon Roles</span>
                            <span>&lt;14%</span>
                        </div>
                        <p><strong>Safe Slots:</strong> Roles under <strong>5%</strong> (or <em>Gaslight Looter #2</em> at 0%) can take <strong>Any CPR</strong>.</p>
                    </div>
                </div>

                <div class="zem-guide-2col">
                    <div class="zem-guide-box" style="margin-bottom:0;">
                        <h4>1. Empty (?) Slots</h4>
                        <p>When a slot is unassigned (<strong>?</strong>), Torn shows <em>your personal preview CPR</em> in the top corner. The footer shows the OC's target <strong>Recommended Min CPR</strong> and adds a <strong>✓</strong> if you qualify:</p>
                        <div class="zem-demo-pill-row">
                            <span style="color:var(--zem-anchor-color); font-weight:700;">Imp: 37.9%</span>
                            <span class="zem-oc-fail-pill risk-low" style="margin:0;">80%+ ✓</span>
                        </div>
                    </div>
                    <div class="zem-guide-box" style="margin-bottom:0;">
                        <h4>2. Joined Member Slots</h4>
                        <p>Once a player joins, the card switches to their actual <strong>Slot Fail %</strong> (<code>100 - Member CPR</code>) colored by risk (<span style="color:#69db7c;">Green &le;15%</span>, <span style="color:#ffd43b;">Amber 16–25%</span>, <span style="color:#ff8787;">Red 26%+</span>):</p>
                        <div class="zem-demo-pill-row">
                            <span style="color:var(--zem-anchor-color); font-weight:700;">Imp: 27.5%</span>
                            <span class="zem-oc-fail-pill risk-med" style="margin:0;">Fail: 22%</span>
                        </div>
                    </div>
                </div>

                <div class="zem-guide-box" style="margin-bottom:0;">
                    <h4>3. Required Items: Kept vs. Used</h4>
                    <p>Items are automatically labeled in the <strong>Page OCs</strong> and <strong>All OCs</strong> tabs so you know whether an item is burned on execution:</p>
                    <p style="margin-top:6px;">
                        <span class="zem-item-tag zem-item-kept" style="margin-left:0;">Kept</span>
                        <strong>Reusable Tools:</strong> Lockpicks, Hand Drill, Wire/Bolt Cutters, Angle Grinder, Jemmy, Police Badge, DSLR Camera, RF Detector, Net, Cassock, Binoculars, Bone Saw, Cut-Throat Razor, Remote Detonator, China Lake.
                    </p>
                    <p style="margin-top:6px;">
                        <span class="zem-item-tag zem-item-used" style="margin-left:0;">Used</span>
                        <strong>Consumables:</strong> Zip Ties, ID Badge, ATM Key, Cell Phone, Core Drill, All Viruses, C4, Thermite, Shaped Charge, Flash/Smoke Grenades, Tear Gas, Nail Bomb, Syringe, Irradiated Blood Bag, Chloroform, Ipecac, PCP, Ecstasy, PSU, Hard Drive, Igniter Cord.
                    </p>
                </div>
            </div>

            <!-- TAB 4: SETTINGS -->
            <div class="zem-modal-body" id="zem-tab-settings" style="display:none;">
                <div class="zem-settings-card">
                    <div class="zem-setting-row">
                        <div>
                            <label>Anchor Role Highlight</label>
                            <span class="zem-setting-sub">Slots with 20.0% or higher impact weight</span>
                        </div>
                        <input type="color" id="zem-set-anchor-color" value="${settings.anchorColor}">
                    </div>
                    <div class="zem-setting-row">
                        <div>
                            <label>Secondary Role Highlight</label>
                            <span class="zem-setting-sub">Slots between 14.0% and 19.9% impact weight</span>
                        </div>
                        <input type="color" id="zem-set-sec-color" value="${settings.secondaryColor}">
                    </div>
                    <div class="zem-setting-row">
                        <div>
                            <label>Low Impact Role Highlight</label>
                            <span class="zem-setting-sub">Slots under 14.0% impact weight</span>
                        </div>
                        <input type="color" id="zem-set-low-color" value="${settings.lowColor}">
                    </div>
                    <div class="zem-setting-row">
                        <div>
                            <label>Show Role Impact % Badges</label>
                            <span class="zem-setting-sub">Display "Imp: X%" on the bottom-left of every slot</span>
                        </div>
                        <input type="checkbox" id="zem-set-show-badges" ${settings.showWeightBadges ? 'checked' : ''}>
                    </div>
                    <div class="zem-setting-row">
                        <div>
                            <label>Show Pass / Fail &amp; Rec CPR Badges</label>
                            <span class="zem-setting-sub">Display header Pass/Fail summary and slot risk badges</span>
                        </div>
                        <input type="checkbox" id="zem-set-show-fail" ${settings.showFailChances ? 'checked' : ''}>
                    </div>
                </div>

                <div class="zem-settings-card">
                    <div class="zem-setting-row">
                        <div>
                            <label>Script Version &amp; Updates</label>
                            <span id="zem-update-status" class="zem-setting-sub">Installed: v${SCRIPT_VERSION} (100% Verified DB)</span>
                        </div>
                        <button class="zem-btn" id="zem-btn-check-update">Check for Updates</button>
                    </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                    <button class="zem-btn" id="zem-btn-reset">Reset Default Colors</button>
                    <a href="https://www.torn.com/profiles.php?XID=4038551" target="_blank" class="zem-btn zem-dev-btn">Created by ZEM [4038551]</a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Smooth requestAnimationFrame Dragging Logic
        let isDragging = false;
        let hasMoved = false;
        let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
        let rafPending = false;
        let nextLeft = 0, nextTop = 0;

        btn.addEventListener('pointerdown', (e) => {
            isDragging = true;
            hasMoved = false;
            startX = e.clientX;
            startY = e.clientY;
            const rect = btn.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;
            btn.setPointerCapture(e.pointerId);
        });

        btn.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved = true;

            const maxLeft = window.innerWidth - btn.offsetWidth - 6;
            const maxTop = window.innerHeight - btn.offsetHeight - 6;
            nextLeft = Math.max(6, Math.min(maxLeft, initialLeft + dx));
            nextTop = Math.max(6, Math.min(maxTop, initialTop + dy));

            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(() => {
                    btn.style.left = `${nextLeft}px`;
                    btn.style.top = `${nextTop}px`;
                    rafPending = false;
                });
            }
        });

        btn.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            btn.releasePointerCapture(e.pointerId);

            if (hasMoved) {
                settings.btnPos = { top: btn.style.top, left: btn.style.left };
                saveSettings();
            } else {
                modal.classList.toggle('open');
                if (modal.classList.contains('open')) {
                    processAllCrimes();
                    renderLivePageOCs();
                    renderOCInfoList();
                }
            }
        });

        modal.querySelector('.zem-modal-close').addEventListener('click', () => modal.classList.remove('open'));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                modal.classList.remove('open');
            }
        });

        document.getElementById('zem-btn-refresh-live').addEventListener('click', () => {
            processAllCrimes(true);
            renderLivePageOCs();
        });

        document.getElementById('zem-btn-copy-open').addEventListener('click', copyOpenSlotsToClipboard);

        // Filter Pills in Page OCs Tab
        const filterPills = modal.querySelectorAll('.zem-filter-pill');
        filterPills.forEach(fp => {
            fp.addEventListener('click', () => {
                filterPills.forEach(p => p.classList.remove('active'));
                fp.classList.add('active');
                liveFilterMode = fp.dataset.filter;
                renderLivePageOCs();
            });
        });

        // Tabs
        const tabBtns = modal.querySelectorAll('.zem-tab-btn');
        const tabPanels = {
            live: document.getElementById('zem-tab-live'),
            database: document.getElementById('zem-tab-database'),
            guide: document.getElementById('zem-tab-guide'),
            settings: document.getElementById('zem-tab-settings')
        };

        tabBtns.forEach(tb => {
            tb.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tb.classList.add('active');
                Object.keys(tabPanels).forEach(k => {
                    tabPanels[k].style.display = (k === tb.dataset.tab) ? 'block' : 'none';
                });
                if (tb.dataset.tab === 'live') {
                    processAllCrimes();
                    renderLivePageOCs();
                } else if (tb.dataset.tab === 'database') {
                    renderOCInfoList();
                }
            });
        });

        // Settings Listeners
        document.getElementById('zem-set-anchor-color').addEventListener('input', (e) => {
            settings.anchorColor = e.target.value;
            saveSettings();
        });
        document.getElementById('zem-set-sec-color').addEventListener('input', (e) => {
            settings.secondaryColor = e.target.value;
            saveSettings();
        });
        document.getElementById('zem-set-low-color').addEventListener('input', (e) => {
            settings.lowColor = e.target.value;
            saveSettings();
        });
        document.getElementById('zem-set-show-badges').addEventListener('change', (e) => {
            settings.showWeightBadges = e.target.checked;
            saveSettings();
        });
        document.getElementById('zem-set-show-fail').addEventListener('change', (e) => {
            settings.showFailChances = e.target.checked;
            saveSettings();
            renderOCInfoList();
            renderLivePageOCs();
        });

        document.getElementById('zem-btn-check-update').addEventListener('click', checkForUpdates);

        document.getElementById('zem-btn-reset').addEventListener('click', () => {
            const currentPos = settings.btnPos;
            settings = { ...DEFAULT_SETTINGS, btnPos: currentPos };
            document.getElementById('zem-set-anchor-color').value = settings.anchorColor;
            document.getElementById('zem-set-sec-color').value = settings.secondaryColor;
            document.getElementById('zem-set-low-color').value = settings.lowColor;
            document.getElementById('zem-set-show-badges').checked = settings.showWeightBadges;
            document.getElementById('zem-set-show-fail').checked = settings.showFailChances;
            saveSettings();
        });

        document.getElementById('zem-info-search').addEventListener('input', () => renderOCInfoList());
        document.getElementById('zem-info-level').addEventListener('change', (e) => {
            dbLevelFilter = e.target.value;
            renderOCInfoList();
        });
    }

    function formatItemBadge(item, consumable) {
        if (!item) return '<span style="color:#6b7280;">—</span>';
        const badgeClass = consumable ? 'zem-item-used' : 'zem-item-kept';
        const badgeText = consumable ? 'Used' : 'Kept';
        return `${item} <span class="zem-item-tag ${badgeClass}">${badgeText}</span>`;
    }

    function renderLivePageOCs() {
        const container = document.getElementById('zem-live-oc-container');
        if (!container) return;

        if (!scannedPageOCs || scannedPageOCs.length === 0) {
            container.innerHTML = `
                <div class="zem-guide-box" style="text-align:center; padding:24px;">
                    <h4 style="justify-content:center;">No Active OCs Detected on Screen</h4>
                    <p>Make sure crimes are visible on the page behind this window, then click Refresh.</p>
                </div>
            `;
            return;
        }

        const totalOCs = scannedPageOCs.length;
        const planningCount = scannedPageOCs.filter(o => o.isAllFilled).length;
        const recruitingCount = totalOCs - planningCount;
        const totalSlots = scannedPageOCs.reduce((acc, o) => acc + o.totalSlotsCount, 0);
        const filledSlots = scannedPageOCs.reduce((acc, o) => acc + o.filledSlotsCount, 0);

        const ocsWithMembers = scannedPageOCs.filter(o => o.hasMembers && o.passRate !== null);
        const avgPassDisplay = ocsWithMembers.length > 0
            ? `${(ocsWithMembers.reduce((acc, o) => acc + o.passRate, 0) / ocsWithMembers.length).toFixed(1)}%`
            : '—';

        let html = `
            <div class="zem-kpi-grid">
                <div class="zem-kpi-box">
                    <div class="zem-kpi-val">${totalOCs}</div>
                    <div class="zem-kpi-lbl">Visible OCs</div>
                </div>
                <div class="zem-kpi-box">
                    <div class="zem-kpi-val" style="color:#38d9a9;">${planningCount} / ${recruitingCount}</div>
                    <div class="zem-kpi-lbl">Plan / Recruit</div>
                </div>
                <div class="zem-kpi-box">
                    <div class="zem-kpi-val">${filledSlots}/${totalSlots}</div>
                    <div class="zem-kpi-lbl">Slots Filled</div>
                </div>
                <div class="zem-kpi-box">
                    <div class="zem-kpi-val" style="color:#4ade80;">${avgPassDisplay}</div>
                    <div class="zem-kpi-lbl">Avg Pass Rate</div>
                </div>
            </div>
        `;

        const filteredOCs = scannedPageOCs.filter(oc => {
            if (liveFilterMode === 'recruiting') return !oc.isAllFilled;
            if (liveFilterMode === 'warnings') return oc.hasLowCPRWarning;
            return true;
        });

        if (filteredOCs.length === 0) {
            html += `
                <div class="zem-guide-box" style="text-align:center; padding:18px;">
                    <p>No crimes on the page match the selected filter.</p>
                </div>
            `;
            container.innerHTML = html;
            return;
        }

        filteredOCs.forEach(oc => {
            const statusClass = oc.isAllFilled ? 'zem-status-planning' : 'zem-status-recruiting';
            const rowsHtml = oc.slots.map(s => {
                const isAnchor = s.weight >= ANCHOR_MIN;
                const isSec = !isAnchor && s.weight >= SECONDARY_MIN;
                const roleColor = isAnchor ? settings.anchorColor : isSec ? settings.secondaryColor : settings.lowColor;

                const memberDisplay = s.isFilled
                    ? (s.playerXid
                        ? `<a href="https://www.torn.com/profiles.php?XID=${s.playerXid}" target="_blank" style="color:#e5e7eb; text-decoration:underline; font-weight:600;">${s.playerName}</a>`
                        : `<span style="color:#e5e7eb; font-weight:600;">${s.playerName}</span>`)
                    : `<span style="color:#fbbf24; font-weight:700;">OPEN SLOT</span>`;

                const recStr = s.recMinCPR > 0 ? `${s.recMinCPR}%+` : 'Any';
                let cprDisplay = '';
                if (s.isFilled && s.cpr !== null) {
                    const cprColor = s.riskClass === 'risk-high' ? '#ff8787' : s.riskClass === 'risk-med' ? '#ffd43b' : '#69db7c';
                    const warnTitle = s.isBelowRec ? ` title="Below OC Recommended Min CPR (${recStr})"` : ` title="Meets OC Recommended Min CPR (${recStr})"`;
                    cprDisplay = `<span style="color:${cprColor}; font-weight:700;"${warnTitle}>${s.cpr}%${s.isBelowRec ? ' ⚠' : ''} <span style="color:#6b7280; font-weight:400; font-size:10px;">(Rec ${recStr})</span></span>`;
                } else {
                    const youHint = s.userPreviewCPR !== null ? ` · You: ${s.userPreviewCPR}%` : '';
                    cprDisplay = `<span style="color:#60a5fa; font-weight:600;">Rec ${recStr}${youHint}</span>`;
                }

                const failColor = s.riskClass === 'risk-high' ? '#ff8787' : s.riskClass === 'risk-med' ? '#ffd43b' : '#69db7c';
                const failDisplay = s.weight === 0
                    ? `<span style="color:#69db7c;">0% (0.0%)</span>`
                    : (s.isFilled
                        ? `<span style="color:${failColor}; font-weight:700;">${s.slotFail.toFixed(0)}% (-${s.weightedFail.toFixed(1)}%)</span>`
                        : `<span style="color:#6b7280;">—</span>`);

                return `
                    <tr>
                        <td style="border-left: 3px solid ${roleColor}; font-weight:700; color:${roleColor} !important;">${s.roleName}</td>
                        <td>${memberDisplay}</td>
                        <td style="font-weight:700;">${s.weight.toFixed(1)}%</td>
                        <td>${cprDisplay}</td>
                        <td>${failDisplay}</td>
                        <td>${formatItemBadge(s.item, s.consumable)}</td>
                    </tr>
                `;
            }).join('');

            const passColor = oc.passRate < 75 ? '#ff8787' : oc.passRate < 85 ? '#ffd43b' : '#4ade80';
            const passFailSummaryHtml = oc.hasMembers
                ? `<span style="color:${passColor};">${oc.isAllFilled ? '' : 'Est. '}Pass: ${oc.passRate.toFixed(1)}%</span>
                   <span style="color:#374151;"> | </span>
                   <span style="color:#f87171;">Fail: ${oc.failRate.toFixed(1)}%</span>`
                : `<span style="color:#6b7280;">No members joined yet</span>`;

            html += `
                <div class="zem-live-card">
                    <div class="zem-live-header">
                        <div>
                            <strong style="font-size:13.5px; color:#f9fafb;">${oc.ocName}</strong>
                            <span class="zem-level-badge" style="margin-left:6px;">Lv ${oc.level}</span>
                            <span class="zem-status-badge ${statusClass}" style="margin-left:6px;">${oc.status} (${oc.filledSlotsCount}/${oc.totalSlotsCount})</span>
                        </div>
                        <div style="font-size:11.5px; font-weight:700;">
                            <span style="color:#9ca3af; margin-right:8px;">⏱ ${oc.timer}</span>
                            ${passFailSummaryHtml}
                        </div>
                    </div>
                    <table class="zem-live-table">
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Member</th>
                                <th>Impact</th>
                                <th>CPR / Rec Min</th>
                                <th>Fail (-OC%)</th>
                                <th>Req. Item</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    function renderOCInfoList() {
        const container = document.getElementById('zem-info-list-container');
        if (!container) return;

        const query = (document.getElementById('zem-info-search')?.value || '').toLowerCase().trim();
        const entries = Object.values(normalizedDB)
            .filter(oc => !oc.isAlias)
            .sort((a, b) => a.level - b.level);

        const cardsHtml = [];

        entries.forEach(oc => {
            if (dbLevelFilter !== 'all' && String(oc.level) !== dbLevelFilter) return;

            const ocName = oc.displayName;
            const levelStr = `lv ${oc.level} level ${oc.level}`;
            const sortedRoles = Object.values(oc.roles).sort((a, b) => b.weight - a.weight);

            const matchesOC = ocName.toLowerCase().includes(query) || levelStr.includes(query);
            const matchesRoleOrItem = sortedRoles.some(r => {
                const usageTag = r.item ? (r.consumable ? 'used consumable' : 'kept reusable') : 'no item';
                return (
                    r.displayName.toLowerCase().includes(query) ||
                    (r.item && r.item.toLowerCase().includes(query)) ||
                    usageTag.includes(query)
                );
            });
            if (query && !matchesOC && !matchesRoleOrItem) return;

            const rolesHtml = sortedRoles.map(r => {
                const isAnchor = r.weight >= ANCHOR_MIN;
                const isSec = !isAnchor && r.weight >= SECONDARY_MIN;
                const color = isAnchor ? settings.anchorColor : isSec ? settings.secondaryColor : settings.lowColor;
                const itemLabel = r.item ? formatItemBadge(r.item, r.consumable) : '<span style="color:#6b7280;">No item</span>';
                const recLabel = r.recMinCPR > 0 ? `Rec: ${r.recMinCPR}%+` : 'Rec: Any CPR';
                const failAt75 = (25 * (r.weight / 100)).toFixed(1);
                const failHtml = settings.showFailChances
                    ? (r.weight === 0
                        ? `<span style="color:#4ade80; font-weight:600;">0% Risk (Any CPR)</span>`
                        : `<span style="color:#60a5fa; font-weight:600;" title="OC Recommended Min CPR: ${recLabel} | A 75% CPR player here adds -${failAt75}% fail risk">${recLabel} <span style="color:#f87171;">(-${failAt75}% @75)</span></span>`)
                    : '';

                return `
                    <div class="zem-info-role-item" style="border-left: 3px solid ${color};">
                        <div class="zem-info-role-top">
                            <span style="color:#e5e7eb; font-weight:700;">${r.displayName}</span>
                            <strong style="color:${color}">Impact: ${r.weight.toFixed(1)}%</strong>
                        </div>
                        <div class="zem-info-role-sub">
                            <span>${itemLabel}</span>
                            ${failHtml}
                        </div>
                    </div>
                `;
            }).join('');

            cardsHtml.push(`
                <div class="zem-info-card">
                    <div class="zem-info-title">
                        <span>${ocName}</span>
                        <span class="zem-level-badge">Lv ${oc.level} (${sortedRoles.length}p • ${oc.totalWeight.toFixed(1)}%)</span>
                    </div>
                    <div class="zem-info-roles-grid">${rolesHtml}</div>
                </div>
            `);
        });

        container.innerHTML = cardsHtml.length > 0
            ? cardsHtml.join('')
            : `<div class="zem-guide-box" style="text-align:center; padding:18px;"><p>No crimes match your search or level filter.</p></div>`;
    }

    // =========================================================================
    // 7. LIFECYCLE & IDLE-AWARE OBSERVER
    // =========================================================================
    function syncVisibilityAndObserver() {
        const active = isOCTabActive();
        const btn = document.getElementById('zem-oc-float-btn');
        const modal = document.getElementById('zem-oc-modal');

        if (active) {
            if (!uiBuilt) buildUI();
            if (btn) btn.style.display = 'flex';
            processAllCrimes();

            if (!observer) {
                const observeRoot = document.querySelector('#factions, #mainContainer') || document.body;
                observer = new MutationObserver((mutations) => {
                    if (!isOCTabActive() || isProcessingDOM) return;

                    const isRelevantChange = mutations.some(m => {
                        if (m.type !== 'childList') return false;
                        const target = m.target;
                        if (!target || !(target instanceof Element)) return false;
                        return !target.closest('#zem-oc-modal, #zem-oc-float-btn, .zem-oc-slot-footer, .zem-oc-header-summary');
                    });

                    if (!isRelevantChange) return;

                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        processAllCrimes();
                    }, 120);
                });
                observer.observe(observeRoot, { childList: true, subtree: true });
            }
        } else {
            if (btn) btn.style.display = 'none';
            if (modal) modal.classList.remove('open');
        }
    }

    buildNormalizedDB();
    syncVisibilityAndObserver();
    window.addEventListener('hashchange', syncVisibilityAndObserver);
    window.addEventListener('popstate', syncVisibilityAndObserver);
})();
